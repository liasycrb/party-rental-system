"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  cancelBooking,
  confirmBooking,
} from "@/lib/booking/dashboard-booking-actions";

type BookingStaffActionsProps = {
  bookingId: string;
};

export function BookingStaffActions({ bookingId }: BookingStaffActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function runAction(action: typeof confirmBooking | typeof cancelBooking) {
    setErrorMessage(null);
    startTransition(() => {
      void (async () => {
        const result = await action(bookingId);
        if (!result.ok) {
          setErrorMessage(result.error);
          return;
        }
        router.refresh();
      })();
    });
  }

  return (
    <div className="space-y-3">
      {errorMessage ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {errorMessage}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => runAction(confirmBooking)}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:pointer-events-none disabled:opacity-60"
        >
          {isPending ? "Working…" : "Confirm reservation"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => runAction(cancelBooking)}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-60"
        >
          {isPending ? "Working…" : "Cancel reservation"}
        </button>
      </div>
    </div>
  );
}
