import { z } from "zod";

export const createMovementSchema = z.object({
  simulationId: z.number(),
  type: z.enum(["ENTRADA", "SAIDA"]),
  value: z.number(),
  frequency: z.enum(["UNICA", "MENSAL", "ANUAL"]),
  startDate: z.string().transform((d) => {
    const date = new Date(d);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + offset);
  }),
  endDate: z.string().transform((d) => {
    const date = new Date(d);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + offset);
  }).optional(),
});

export const updateMovementSchema = createMovementSchema.partial();

export type CreateMovementInput = z.infer<typeof createMovementSchema>;
export type UpdateMovementInput = z.infer<typeof updateMovementSchema>;