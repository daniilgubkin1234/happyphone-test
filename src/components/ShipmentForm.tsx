"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Draft, Order } from "@/lib/types";
import { addOrder, makeId, loadDraft, saveDraft, clearDraft } from "@/lib/storage";
import { finalSchema, step1Schema, step2Schema } from "@/lib/validators";
import { Stepper } from "./Stepper";


type Errors = Record<string, string>;

const cargoLabels = {
  documents: "Документы",
  fragile: "Хрупкое",
  regular: "Обычное",
} as const;

const initialDraft: Draft = {
  senderName: "",
  senderPhone: "",
  cityFrom: "",
  receiverName: "",
  cityTo: "",
  cargoType: "regular",
  weightKg: "",
};


export function ShipmentForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [agreeDelivery, setAgreeDelivery] = useState(false);
  const [agreePersonal, setAgreePersonal] = useState(false);
  const [errors, setErrors] = useState<Errors>({});


  useEffect(() => {
    const saved = loadDraft();
    if (!saved) return;

    setStep(saved.step);
    setDraft(saved.draft);
    if (typeof saved.agreeDelivery === "boolean") setAgreeDelivery(saved.agreeDelivery);
    if (typeof saved.agreePersonal === "boolean") setAgreePersonal(saved.agreePersonal);
  }, []);
  useEffect(() => {
  const t = window.setTimeout(() => {
    saveDraft({ step, draft, agreeDelivery, agreePersonal });
  }, 200);

  return () => window.clearTimeout(t);
}, [step, draft, agreeDelivery, agreePersonal]);

  const summary = useMemo(() => {
    return [
      ["Отправитель", draft.senderName],
      ["Телефон", draft.senderPhone],
      ["Город отправления", draft.cityFrom],
      ["Получатель", draft.receiverName],
      ["Город назначения", draft.cityTo],
      ["Тип груза", cargoLabels[draft.cargoType]],
      ["Вес (кг)", String(draft.weightKg || "")],
    ];
  }, [draft]);

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  }

  function applyZodErrors(zodErrors: unknown) {
    const next: Errors = {};
    // zod error flatten without importing types
    const err = zodErrors as any;
    const fe = err?.flatten?.().fieldErrors ?? {};
    for (const k of Object.keys(fe)) {
      const msg = fe[k]?.[0];
      if (msg) next[k] = msg;
    }
    setErrors(next);
  }

  function validateStep1() {
    const res = step1Schema.safeParse({
      senderName: draft.senderName,
      senderPhone: draft.senderPhone,
      cityFrom: draft.cityFrom,
    });
    if (!res.success) {
      applyZodErrors(res.error);
      return false;
    }
    setErrors({});
    return true;
  }

  function validateStep2() {
    const res = step2Schema.safeParse({
      receiverName: draft.receiverName,
      cityTo: draft.cityTo,
      cargoType: draft.cargoType,
      weightKg: draft.weightKg,
      cityFrom: draft.cityFrom,
    });
    if (!res.success) {
      applyZodErrors(res.error);
      return false;
    }
    setErrors({});
    return true;
  }

  function next() {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  }

  function back() {
    setErrors({});
    setStep((s) => (s === 1 ? 1 : ((s - 1) as 1 | 2 | 3)));
  }

  function submit() {
  const res = finalSchema.safeParse({
    ...draft,
    agreeDelivery,
    agreePersonal,
  });

  if (!res.success) {
    applyZodErrors(res.error);
    return;
  }

  const order: Order = {
    id: makeId(),
    createdAt: Date.now(),
    status: "Создано",
    senderName: res.data.senderName,
    senderPhone: res.data.senderPhone,
    cityFrom: res.data.cityFrom,
    receiverName: res.data.receiverName,
    cityTo: res.data.cityTo,
    cargoType: res.data.cargoType,
    weightKg: res.data.weightKg as number,
  };

  addOrder(order);
  clearDraft();
  router.push("/orders");
}

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Заявка на доставку</h1>
        <p className="mt-1 text-sm text-zinc-600">Заполните данные в 3 шага</p>
      </div>

      <Stepper step={step} />

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
        {step === 1 ? (
          <div className="space-y-4">
            <Field
              label="Имя"
              value={draft.senderName}
              onChange={(v) => setField("senderName", v)}
              error={errors.senderName}
              placeholder="Иван"
            />
            <Field
              label="Телефон"
              value={draft.senderPhone}
              onChange={(v) => setField("senderPhone", v)}
              error={errors.senderPhone}
              placeholder="+7 (999) 123-45-67"
              inputMode="tel"
            />
            <Field
              label="Город отправления"
              value={draft.cityFrom}
              onChange={(v) => setField("cityFrom", v)}
              error={errors.cityFrom}
              placeholder="Москва"
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <Field
              label="Имя получателя"
              value={draft.receiverName}
              onChange={(v) => setField("receiverName", v)}
              error={errors.receiverName}
              placeholder="Например, Анна"
            />
            <Field
              label="Город назначения"
              value={draft.cityTo}
              onChange={(v) => setField("cityTo", v)}
              error={errors.cityTo}
              placeholder="Санкт-Петербург"
            />

            <div>
              <div className="text-sm font-medium">Тип груза</div>
              <select
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-black"
                value={draft.cargoType}
                onChange={(e) => setField("cargoType", e.target.value as Draft["cargoType"])}
              >
                <option value="documents">Документы</option>
                <option value="fragile">Хрупкое</option>
                <option value="regular">Обычное</option>
              </select>
              {errors.cargoType ? <Err text={errors.cargoType} /> : null}
            </div>

            <div>
              <div className="text-sm font-medium">Вес, кг</div>
              <input
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-black"
                type="number"
                min={0.1}
                max={30}
                step={0.1}
                value={draft.weightKg}
                onChange={(e) => {
                  const v = e.target.value;
                  setField("weightKg", v === "" ? "" : Number(v));
                }}
                placeholder="0.1–30"
              />
              {errors.weightKg ? <Err text={errors.weightKg} /> : null}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-sm font-medium mb-3">Сводка</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {summary.map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-white border border-zinc-200 p-3">
                    <div className="text-zinc-500">{k}</div>
                    <div className="mt-1 font-medium break-words">{v || "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
                <label className="flex items-start gap-3">
                    <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-black"
                    checked={agreeDelivery}
                    onChange={(e) => {
                        setAgreeDelivery(e.target.checked);
                        setErrors((er) => {
                        const next = { ...er };
                        delete next.agreeDelivery;
                        return next;
                        });
                    }}
                    />
                    <span className="text-sm">
                    Даю согласие с условиями доставки
                    {errors.agreeDelivery ? (
                        <span className="block">
                        <Err text={errors.agreeDelivery} />
                        </span>
                    ) : null}
                    </span>
                </label>

                <label className="flex items-start gap-3">
                    <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-black"
                    checked={agreePersonal}
                    onChange={(e) => {
                        setAgreePersonal(e.target.checked);
                        setErrors((er) => {
                        const next = { ...er };
                        delete next.agreePersonal;
                        return next;
                        });
                    }}
                    />
                    <span className="text-sm">
                    Даю согласие на обработку персональных данных
                    {errors.agreePersonal ? (
                        <span className="block">
                        <Err text={errors.agreePersonal} />
                        </span>
                    ) : null}
                    </span>
                </label>
                </div>
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between">
          <button
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
            onClick={back}
            disabled={step === 1}
          >
            Назад
          </button>

          {step !== 3 ? (
            <button className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90" onClick={next}>
              Далее
            </button>
          ) : (
            <button className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90" onClick={submit}>
              Отправить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <div className="text-sm font-medium">{label}</div>
      <input
        className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-black"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
      />
      {error ? <Err text={error} /> : null}
    </div>
  );
}

function Err({ text }: { text: string }) {
  return <div className="mt-1 text-xs text-red-600">{text}</div>;
}