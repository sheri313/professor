interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  tone?: "light" | "dark";
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "light",
}: SectionHeadingProps) {
  const dark = tone === "dark";

  return (
    <header className="max-w-2xl">
      <p
        className={`text-sm font-semibold uppercase tracking-widest ${
          dark ? "text-accent-400" : "text-accent-700"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl ${
          dark ? "text-white" : "text-navy-900"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-lg leading-8 ${dark ? "text-navy-200" : "text-navy-600"}`}>
          {description}
        </p>
      )}
    </header>
  );
}
