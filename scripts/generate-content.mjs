import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const LIST_LIMIT = 100;
const TEST_CONTENT_ID_PREFIX = "microcms-display-test-";
const OUTPUT_PATH = resolve(process.cwd(), ".generated/content.json");
const FALLBACK_REGIONS_PATH = resolve(process.cwd(), "data/regions.json");

export function microCMSApiUrl(domain, endpoint) {
  const validDomain = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(domain);
  const validEndpoint = /^[a-z0-9-]+$/.test(endpoint);
  if (!validDomain || !validEndpoint) return null;
  return new URL(`https://${domain}.microcms.io/api/v1/${endpoint}`);
}

export async function fetchMicroCMSList(
  endpoint,
  { serviceDomain, apiKey, fetcher = fetch, allowMissing = false },
) {
  const baseUrl = microCMSApiUrl(serviceDomain, endpoint);
  if (!baseUrl) throw new Error(`microCMS configuration is invalid for ${endpoint}`);

  const contents = [];
  let offset = 0;
  let expectedTotalCount = null;

  while (true) {
    const url = new URL(baseUrl);
    url.searchParams.set("limit", String(LIST_LIMIT));
    url.searchParams.set("offset", String(offset));
    const response = await fetcher(url, {
      headers: { "X-MICROCMS-API-KEY": apiKey },
    });

    if (allowMissing && response.status === 404) return null;
    if (!response.ok)
      throw new Error(`microCMS request failed: ${endpoint} (HTTP ${response.status})`);

    const data = await response.json();
    const valid =
      data &&
      !Array.isArray(data) &&
      Array.isArray(data.contents) &&
      Number.isSafeInteger(data.totalCount) &&
      data.totalCount >= 0 &&
      (expectedTotalCount === null || data.totalCount === expectedTotalCount) &&
      data.offset === offset &&
      Number.isSafeInteger(data.limit) &&
      data.limit > 0 &&
      data.limit <= LIST_LIMIT &&
      data.contents.length <= data.limit &&
      data.offset + data.contents.length <= data.totalCount &&
      (data.offset + data.contents.length >= data.totalCount ||
        data.contents.length === data.limit);
    if (!valid) throw new Error(`microCMS pagination metadata invalid: ${endpoint}`);

    expectedTotalCount ??= data.totalCount;
    contents.push(...data.contents);
    if (contents.length >= data.totalCount) return contents;
    offset += data.limit;
  }
}

function requireText(source, field, id) {
  const value = source[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`spot ${id}: ${field} is required`);
  }
  return value.trim();
}

export function resolveSpot(source, regions) {
  const id = requireText(source, "id", "(unknown)");
  const prefecture = requireText(source, "prefecture", id);
  const municipality = requireText(source, "municipality", id);
  const prefectureRegion = regions.find(
    (region) => region.type === "prefecture" && region.name === prefecture,
  );
  if (!prefectureRegion) throw new Error(`spot ${id}: unknown prefecture ${prefecture}`);

  const municipalityRegion = regions.find(
    (region) =>
      region.type === "municipality" &&
      region.name === municipality &&
      region.parentSlug === prefectureRegion.slug,
  );
  if (!municipalityRegion) {
    throw new Error(`spot ${id}: unknown municipality ${prefecture} ${municipality}`);
  }

  return {
    title: requireText(source, "title", id),
    slug: id,
    prefecture,
    prefectureSlug: prefectureRegion.slug,
    municipality,
    municipalitySlug: municipalityRegion.slug,
    genreName: requireText(source, "genreName", id),
    body: requireText(source, "body", id),
    visitedAt: requireText(source, "visitedAt", id).slice(0, 10),
    coordinates: null,
    googlePlaceId: null,
  };
}

function normalizedName(value) {
  return value.normalize("NFKC").replaceAll(/\s+/g, "").toLocaleLowerCase("ja");
}

