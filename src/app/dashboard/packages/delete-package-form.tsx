"use client";

export function DeletePackageForm({
  packageId,
  deleteAction,
}: {
  packageId: string;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <form
      action={deleteAction}
      className="inline"
      onSubmit={(e) => {
        if (
          !confirm(
            "Delete this package permanently? This cannot be undone.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={packageId} />
      <button
        type="submit"
        className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:border-red-400/60 hover:bg-red-900/50 active:scale-[0.98]"
      >
        Delete package
      </button>
    </form>
  );
}
