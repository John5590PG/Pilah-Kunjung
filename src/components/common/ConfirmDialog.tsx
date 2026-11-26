"use client";
import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, body, confirmLabel, cancelLabel = "Cancel", danger, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => { e.preventDefault(); onCancel(); }}
      className="m-auto w-[min(92vw,26rem)] rounded-2xl border border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-black/40"
    >
      <div className="p-5">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-muted">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-paper">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${danger ? "bg-un hover:bg-red-900" : "bg-brand hover:bg-teal-950"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
