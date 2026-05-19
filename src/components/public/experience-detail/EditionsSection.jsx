import EditionCard from "@/components/public/experiences/EditionCard";
import { useLanguage } from "@/hooks/useLanguage";

export default function EditionsSection({ editions, experience }) {
  const { t } = useLanguage();
  if (!editions || editions.length === 0) return null;

  return (
    <section id="editions" className="scroll-mt-24 py-8 md:py-10">
      <header className="mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-charcoal">
          {t("editions.title")}
        </h2>
        <p className="mt-2 text-sm md:text-base text-charcoal-muted max-w-2xl">
          {t("editions.subtitle")}
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {editions.map((edition) => (
          <EditionCard
            key={edition.$id}
            edition={edition}
            experience={experience}
          />
        ))}
      </div>
    </section>
  );
}
