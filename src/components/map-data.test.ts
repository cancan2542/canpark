import { describe, expect, it } from "vitest";
import {
  JAPAN_VIEW_BOX,
  MAP_PROJECTION,
  PREFECTURE_MAP_DATA,
  projectMapCoordinates,
} from "@/components/map-data";

describe("prefecture map data", () => {
  it("contains one unique SVG boundary for every prefecture", () => {
    expect(PREFECTURE_MAP_DATA).toHaveLength(47);
    expect(new Set(PREFECTURE_MAP_DATA.map(({ code }) => code)).size).toBe(47);
    expect(new Set(PREFECTURE_MAP_DATA.map(({ slug }) => slug)).size).toBe(47);
    expect(PREFECTURE_MAP_DATA.every(({ path }) => path.startsWith("M") && path.endsWith("Z"))).toBe(true);
    expect(JAPAN_VIEW_BOX.split(" ").map(Number)).toHaveLength(4);
  });

  it("uses the same deterministic projection as the generated boundaries", () => {
    expect(projectMapCoordinates(MAP_PROJECTION.originLongitude, MAP_PROJECTION.originLatitude)).toEqual([0, 0]);
    const [x, y] = projectMapCoordinates(138.7246, 35.5082);
    expect(x).toBeCloseTo(1335.69, 1);
    expect(y).toBeCloseTo(1049.18, 1);
  });
});
