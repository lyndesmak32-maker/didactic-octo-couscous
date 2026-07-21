export interface BraveSearchResult {
  company_name: string;
  website: string;
  description: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/**
 * Search for businesses using the free OpenStreetMap Nominatim API.
 * No API key required. Falls back gracefully — returns an empty array
 * on any error so callers can fall back to simulated data.
 */
export async function searchBusinesses(
  query: string,
  count: number = 10,
): Promise<BraveSearchResult[]> {
  try {
    const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=${count}&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "LeadFlow/1.0 (lead-generation-app)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `Nominatim API error: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const data = (await response.json()) as Array<{
      name?: string;
      display_name: string;
      addresstype?: string;
      address?: Record<string, string>;
    }>;

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data
      .filter((r) => {
        // Filter out results with no name or generic type-only names
        const name = r.name?.trim();
        if (!name) return false;
        // Filter out names that are just the addresstype (e.g. "Restaurant", "Dentist")
        if (r.addresstype && name.toLowerCase() === r.addresstype.toLowerCase())
          return false;
        return true;
      })
      .map((r) => {
      // Use the name field if available, otherwise extract from display_name
      const companyName =
        r.name && r.name.trim()
          ? r.name
          : r.display_name.split(",")[0].trim();

      // Build a description from the address
      const parts: string[] = [];
      if (r.address) {
        if (r.address.road) parts.push(r.address.road);
        if (r.address.city || r.address.town || r.address.village)
          parts.push(r.address.city || r.address.town || r.address.village);
        if (r.address.state) parts.push(r.address.state);
      }
      const description =
        parts.length > 0 ? parts.join(", ") : r.display_name;

      return {
        company_name: companyName,
        website: "",
        description,
      };
    });
  } catch (err) {
    console.error("Nominatim API request failed:", err);
    return [];
  }
}
