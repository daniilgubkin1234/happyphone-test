"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { getOrderById } from "@/lib/storage";
import type { CargoType } from "@/lib/types";

const cargoLabels: Record<CargoType, string> = {
  documents: "Документы",
  fragile: "Хрупкое",
  regular: "Обычное",
};

function fmtDate(ts: number) {
  return new Date(ts).toLocaleString("ru-RU");
}

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const order = useMemo(() => getOrderById(params.id), [params.id]);

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="text-lg font-semibold">Заявка не найдена</div>
          <p className="mt-2 text-sm text-zinc-600">Возможно, она была удалена.</p>
          <Link href="/orders" className="mt-4 inline-block rounded-xl bg-black px-4 py-2 text-sm text-white">
            Назад к списку
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {order.cityFrom} → {order.cityTo}
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Создано: {fmtDate(order.createdAt)} · Статус: {order.status}
          </p>
        </div>
        <Link href="/orders" className="rounded-xl border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50">
          К списку
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card label="Отправитель" value={order.senderName} />
        <Card label="Телефон" value={order.senderPhone} />
        <Card label="Город отправления" value={order.cityFrom} />
        <Card label="Получатель" value={order.receiverName} />
        <Card label="Город назначения" value={order.cityTo} />
        <Card label="Тип груза" value={cargoLabels[order.cargoType]} />
        <Card label="Вес" value={`${order.weightKg} кг`} />
        <Card label="ID" value={order.id} mono />
      </div>
    </div>
  );
}

function Card({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={["mt-1 font-medium break-words", mono ? "font-mono text-sm" : ""].join(" ")}>
        {value}
      </div>
    </div>
  );
}