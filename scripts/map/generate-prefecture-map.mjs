#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const SOURCE_SHA256 = "c823cde901bb077cd3f861632bbcdd3676283d9e6f30c76b0d0fab330ebf157e";
const SOURCE_URL =
  "https://geo.maderaojen.me/datasets/jp-prefectures/releases/v1/2026-08-04.1/data.geojson";
const OUTPUT_PATH = resolve("src/components/map-data.ts");
const TOLERANCE = 0.45;
const SCALE = 100;
const COS_LATITUDE = Math.cos((37 * Math.PI) / 180);

const slugByCode = {
  "01": "hokkaido", "02": "aomori", "03": "iwate", "04": "miyagi", "05": "akita",
  "06": "yamagata", "07": "fukushima", "08": "ibaraki", "09": "tochigi", "10": "gunma",
  "11": "saitama", "12": "chiba", "13": "tokyo", "14": "kanagawa", "15": "niigata",
  "16": "toyama", "17": "ishikawa", "18": "fukui", "19": "yamanashi", "20": "nagano",
  "21": "gifu", "22": "shizuoka", "23": "aichi", "24": "mie", "25": "shiga",
  "26": "kyoto", "27": "osaka", "28": "hyogo", "29": "nara", "30": "wakayama",
  "31": "tottori", "32": "shimane", "33": "okayama", "34": "hiroshima", "35": "yamaguchi",
  "36": "tokushima", "37": "kagawa", "38": "ehime", "39": "kochi", "40": "fukuoka",
  "41": "saga", "42": "nagasaki", "43": "kumamoto", "44": "oita", "45": "miyazaki",
  "46": "kagoshima", "47": "okinawa",
};

function usage() {
  console.error("Usage: node scripts/map/generate-prefecture-map.mjs --input /path/to/data.geojson");
  process.exit(2);
}

const inputIndex = process.argv.indexOf("--input");
if (inputIndex < 0 || !process.argv[inputIndex + 1]) usage();

function project([longitude, latitude]) {
  return [(longitude - 122) * SCALE * COS_LATITUDE, (46 - latitude) * SCALE];
}

function perpendicularDistance(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  if (dx === 0 && dy === 0) return Math.hypot(point[0] - start[0], point[1] - start[1]);
  const t = Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point[0] - (start[0] + t * dx), point[1] - (start[1] + t * dy));
}

function simplify(points, tolerance) {
  if (points.length <= 4) return points;
  const open = points.slice(0, -1);
  const keep = new Uint8Array(open.length);
  keep[0] = 1;
  keep[open.length - 1] = 1;
  const stack = [[0, open.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop();
    let farthest = 0;
    let index = -1;
    for (let i = start + 1; i < end; i += 1) {
      const distance = perpendicularDistance(open[i], open[start], open[end]);
      if (distance > farthest) {
        farthest = distance;
        index = i;
      }
    }
    if (index >= 0 && farthest > tolerance) {
      keep[index] = 1;
      stack.push([start, index], [index, end]);
    }
  }
  const result = open.filter((_, index) => keep[index]);
  result.push(result[0]);
  return result;
}

function ringArea(points) {
  let area = 0;
  for (let i = 1; i < points.length; i += 1) {
    area += points[i - 1][0] * points[i][1] - points[i][0] * points[i - 1][1];
  }
  return Math.abs(area / 2);
}

function number(value) {
  return Number(value.toFixed(1));
}

function pathFromGeometry(geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const paths = [];
  for (const polygon of polygons) {
    for (const ring of polygon) {
      const projected = ring.map(project);
      // Sub-pixel islets cannot be selected and make the output disproportionately large.
      if (ringArea(projected) < 0.18) continue;
      const points = simplify(projected, TOLERANCE);
      if (points.length < 4) continue;
      paths.push(`M${points.map(([x, y]) => `${number(x)} ${number(y)}`).join("L")}Z`);
    }
  }
  return paths.join("");
}

function pathBounds(path) {
  const values = [...path.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  const xs = values.filter((_, index) => index % 2 === 0);
  const ys = values.filter((_, index) => index % 2 === 1);
  return {
    minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys),
  };
}

function paddedViewBox(bounds) {
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const padding = Math.max(width, height) * 0.08;
  return [bounds.minX - padding, bounds.minY - padding, width + padding * 2, height + padding * 2].map(number).join(" ");
}

function representativeBounds(geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const outerRings = polygons.map((polygon) => polygon[0].map(project));
  const ring = outerRings.reduce((largest, candidate) =>
    ringArea(candidate) > ringArea(largest) ? candidate : largest,
  );
  const xs = ring.map(([x]) => x);
  const ys = ring.map(([, y]) => y);
  return {
    minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys),
  };
}

const inputPath = resolve(process.argv[inputIndex + 1]);
const source = await readFile(inputPath);
const actualSha256 = createHash("sha256").update(source).digest("hex");
if (actualSha256 !== SOURCE_SHA256) {
  throw new Error(`Source checksum mismatch: expected ${SOURCE_SHA256}, received ${actualSha256}`);
}

const collection = JSON.parse(source.toString("utf8"));
const prefectures = collection.features.map((feature) => {
  const code = feature.properties.PREF_CODE;
  const slug = slugByCode[code];
  if (!slug) throw new Error(`Unknown prefecture code: ${code}`);
  const path = pathFromGeometry(feature.geometry);
  const bounds = pathBounds(path);
  const labelBounds = representativeBounds(feature.geometry);
  return {
    code,
    slug,
    name: feature.properties.N03_001,
    path,
    viewBox: paddedViewBox(bounds),
    labelX: number((labelBounds.minX + labelBounds.maxX) / 2),
    labelY: number((labelBounds.minY + labelBounds.maxY) / 2),
  };
});

if (prefectures.length !== 47) throw new Error(`Expected 47 prefectures, received ${prefectures.length}`);

const output = `// Generated by scripts/map/generate-prefecture-map.mjs. Do not edit manually.
// Source: ${SOURCE_URL}
// Source SHA-256: ${SOURCE_SHA256}
// Derived from MLIT National Land Numerical Information (Administrative Area, 2026), CC BY 4.0.

export const MAP_PROJECTION = { originLongitude: 122, originLatitude: 46, scale: ${SCALE}, cosineLatitude: ${COS_LATITUDE} } as const;
// Geographic extent from Okinawa to Hokkaido. Very remote Pacific islands are clipped intentionally.
export const JAPAN_VIEW_BOX = "0 -50 2050 2300";
export const PREFECTURE_MAP_DATA = ${JSON.stringify(prefectures)} as const;

export function projectMapCoordinates(longitude: number, latitude: number): readonly [number, number] {
  return [
    (longitude - MAP_PROJECTION.originLongitude) * MAP_PROJECTION.scale * MAP_PROJECTION.cosineLatitude,
    (MAP_PROJECTION.originLatitude - latitude) * MAP_PROJECTION.scale,
  ];
}
`;

await writeFile(OUTPUT_PATH, output, "utf8");
console.log(`Generated ${OUTPUT_PATH} (${Buffer.byteLength(output).toLocaleString()} bytes)`);
