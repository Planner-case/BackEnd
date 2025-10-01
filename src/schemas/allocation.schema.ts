import { z } from "zod";

export const createAllocationSchema = z.object({
  simulationId: z.number(),
  type: z.enum(["FINANCEIRA", "IMOBILIZADA"]),
  name: z.string(),
  value: z.number(),
  date: z.string().transform((d) => {
    const date = new Date(d);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + offset);
  }),
  hasFinancing: z.boolean().default(false),
  startDate: z.string().transform((d) => {
    const date = new Date(d);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + offset);
  }).optional(),
  installments: z.number().optional(),
  interestRate: z.number().optional(),
  downPayment: z.number().optional(),
});

export const updateAllocationSchema = createAllocationSchema.partial();

export type CreateAllocationInput = z.infer<typeof createAllocationSchema>;
export type UpdateAllocationInput = z.infer<typeof updateAllocationSchema>;