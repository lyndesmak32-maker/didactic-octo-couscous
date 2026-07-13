import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

// Collection data with Stripe payment links
const collections = [
  {
    id: "everyday",
    title: "Everyday Collection",
    description: "Oversized hoodies, relaxed sweatpants, basic tees",
    image: "/images/collection-everyday.jpg",
    color: "from-brand-sand/30 to-transparent",
    items: [
      {
        name: "Signature Hoodie",
        price: "$68",
        colors: 6,
        paymentLink: "https://buy.stripe.com/5kQ7sLeXacCd5Wb5rd18c0c",
      },
      {
        name: "Essential Joggers",
        price: "$58",
        colors: 6,
        paymentLink: "https://buy.stripe.com/cNi00j6qEby92JZ8Dp18c0d",
      },
      {
        name: "Essential Tee",
        price: "$32",
        colors: 8,
        paymentLink: "https://buy.stripe.com/00w4gzbKY0Tv3O32f118c0e",
      },
      {
        name: "Lounge Shorts",
        price: "$42",
        colors: 5,
        paymentLink: "https://buy.stripe.com/28E00jcP29q184j1aX18c0l",
      },
    ],
  },
  {
    id: "motion",
    title: "Motion Collection",
    description: "Gym wear, compression, sports bras, running shorts",
    image: "/images/collection-motion.jpg",
    color: "from-brand-forest/20 to-transparent",
    items: [
      {
        name: "Compression Leggings",
        price: "$62",
        colors: 4,
        paymentLink: "https://buy.stripe.com/cNi00j4iwdGhbgv2f118c0g",
      },
      {
        name: "Sports Bra",
        price: "$44",
        colors: 5,
        paymentLink: "https://buy.stripe.com/9B614m2ao6dP0BRe2x18c0h",
      },
      {
        name: "Running Shorts",
        price: "$38",
        colors: 4,
        paymentLink: "https://buy.stripe.com/5kQ3cvaGUDGhckz5kK18c0i",
      },
      {
        name: "Motion Performance Tee",
        price: "$34",
        colors: 6,
        paymentLink: "https://buy.stripe.com/9B614n16k0Tvckz6vh18c0f",
      },
    ],
  },
  {
    id: "street",
    title: "Street Collection",
    description: "Cargo pants, graphic tees, zip hoodies, windbreakers",
    image: "/images/collection-street.jpg",
    color: "from-brand-navy/20 to-transparent",
    items: [
      {
        name: "Cargo Pants",
        price: "$72",
        colors: 3,
        paymentLink: "https://buy.stripe.com/7sY00j2aoeKl1FV3j518c0m",
      },
      {
        name: "Graphic Tee",
        price: "$36",
        colors: 5,
        paymentLink: "https://buy.stripe.com/14A6oHeXa45HacraLx18c0j",
      },
      {
        name: "Zip Hoodie",
        price: "$74",
        colors: 4,
        paymentLink: "https://buy.stripe.com/7sY6oHg1efOp0BR7zl18c0k",
      },
      {
        name: "Windbreaker",
        price: "$88",
        colors: 3,
        paymentLink: "https://buy.stripe.com/28E00jcP29q184j1aX18c0l",
      },
    ],
  },
  {
    id: "cozy",
    title: "Cozy Collection",
    description: "Blankets, slippers, sleepwear, crew socks",
    image: "/images/collection-cozy.jpg",
    color: "from-brand-light-pink/20 to-transparent",
    items: [
      {
        name: "Throw Blanket",
        price: "$56",
        colors: 4,
        paymentLink: "https://buy.stripe.com/aFa9AT4iw8lXckz5rd18c0n",
      },
      {
        name: "Slippers",
        price: "$38",
        colors: 3,
        paymentLink: "https://buy.stripe.com/eVq6oHaGU6dP2JZcTF18c0o",
      },
      {
        name: "Sleep Set",
        price: "$66",
        colors: 4,
        paymentLink: "https://buy.stripe.com/aFa5kD16k9q170fg5R18c0p",
      },
      {
        name: "Crew Socks (3-Pack)",
        price: "$22",
        colors: 5,
        paymentLink: "https://buy.stripe.com/9B614ng1egSt2JZ3j518c0q",
      },
    ],
  },
  {
    id: "accessories",
    title: "Accessories",
    description: "Backpacks, crossbody bags, tumblers, beanies, caps",
    image: "/images/collection-accessories.jpg",
    color: "from-brand-baby-blue/20 to-transparent",
    items: [
      {
        name: "Backpack",
        price: "$64",
        colors: 3,
        paymentLink: "https://buy.stripe.com/aFaeVddT631D98nf1N18c0w",
      },
      {
        name: "Crossbody Bag",
        price: "$42",
        colors: 4,
        paymentLink: "https://buy.stripe.com/6oU3cvdT61Xzbgv5rd18c0r",
      },
      {
        name: "Tumbler",
        price: "$28",
        colors: 5,
        paymentLink: "https://buy.stripe.com/4gM7sLcP231D0BRg5R18c0x",
      },
      {
        name: "Beanie",
        price: "$22",
        colors: 6,
        paymentLink: "https://buy.stripe.com/eVq14neXaeKl70f4n918c0s",
      },
      {
        name: "Cap",
        price: "$26",
        colors: 4,
        paymentLink: "https://buy.stripe.com/cNi9ATcP2by91FV7zl18c0t",
      },
      {
        name: "Duffle Bag",
        price: "$78",
        colors: 2,
        paymentLink: "https://buy.stripe.com/14A8wP2ao9q1doD3j518c0u",
      },
      {
        name: "Water Bottle",
        price: "$24",
        colors: 5,
        paymentLink: "https://buy.stripe.com/dRmfZh5mAgStgAPf1N18c0v",
      },
    ],
  },
];

