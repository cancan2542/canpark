import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HazardRatings } from "@/components/HazardRatings";

describe("HazardRatings", () => {
  it("renders all core hazard categories", () => {
    render(
      <HazardRatings
        hazards={{
          flood: 3,
          landslide: 4,
          tsunami: "not_applicable",
          stormSurge: "unknown",
        }}
      />,
    );

    expect(screen.getByText("洪水")).toBeInTheDocument();
    expect(screen.getByText("土砂災害")).toBeInTheDocument();
    expect(screen.getByText("津波")).toBeInTheDocument();
    expect(screen.getByText("高潮")).toBeInTheDocument();
    expect(screen.getByText("3 注意")).toBeInTheDocument();
    expect(screen.getByText("未確認")).toBeInTheDocument();
  });
});
