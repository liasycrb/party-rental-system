"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  confirmBooking,
  cancelBooking,
} from "@/lib/booking/dashboard-booking-actions";

type Props = {
  id: string;
  status: string;
};

export function RowActions({ id, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (status === "cancelled") return null;

  const handleConfirm = () => {
    startTransition(async () => {
      await confirmBooking(id);
      router.refresh();
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      await cancelBooking(id);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      {status === "pending_confirmation" && (
        <button
          onClick={handleConfirm}
          disabled={isPending}
          className="rounded px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Processing..." : "Confirm"}
        </button>
      )}
      {(status === "pending_confirmation" || status === "confirmed") && (
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="rounded px-2 py-1 text-xs font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Processing..." : "Cancel"}
        </button>
      )}
    </div>
  );
}
