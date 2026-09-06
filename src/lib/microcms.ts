export type MicroCMSConfig = {
  serviceDomain?: string;
  apiKey?: string;
};

export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

type MicroCMSListResponse<T> = {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
};

const MICROCMS_LIST_LIMIT = 100;

type FetchMicroCMSListOptions = {
  config: MicroCMSConfig;
  fetcher?: FetchLike;
  allowMissing?: boolean;
};

export function microCMSApiUrl(domain: string, endpoint: string): URL | null {
  const validDomain = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(domain);
  const validEndpoint = /^[a-z0-9-]+$/.test(endpoint);
  if (!validDomain || !validEndpoint) return null;

  return new URL(`https://${domain}.microcms.io/api/v1/${endpoint}`);
}

export async function fetchMicroCMSList<T>(
  endpoint: string,
  {
    config,
    fetcher = globalThis.fetch,
    allowMissing = false,
  }: FetchMicroCMSListOptions,
): Promise<T[] | null> {
  if (!config.serviceDomain || !config.apiKey) return null;

  const url = microCMSApiUrl(config.serviceDomain, endpoint);
  if (!url) return null;

  const contents: T[] = [];
  let offset = 0;

  while (true) {
    const pageUrl = new URL(url);
    pageUrl.searchParams.set("limit", String(MICROCMS_LIST_LIMIT));
    pageUrl.searchParams.set("offset", String(offset));

    const response = await fetcher(pageUrl, {
      method: "GET",
      headers: {
        "X-MICROCMS-API-KEY": config.apiKey,
      },
    });

    if (allowMissing && response.status === 404) return null;

    if (!response.ok) {
      throw new Error(`microCMS request failed: ${endpoint}`);
    }

    const data = (await response.json()) as MicroCMSListResponse<T>;
    const hasValidPagination =
      Array.isArray(data.contents) &&
      Number.isSafeInteger(data.totalCount) &&
      data.totalCount >= 0 &&
      Number.isSafeInteger(data.offset) &&
      data.offset === offset &&
      Number.isSafeInteger(data.limit) &&
      data.limit > 0 &&
      data.limit <= MICROCMS_LIST_LIMIT &&
      data.contents.length <= data.limit &&
      data.offset + data.contents.length <= data.totalCount &&
      (data.offset + data.contents.length >= data.totalCount ||
        data.contents.length === data.limit);

    if (!hasValidPagination) {
      throw new Error(`microCMS pagination metadata invalid: ${endpoint}`);
    }

    contents.push(...data.contents);

    if (contents.length >= data.totalCount) return contents;
    if (data.contents.length === 0) {
      throw new Error(`microCMS pagination metadata invalid: ${endpoint}`);
    }

    offset += data.limit;
  }
}
