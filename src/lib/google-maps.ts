const GOOGLE_MAPS_EMBED_ENDPOINT = "https://www.google.com/maps/embed/v1/place";

export function getGoogleMapsEmbedUrl(
  placeId: string | null,
  apiKey: string | undefined,
): string | null {
  if (!placeId || !apiKey) return null;

  const url = new URL(GOOGLE_MAPS_EMBED_ENDPOINT);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", `place_id:${placeId}`);
  url.searchParams.set("language", "ja");
  url.searchParams.set("region", "jp");
  return url.toString();
}
