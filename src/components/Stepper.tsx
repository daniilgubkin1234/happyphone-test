"use client";

export function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const pct = (step / 3) * 100;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm">
        {["Отправитель", "Получатель", "Подтверждение"].map((t, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const active = n === step;
          const done = n < step;
          return (
            <div key={t} className="flex items-center gap-2">
              <div
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full border",
                  active ? "border-black" : "border-zinc-300",
                  done ? "bg-black text-white border-black" : "bg-white",
                ].join(" ")}
              >
                {n}
              </div>
              <span className={active ? "text-black" : "text-zinc-500"}>{t}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-zinc-200 overflow-hidden">
        <div className="h-full bg-black" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}