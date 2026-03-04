"use client";

export function Toast({
  open,
  message,
  actionLabel,
  onAction,
  onClose,
}: {
  open: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
      <div
        role="status"
        className="flex items-center justify-between gap-3 rounded-2xl bg-black px-4 py-3 text-sm text-white shadow-lg"
      >
        <span className="min-w-0 truncate">{message}</span>
        <div className="flex items-center gap-2">
          {actionLabel && onAction ? (
            <button
              className="rounded-xl bg-white/15 px-3 py-1.5 hover:bg-white/20"
              onClick={onAction}
            >
              {actionLabel}
            </button>
          ) : null}
          <button className="rounded-xl px-2 py-1.5 hover:bg-white/15" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}