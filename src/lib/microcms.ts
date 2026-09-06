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
};

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

  const response = await fetcher(url, {
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
  return data.contents;
}
