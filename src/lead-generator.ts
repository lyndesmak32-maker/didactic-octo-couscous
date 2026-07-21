export interface Lead {
  company_name: string;
  industry: string;
  contact_name: string;
  email: string;
  phone: string;
  source: string;
  score: number;
  business_type: string;
  status: string;
  created_at: string;
}

const FIRST_NAMES = [
  "James", "Maria", "David", "Sarah", "Michael", "Jennifer", "Robert", "Lisa",
  "William", "Emily", "Daniel", "Jessica", "Christopher", "Amanda", "Matthew",
  "Ashley", "Andrew", "Melissa", "Joshua", "Nicole", "Ryan", "Stephanie",
  "Brandon", "Heather", "Justin", "Rachel", "Kevin", "Laura", "Brian", "Kimberly",
];

const LAST_NAMES = [
  "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson",
  "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee",
  "Thompson", "White", "Harris", "Clark", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright",
];

const SOURCES = ["LinkedIn", "Google Maps", "Yelp", "Industry Directory", "Trade Show"];

const INDUSTRY_KEYWORDS: Record<string, { industry: string; companies: string[] }> = {
  plumbing: {
    industry: "Home Services",
    companies: [
      "FlowRight Plumbing", "PipeMasters LLC", "AquaFix Services",
      "Precision Plumbing Co.", "DrainPro Solutions", "ClearWater Plumbing",
      "MainLine Services", "RapidRooter Inc.", "BlueStream Plumbing",
      "Heritage Pipe Works", "Summit Drain Experts", "Capital Plumbing Pros",
    ],
  },
  "marketing agency": {
    industry: "Marketing & Advertising",
    companies: [
      "GrowthHive Media", "BrandPulse Agency", "Elevate Digital",
      "Momentum Creative", "LeadSculpt Marketing", "Apex Branding Co.",
      "Catalyst Ads", "Narrative Digital", "Forge Media Group",
      "Skyline Promotions", "Vertex Marketing", "Ignite Brand Lab",
    ],
  },
  dentist: {
    industry: "Healthcare",
    companies: [
      "BrightSmile Dental", "Pearl Dental Group", "ClearView Orthodontics",
      "ComfortCare Dentistry", "Maple Ridge Dental", "Sunrise Family Dental",
      "Precision Bite Clinic", "Harmony Dental Arts", "Oakwood Dental Studio",
      "Riverside Smiles", "Elite Dental Partners", "Greenway Oral Care",
    ],
  },
  restaurant: {
    industry: "Food & Beverage",
    companies: [
      "Harvest Table Grill", "BlueFin Seafood", "Ember & Oak Kitchen",
      "The Golden Ladle", "Verde Cantina", "Saffron Bistro",
      "Iron Skillet Co.", "Bread & Barrel", "Coastal Catch House",
      "Midtown Eatery", "Fireside Tavern", "Rustic Spoon",
    ],
  },
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toCompanyDomain(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/llc|inc|co|group|services|solutions|pros|partners/g, "")
    .slice(0, 20)
    + ".com";
}

function generatePhone(): string {
  const area = randomInt(200, 999);
  const prefix = randomInt(200, 999);
  const line = randomInt(1000, 9999);
  return `(${area}) ${prefix}-${line}`;
}

