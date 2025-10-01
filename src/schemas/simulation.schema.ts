import { z } from "zod";

export const createSimulationSchema = z.object({
  name: z.string().min(3),
  startDate: z.string().transform((d) => {
    const date = new Date(d);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + offset);
  }),
  rate: z.number().default(0.04),
  status: z.enum(["VIVO", "MORTO", "INVALIDO"]),
});

export const updateSimulationSchema = createSimulationSchema.partial();

export type CreateSimulationInput = z.infer<typeof createSimulationSchema>;
export type UpdateSimulationInput = z.infer<typeof updateSimulationSchema>;