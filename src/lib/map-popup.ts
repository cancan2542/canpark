import type { MapSpot } from "@/types/content";

type PopupSpot = Pick<MapSpot, "title" | "prefecture" | "municipality">;

export function createMapPopupContent(spot: PopupSpot): HTMLDivElement {
  const content = document.createElement("div");
  const title = document.createElement("strong");

  title.textContent = spot.title;
  content.append(title, document.createElement("br"));
  content.append(document.createTextNode(`${spot.prefecture} ${spot.municipality}`));

  return content;
}
