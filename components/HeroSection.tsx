export function HeroSection({ brandCount = 0 }: { brandCount?: number }) {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #E5E7EB 1px, transparent 0)`,
          backgroundSize: "40px 40px",
          opacity: 0.5,
        }}
      />

      <div className="py-20 text-center sm:py-28">
        {/* Eyebrow */}
        <p
          className="mb-4 text-sm font-semibold tracking-wide uppercase"
          style={{ color: "#1876F4" }}
        >
          Trunexa Group
        </p>

        {/* H1 */}
        <h1
          className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          style={{ color: "#0F172A" }}
        >
          Official Brand &amp; Logo Repository
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed"
          style={{ color: "#6B7280" }}
        >
          Download and use official logos for all Trunexa brands. Available in
          SVG, PNG, JPG, and PDF formats.
        </p>

        {/* Stat pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <StatPill icon={<BrandIcon />} text={`${brandCount} Brands`} />
          <StatPill icon={<FormatIcon />} text="SVG · PNG · JPG · PDF" />
          <StatPill icon={<CheckIcon />} text="Always Up to Date" />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div style={{ height: 1, backgroundColor: "#E5E7EB" }} />
      </div>
    </section>
  );
}

function StatPill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
      style={{
        backgroundColor: "#F8F9FB",
        color: "#0F172A",
        border: "1px solid #E5E7EB",
      }}
    >
      {icon}
      {text}
    </div>
  );
}

function BrandIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="#1876F4"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );
}

function FormatIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="#1876F4"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="#1876F4"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
