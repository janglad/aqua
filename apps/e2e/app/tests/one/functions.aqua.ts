import { AquaFunction } from "aqua/function";
import { z } from "zod";

export const queryOne = AquaFunction.query("queryOne")
  .input(
    z.object({
      name: z.string(),
    })
  )
  .handler(async (input) => {
    return {
      ok: true,
      data: `hello ${input.name}`,
    } as const;
  });

export const mutationOne = AquaFunction.mutation("mutationOne")
  .input(
    z.object({
      name: z.string(),
    })
  )
  .handler(async (input) => {
    return {
      ok: true,
      data: `hello ${input.name}`,
    } as const;
  });