// Color swatches
const colorSwatches = [
  { name: "White", class: "bg-white border border-brand-gray-200" },
  { name: "Black", class: "bg-brand-black" },
  { name: "Heather Gray", class: "bg-brand-heather" },
  { name: "Sand", class: "bg-brand-sand" },
  { name: "Forest Green", class: "bg-brand-forest" },
  { name: "Navy", class: "bg-brand-navy" },
  { name: "Burgundy", class: "bg-brand-burgundy" },
  { name: "Baby Blue", class: "bg-brand-baby-blue" },
  { name: "Light Pink", class: "bg-brand-light-pink" },
];

function Home() {
  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="relative flex min-h-dvh items-center justify-center overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src="/images/novara-hero-banner.png"
            alt="NOVARA lifestyle"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/40" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.3em]">
            NOVARA — Est. 2026
          </p>
          <h1 className="mb-6 text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl">
            Move
            <br />
            <span className="italic">Different.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
            Premium everyday apparel designed for comfort, confidence, and
            wherever life takes you.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a href="#collections" className="btn-primary min-w-[180px]">
              Shop Now
            </a>
            <a
              href="#collections"
              className="btn-outline min-w-[180px] border-white text-white hover:bg-white hover:text-brand-black"
            >
              Explore Collections
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </section>

      {/* ===== BRAND COLORS BAR ===== */}
      <section className="border-b border-brand-gray-200 bg-brand-white py-10">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.2em] text-brand-gray-400">
            Our Colors
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {colorSwatches.map((swatch) => (
              <div
                key={swatch.name}
                className="group relative flex flex-col items-center gap-2"
              >
                <div
                  className={`h-10 w-10 rounded-full ${swatch.class} shadow-sm transition-transform duration-200 hover:scale-110`}
                />
                <span className="text-[10px] font-medium text-brand-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                  {swatch.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED COLLECTIONS ===== */}
      <section id="collections" className="bg-brand-white py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-brand-gray-400">
              Collections
            </p>
            <h2 className="section-title">Designed for Every Moment</h2>
            <p className="section-subtitle mx-auto mt-4 max-w-lg">
              From the gym to the street to the couch — premium essentials that
              move with you.
            </p>
          </div>

          {/* Collection grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* First 3 collections as large cards */}
            {collections.slice(0, 3).map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {/* Last 2 collections */}
            {collections.slice(3).map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
        </div>
      </section>

      {/* Individual collection detail sections */}
      {collections.map((col) => (
        <CollectionDetailSection key={col.id} collection={col} />
      ))}

      {/* ===== VALUES SECTION ===== */}
      <section className="bg-brand-gray-100 py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-brand-gray-400">
              Why NOVARA
            </p>
            <h2 className="section-title">Built Different</h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Premium Quality",
                desc: "Luxury fabrics and construction at an approachable price.",
                icon: "✦",
              },
              {
                title: "Timeless Design",
                desc: "Minimalist aesthetics that never go out of style.",
                icon: "◈",
              },
              {
                title: "All-Day Comfort",
                desc: "Designed to feel as good as it looks — everywhere you go.",
                icon: "◆",
              },
            ].map((val) => (
              <div
                key={val.title}
                className="group border border-brand-gray-200 bg-white p-8 text-center transition-all duration-300 hover:border-brand-black"
              >
                <span className="mb-4 block text-2xl text-brand-gray-400 transition-colors group-hover:text-brand-black">
                  {val.icon}
                </span>
                <h3 className="mb-3 text-lg font-bold text-brand-black">
                  {val.title}
                </h3>
                <p className="text-sm leading-relaxed text-brand-gray-500">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative bg-brand-black py-24">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-brand-gray-400">
            Ready to level up
          </p>
          <h2 className="mb-6 text-3xl font-bold text-white sm:text-5xl">
            Find Your Fit.
            <br />
            <span className="text-brand-heather">Move Different.</span>
          </h2>
          <p className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-brand-gray-400">
            Join the NOVARA community and experience premium everyday apparel
            designed for wherever life takes you.
          </p>
          <a
            href="#collections"
            className="btn-outline inline-flex border-white text-white hover:bg-white hover:text-brand-black"
          >
            Shop the Collection
          </a>
        </div>
      </section>
    </>
  );
}

/* ===== COLLECTION CARD ===== */
function CollectionCard({
  collection,
}: {
  collection: (typeof collections)[0];
}) {
  return (
    <a
      href={`#${collection.id}`}
      className="collection-card group relative aspect-[4/5]"
    >
      <img
        src={collection.image}
        alt={collection.title}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <h3 className="mb-1 text-xl font-bold text-white">
          {collection.title}
        </h3>
        <p className="mb-4 text-sm text-white/70">{collection.description}</p>
        <span className="inline-block border-b border-white pb-1 text-xs font-medium uppercase tracking-[0.15em] text-white">
          Explore
        </span>
      </div>
    </a>
  );
}

/* ===== COLLECTION DETAIL SECTION ===== */
function CollectionDetailSection({
  collection,
}: {
  collection: (typeof collections)[0];
}) {
  return (
    <section
      id={collection.id}
      className="border-b border-brand-gray-200 bg-brand-white py-20"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Section header */}
        <div className="mb-12">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-brand-gray-400">
            Collection
          </p>
          <h2 className="section-title">{collection.title}</h2>
          <p className="section-subtitle mt-2">{collection.description}</p>
        </div>

        {/* Product grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {collection.items.map((item) => (
            <ProductCard key={item.name} item={item} />
          ))}
        </div>

        {/* View all CTA */}
        <div className="mt-12 text-center">
          <a
            href="#collections"
            className="btn-outline text-sm font-medium uppercase tracking-[0.15em]"
          >
            View All {collection.title.split(" ")[0]}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ===== PRODUCT CARD ===== */
function ProductCard({
  item,
}: {
  item: { name: string; price: string; colors: number; paymentLink?: string };
}) {
  return (
    <div className="group cursor-pointer">
      {/* Product image placeholder */}
      <a
        href={item.paymentLink || "#"}
        target={item.paymentLink ? "_blank" : undefined}
        rel={item.paymentLink ? "noopener noreferrer" : undefined}
        className="relative mb-4 block aspect-[3/4] overflow-hidden bg-brand-gray-100"
      >
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gray-200">
              <svg
                className="h-8 w-8 text-brand-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-xs text-brand-gray-400">
              {item.paymentLink ? "Click to shop" : "Coming Soon"}
            </p>
          </div>
        </div>

        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-brand-black px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.15em] text-white transition-transform duration-300 group-hover:translate-y-0">
          Buy Now
        </div>
      </a>

      {/* Product info */}
      <a
        href={item.paymentLink || "#"}
        target={item.paymentLink ? "_blank" : undefined}
        rel={item.paymentLink ? "noopener noreferrer" : undefined}
      >
        <h3 className="mb-1 text-sm font-medium text-brand-black transition-colors hover:text-brand-gray-600">
          {item.name}
        </h3>
      </a>
      <p className="mb-2 text-sm text-brand-gray-500">{item.price}</p>
      <p className="text-xs text-brand-gray-400">{item.colors} colors</p>
    </div>
  );
}