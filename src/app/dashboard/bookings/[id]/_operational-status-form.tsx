"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

const OPTIONS = [
  { value: "", label: "— Not set —" },
  { value: "needs_review", label: "Needs review" },
  { value: "ready_for_delivery", label: "Ready for delivery" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "picked_up", label: "Picked up" },
  { value: "completed", label: "Completed" },
] as const;

export function OperationalStatusForm({
  currentValue,
  action,
}: {
  currentValue: string | null;
  action: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(formData);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <select
        name="operational_status"
        defaultValue={currentValue ?? ""}
        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-white/20"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100">
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="mt-3 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-zinc-100 transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
