import { cn } from "@/lib/utils/cn";

export function SectionTitle({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  tone = "default",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** `onDark` for immersive / blue sections */
  tone?: "default" | "onDark";
}) {
  const onDark = tone === "onDark";

  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "text-[11px] font-bold uppercase tracking-[0.2em]",
            onDark ? "text-sky-200/90" : "text-stone-500",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className={cn(
          "mt-2 text-2xl font-bold tracking-tight sm:text-3xl sm:leading-tight",
          onDark ? "text-white" : "text-stone-900",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-3 text-base leading-relaxed",
            onDark ? "text-slate-300" : "text-stone-600",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
