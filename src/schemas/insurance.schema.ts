import { z } from "zod";

export const createInsuranceSchema = z.object({
  simulationId: z.number(),
  name: z.string(),
  startDate: z.string().transform((d) => {
    const date = new Date(d);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + offset);
  }),
  duration: z.number(),       
  premium: z.number(),        
  insuredValue: z.number(),   
});

export const updateInsuranceSchema = createInsuranceSchema.partial();

export type CreateInsuranceInput = z.infer<typeof createInsuranceSchema>;
export type UpdateInsuranceInput = z.infer<typeof updateInsuranceSchema>;