export function selectPlaceCandidate(places, spot) {
  const addressMatches = places.filter((place) => {
    const address = place.formattedAddress;
    const latitude = place.location?.latitude;
    const longitude = place.location?.longitude;
    return (
      typeof address === "string" &&
      address.includes(spot.prefecture) &&
      address.includes(spot.municipality) &&
      Number.isFinite(latitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      Number.isFinite(longitude) &&
      longitude >= -180 &&
      longitude <= 180
    );
  });
  const exactNameMatches = addressMatches.filter(
    (place) =>
      typeof place.displayName?.text === "string" &&
      normalizedName(place.displayName.text) === normalizedName(spot.title),
  );
  return exactNameMatches[0] ?? addressMatches[0] ?? null;
}

export async function geocodeSpot(spot, { apiKey, fetcher = fetch }) {
  if (!apiKey) return null;
  const response = await fetcher("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location",
    },
    body: JSON.stringify({
      textQuery: `${spot.title} ${spot.municipality} ${spot.prefecture}`,
      languageCode: "ja",
      regionCode: "JP",
      maxResultCount: 5,
    }),
  });
  if (!response.ok) throw new Error(`Google Places request failed (HTTP ${response.status})`);
  const data = await response.json();
  const candidate = selectPlaceCandidate(Array.isArray(data.places) ? data.places : [], spot);
  if (!candidate) return null;
  return {
    coordinates: {
      latitude: candidate.location.latitude,
      longitude: candidate.location.longitude,
    },
    googlePlaceId: typeof candidate.id === "string" && candidate.id !== "" ? candidate.id : null,
  };
}

async function loadFallbackRegions() {
  return JSON.parse(await readFile(FALLBACK_REGIONS_PATH, "utf8"));
}

async function writeGeneratedContent(content, outputPath = OUTPUT_PATH) {
  await mkdir(dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  await rename(temporaryPath, outputPath);
}

export async function generateContent({
  env = process.env,
  fetcher = fetch,
  outputPath = OUTPUT_PATH,
} = {}) {
  const serviceDomain = env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = env.MICROCMS_API_KEY;
  if (Boolean(serviceDomain) !== Boolean(apiKey)) {
    throw new Error("MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY must both be set");
  }
  if (env.VERCEL_ENV === "production" && (!serviceDomain || !apiKey)) {
    throw new Error("microCMS credentials are required in production");
  }
  if (env.VERCEL_ENV === "production" && !env.GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY is required in production");
  }
  if (env.VERCEL_ENV === "production" && !env.GOOGLE_MAPS_EMBED_API_KEY) {
    throw new Error("GOOGLE_MAPS_EMBED_API_KEY is required in production");
  }

  const fallbackRegions = await loadFallbackRegions();
  if (!serviceDomain && !apiKey) {
    const content = { schemaVersion: 1, spots: [], regions: fallbackRegions };
    await writeGeneratedContent(content, outputPath);
    return content;
  }

  const [cmsSpots, cmsRegions] = await Promise.all([
    fetchMicroCMSList("spots", { serviceDomain, apiKey, fetcher }),
    fetchMicroCMSList("regions", { serviceDomain, apiKey, fetcher, allowMissing: true }),
  ]);
  const regions = cmsRegions ?? fallbackRegions;
  const includeTestContent = env.VERCEL_ENV !== "production";
  const resolvedSpots = cmsSpots
    .filter((spot) => includeTestContent || !spot.id?.startsWith(TEST_CONTENT_ID_PREFIX))
    .map((spot) => resolveSpot(spot, regions));

  const spots = [];
  for (const spot of resolvedSpots) {
    try {
      const place = await geocodeSpot(spot, {
        apiKey: env.GOOGLE_MAPS_API_KEY,
        fetcher,
      });
      if (!place) {
        console.warn(
          `No coordinates found for ${spot.slug}; article will be published without a map pin.`,
        );
      }
      spots.push(place ? { ...spot, ...place } : spot);
    } catch (error) {
      console.warn(
        `${error instanceof Error ? error.message : String(error)} for ${spot.slug}; article will be published without a map pin.`,
      );
      spots.push(spot);
    }
  }

  const content = { schemaVersion: 1, spots, regions };
  await writeGeneratedContent(content, outputPath);
  return content;
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  try {
    const content = await generateContent();
    console.log(`Generated ${content.spots.length} spots and ${content.regions.length} regions.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
