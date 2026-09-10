import { describe, expect, it } from "vitest";
import { getGoogleMapsEmbedUrl } from "@/lib/google-maps";

describe("getGoogleMapsEmbedUrl", () => {
  it("builds an encoded place-mode URL", () => {
    const url = new URL(getGoogleMapsEmbedUrl("ChIJ/example", "embed key") ?? "");

    expect(url.origin + url.pathname).toBe("https://www.google.com/maps/embed/v1/place");
    expect(url.searchParams.get("key")).toBe("embed key");
    expect(url.searchParams.get("q")).toBe("place_id:ChIJ/example");
    expect(url.searchParams.get("language")).toBe("ja");
    expect(url.searchParams.get("region")).toBe("jp");
  });

  it("omits the embed when its place ID or API key is unavailable", () => {
    expect(getGoogleMapsEmbedUrl(null, "key")).toBeNull();
    expect(getGoogleMapsEmbedUrl("ChIJexample", undefined)).toBeNull();
    expect(getGoogleMapsEmbedUrl("ChIJexample", "")).toBeNull();
  });
});
