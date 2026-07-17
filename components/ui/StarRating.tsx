import { Star } from "lucide-react";

const sizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };

export default function StarRating({
  value,
  max = 5,
  size = "md",
  showValue = false,
  count,
  countLabel = "yorum",
}: {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
  countLabel?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={`${sizes[size]} ${i < Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-slate-500">
          {value > 0 ? value.toFixed(1) : "—"}
          {typeof count === "number" ? ` · ${count} ${countLabel}` : ""}
        </span>
      )}
    </div>
  );
}
