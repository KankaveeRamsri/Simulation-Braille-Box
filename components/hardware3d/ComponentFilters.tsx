import { FILTER_CATEGORIES, type FilterCategory } from "@/lib/hardwareComponents";

interface ComponentFiltersProps {
  active: FilterCategory;
  onSelect: (category: FilterCategory) => void;
}

/** Layer filter chips — dims components outside the selected category rather than hiding them, so the assembled device stays legible. */
export default function ComponentFilters({ active, onSelect }: ComponentFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {FILTER_CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={`rounded border px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] transition-colors ${
            active === category
              ? "border-[#39ff8f]/60 bg-[#39ff8f]/10 text-[#39ff8f]"
              : "border-white/15 text-white/45 hover:border-white/30 hover:text-white/75"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
