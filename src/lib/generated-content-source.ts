import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { ContentSource } from "@/lib/content-repository";
import type { Region, Spot } from "@/types/content";

type GeneratedContent = {
  schemaVersion: 1;
  spots: Spot[];
  regions: Region[];
};

let contentPromise: Promise<GeneratedContent | null> | undefined;

async function readGeneratedContent(): Promise<GeneratedContent | null> {
  try {
    const source = await readFile(resolve(process.cwd(), ".generated/content.json"), "utf8");
    const content = JSON.parse(source) as Partial<GeneratedContent>;
    if (
      content.schemaVersion !== 1 ||
      !Array.isArray(content.spots) ||
      !Array.isArray(content.regions)
    ) {
      throw new Error("Generated content has an unsupported format");
    }
    return content as GeneratedContent;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export function createGeneratedContentSource(): ContentSource {
  const load = () => (contentPromise ??= readGeneratedContent());
  return {
    async loadSpots() {
      return (await load())?.spots ?? null;
    },
    async loadRegions() {
      return (await load())?.regions ?? null;
    },
  };
}
