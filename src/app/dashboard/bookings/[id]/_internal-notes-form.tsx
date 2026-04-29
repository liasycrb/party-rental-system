"use client";

import { useFormStatus } from "react-dom";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-3 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-zinc-100 transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save notes"}
    </button>
  );
}

export function InternalNotesForm({
  initialValue,
  action,
}: {
  initialValue: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action}>
      <textarea
        name="internal_notes"
        defaultValue={initialValue}
        placeholder="Add internal notes for this reservation (staff only)..."
        rows={4}
        className="w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20"
      />
      <SaveButton />
    </form>
  );
}
