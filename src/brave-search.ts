export interface BraveSearchResult {
  company_name: string;
  website: string;
  description: string;
}

const BRAVE_API_URL = "https://api.search.brave.com/res/v1/web/search";

/**
 * Search for businesses using the Brave Search API.
 * Falls back gracefully — returns an empty array if the API key is missing
 * or any error occurs, so callers can fall back to simulated data.
 */
export async function searchBusinesses(
  query: string,
  count: number = 10,
): Promise<BraveSearchResult[]> {
  const apiKey = process.env.BRAVE_API_KEY;

  if (!apiKey) {
    return [];
  }

  try {
    const url = `${BRAVE_API_URL}?q=${encodeURIComponent(query)}&count=${count}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
    });

    if (!response.ok) {
      console.error(
        `Brave Search API error: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const data = (await response.json()) as {
      web?: { results?: Array<{ title: string; url: string; description: string }> };
    };

    const results = data.web?.results;
    if (!results || results.length === 0) {
      return [];
    }

    return results.map((r) => ({
      company_name: r.title,
      website: r.url,
      description: r.description,
    }));
  } catch (err) {
    console.error("Brave Search API request failed:", err);
    return [];
  }
}
