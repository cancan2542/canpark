import { describe, expect, it } from "vitest";
import { createMapPopupContent } from "@/lib/map-popup";

describe("createMapPopupContent", () => {
  it("treats CMS values as text instead of executable HTML", () => {
    const content = createMapPopupContent({
      title: '<img src="x" onerror="alert(1)">',
      prefecture: "<script>alert(2)</script>",
      municipality: '<a href="javascript:alert(3)">市</a>',
    });

    expect(content.querySelector("img, script, a")).toBeNull();
    expect(content.querySelector("strong")).toHaveTextContent('<img src="x" onerror="alert(1)">');
    expect(content).toHaveTextContent("<script>alert(2)</script>");
    expect(content).toHaveTextContent('<a href="javascript:alert(3)">市</a>');
  });
});
