import { z } from "zod";

const phoneRegex = /^\+?[0-9()\-\s]{10,20}$/;

export const step1Schema = z.object({
  senderName: z.string().trim().min(2, "Минимум 2 символа"),
  senderPhone: z.string().trim().regex(phoneRegex, "Введите корректный телефон"),
  cityFrom: z.string().trim().min(1, "Укажите город отправления"),
});

export const step2Schema = z
  .object({
    receiverName: z.string().trim().min(2, "Укажите имя получателя"),
    cityTo: z.string().trim().min(1, "Укажите город назначения"),
    cargoType: z.enum(["documents", "fragile", "regular"]),
    weightKg: z.preprocess(
      (v) => (v === "" ? undefined : Number(v)),
      z.number().min(0.1, "Мин. 0.1").max(30, "Макс. 30")
    ),
    cityFrom: z.string().trim().min(1),
  })
  .refine((d) => d.cityFrom.toLowerCase() !== d.cityTo.toLowerCase(), {
    path: ["cityTo"],
    message: "Город назначения не может совпадать с городом отправления",
  });

export const finalSchema = step1Schema
  .and(
    z.object({
      receiverName: z.string().trim().min(2),
      cityTo: z.string().trim().min(1),
      cargoType: z.enum(["documents", "fragile", "regular"]),
      weightKg: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0.1).max(30)),
    })
  )
  .and(
  z.object({
    agreeDelivery: z.literal(true, { message: "Необходимо дать согласие с условиями доставки" }),
    agreePersonal: z.literal(true, { message: "Необходимо дать на обработку персональных данных" }),
  })
);