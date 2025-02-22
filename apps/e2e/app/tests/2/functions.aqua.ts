import { AquaFunction } from "aqua/function";
import { z } from "zod";

import { cookies } from "next/headers";

export const queryTwo = AquaFunction.query("queryTwo")
  .input(
    z.object({
      name: z.string(),
    })
  )
  .handler(async (input) => {
    const cookieStore = await cookies();
    const ourCookie = cookieStore.get("ourCookie");
    return {
      ok: true,
      data: `hello ${input.name} ${ourCookie?.value}`,
    } as const;
  });

export const mutationTwo = AquaFunction.mutation("mutationTwo")
  .input(
    z.object({
      name: z.string(),
    })
  )
  .handler(async (input) => {
    const cookieStore = await cookies();
    const ourCookie = cookieStore.get("ourCookie");
    return {
      ok: true,
      data: `hello ${input.name} ${ourCookie?.value}`,
    } as const;
  });
