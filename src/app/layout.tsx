import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Форма оформления завяки на доставку",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-zinc-50 text-zinc-900">{children}</body>
    </html>
  );
}