function resolveIndustry(businessType: string): { industry: string; companies: string[] } {
  const lower = businessType.toLowerCase().trim();

  // Direct keyword match
  for (const [keyword, data] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (lower.includes(keyword)) return data;
  }

  // Partial matches
  if (lower.includes("plumb") || lower.includes("hvac") || lower.includes("electric") || lower.includes("roof"))
    return { industry: "Home Services", companies: [
      "ProFix Home Services", "AllTrade Contractors", "TrueNorth Maintenance",
      "ServiceFirst Group", "HomeGuard Solutions", "Peak Home Pros",
      "ReliableCraft Services", "Apex Home Repair", "SafeHouse Contracting",
      "Integrity Home Works", "StarBrite Services", "Cornerstone Repairs",
    ]};
  if (lower.includes("market") || lower.includes("advertis") || lower.includes("brand") || lower.includes("seo") || lower.includes("social"))
    return { industry: "Marketing & Advertising", companies: [
      "GrowthHive Media", "BrandPulse Agency", "Elevate Digital",
      "Momentum Creative", "LeadSculpt Marketing", "Apex Branding Co.",
      "Catalyst Ads", "Narrative Digital", "Forge Media Group",
      "Skyline Promotions", "Vertex Marketing", "Ignite Brand Lab",
    ]};
  if (lower.includes("med") || lower.includes("doctor") || lower.includes("clinic") || lower.includes("health") || lower.includes("dent"))
    return { industry: "Healthcare", companies: [
      "MedCore Associates", "WellPath Medical", "PrimeCare Clinic",
      "Phoenix Health Group", "Summit Medical Partners", "Horizon Wellness",
      "ClearView Diagnostics", "NorthStar Healthcare", "Atlas Medical Center",
      "VitalCare Physicians", "Bridgeside Clinic", "Cedar Health Services",
    ]};
  if (lower.includes("restaurant") || lower.includes("food") || lower.includes("cafe") || lower.includes("cater"))
    return { industry: "Food & Beverage", companies: [
      "Harvest Table Grill", "BlueFin Seafood", "Ember & Oak Kitchen",
      "The Golden Ladle", "Verde Cantina", "Saffron Bistro",
      "Iron Skillet Co.", "Bread & Barrel", "Coastal Catch House",
      "Midtown Eatery", "Fireside Tavern", "Rustic Spoon",
    ]};
  if (lower.includes("real estate") || lower.includes("realtor") || lower.includes("property"))
    return { industry: "Real Estate", companies: [
      "BridgePoint Realty", "Haven Properties", "Landmark Estates",
      "Crestview Real Estate", "Metro Living Group", "Peak Property Advisors",
      "BlueSky Realty", "Cornerstone Homes", "HarborView Properties",
      "Summit Land Group", "Gateway Real Estate", "Heritage Home Partners",
    ]};
  if (lower.includes("law") || lower.includes("legal") || lower.includes("attorney"))
    return { industry: "Legal Services", companies: [
      "Meridian Law Group", "BridgePoint Legal", "Crawford & Associates",
      "Summit Law Partners", "Heritage Counsel", "Pinnacle Legal Advisors",
      "NorthStar Attorneys", "ClearView Law Firm", "Harbor Law Offices",
      "Atlas Legal Services", "Cornerstone Counsel", "Phoenix Law Partners",
    ]};
  if (lower.includes("tech") || lower.includes("software") || lower.includes("it ") || lower.includes("saas"))
    return { industry: "Technology", companies: [
      "NovaSoft Systems", "VantageTech Solutions", "Apex Digital Labs",
      "CoreStack Technologies", "Streamline IT Group", "BrightEdge Software",
      "CloudPeak Systems", "DataForge Inc.", "PivotPoint Tech",
      "Nexus Code Works", "ByteBridge Corp.", "Alpine Data Systems",
    ]};

  // Generic fallback
  return { industry: "Business Services", companies: [
    "Apex Business Solutions", "Meridian Consulting", "BridgePoint Services",
    "Summit Partners LLC", "Pinnacle Group", "Horizon Business Advisors",
    "Cornerstone Enterprises", "NorthStar Consulting", "Atlas Services Co.",
    "HarborView Partners", "Catalyst Business Group", "Heritage Solutions",
  ]};
}

export function generateLeads(businessType: string, count: number = 10): Lead[] {
  const { industry, companies } = resolveIndustry(businessType);
  const now = new Date().toISOString();
  const leads: Lead[] = [];

  for (let i = 0; i < count; i++) {
    const companyName = companies[i % companies.length];
    const firstName = randomFrom(FIRST_NAMES);
    const lastName = randomFrom(LAST_NAMES);
    const contactName = `${firstName} ${lastName}`;
    const domain = toCompanyDomain(companyName);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
    const phone = generatePhone();
    const source = randomFrom(SOURCES);
    const score = randomInt(40, 95);

    leads.push({
      company_name: companyName,
      industry,
      contact_name: contactName,
      email,
      phone,
      source,
      score,
      business_type: businessType,
      status: "new",
      created_at: now,
    });
  }

  return leads;
}
