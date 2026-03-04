"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CargoType, Order } from "@/lib/types";
import { deleteOrder, loadOrders, saveOrders } from "@/lib/storage";
import { Dialog } from "@/components/Dialog";
import { Toast } from "@/components/Toast";

const cargoLabels: Record<CargoType, string> = {
  documents: "Документы",
  fragile: "Хрупкое",
  regular: "Обычное",
};

function fmtDate(ts: number) {
  return new Date(ts).toLocaleString("ru-RU");
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"" | CargoType>("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
const [undo, setUndo] = useState<{
    order: Order;
    index: number;
    timeoutId: number;
} | null>(null);
  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return orders.filter((o) => {
      const okType = type ? o.cargoType === type : true;
      const okQ = qq
        ? o.receiverName.toLowerCase().includes(qq) || o.cityTo.toLowerCase().includes(qq)
        : true;
      return okType && okQ;
    });
  }, [orders, q, type]);

  function remove(id: string) {
  const current = loadOrders();
  const index = current.findIndex((o) => o.id === id);
  if (index === -1) return;

  const deleted = current[index];

  deleteOrder(id);
  setOrders(loadOrders());

  if (undo) window.clearTimeout(undo.timeoutId);

  const timeoutId = window.setTimeout(() => setUndo(null), 5000);
  setUndo({ order: deleted, index, timeoutId });
}

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">История заявок</h1>
        </div>
        <Link
          href="/"
          className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
        >
          Новая заявка
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-black sm:col-span-2"
          placeholder="Поиск: имя получателя или город назначения"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        >
          <option value="">Все типы</option>
          <option value="documents">Документы</option>
          <option value="fragile">Хрупкое</option>
          <option value="regular">Обычное</option>
        </select>
      </div>

      <div className="mt-5 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            Пусто. Создайте первую заявку.
          </div>
        ) : (
          filtered.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <Link href={`/orders/${o.id}`} className="min-w-0">
                  <div className="truncate text-base font-semibold">
                    {o.cityFrom} → {o.cityTo}
                  </div>
                  <div className="mt-1 text-sm text-zinc-600">
                    Отправитель: <span className="text-zinc-900">{o.senderName}</span>
                    {" · "}
                    Получатель: <span className="text-zinc-900">{o.receiverName}</span>
                  </div>
                </Link>

                <button
                  className="rounded-xl border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
                  onClick={() => setConfirmId(o.id)}
                >
                  Удалить
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-zinc-100 px-3 py-1">
                  Тип: {cargoLabels[o.cargoType]}
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1">
                  Вес: {o.weightKg} кг
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1">
                  Дата: {fmtDate(o.createdAt)}
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1">
                  Статус: {o.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog
        open={!!confirmId}
        title="Удалить заявку?"
        confirmText="Удалить"
        cancelText="Отмена"
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) remove(confirmId);
        }}
      />
      <Toast
        open={!!undo}
        message="Заявка удалена"
        actionLabel="Отменить"
        onAction={() => {
            if (!undo) return;

            const list = loadOrders();
            const next = [...list];
            const pos = Math.min(undo.index, next.length);

            next.splice(pos, 0, undo.order);

            saveOrders(next);
            setOrders(next);

            window.clearTimeout(undo.timeoutId);
            setUndo(null);
        }}
        onClose={() => {
            if (!undo) return;
            window.clearTimeout(undo.timeoutId);
            setUndo(null);
        }}
        />
    </div>
  );
}