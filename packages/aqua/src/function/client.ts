import type { AResult } from "../result";
import {
  AquaFunction as AquaFunctionBase,
  type AquaFunctionType,
} from "./function";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import "client-only";

const pathPrefix: `/${string}` = (() => {
  // TODO: check for invalid values in this
  const envValue = process.env.NEXT_PUBLIC_AQUA_PATH_PREFIX;

  if (envValue === undefined) {
    return "/_aqua";
  }

  if (envValue.startsWith("/")) {
    return envValue as `/${string}`;
  }

  return `/${envValue}` as `/${string}`;
})();

export class AquaFunction<
  TError,
  TInput,
  TOutput,
  TTransformInput,
  TTransformOutput,
> extends AquaFunctionBase<
  TError,
  TInput,
  TOutput,
  TTransformInput,
  TTransformOutput
> {
  private constructor(
    id: string,
    type: AquaFunctionType,
    inputSchema: StandardSchemaV1<TInput, TTransformInput>,
    outputSchema: StandardSchemaV1<TOutput, TTransformOutput> | undefined,
    handlerFn: (
      input: TTransformInput,
    ) => Promise<AResult<TTransformOutput, any>>,
  ) {
    super(id, type, inputSchema, outputSchema, handlerFn);
  }

  static override query(
    id: string,
  ): AquaFunction<never, unknown, unknown, unknown, unknown> {
    return new AquaFunction(
      id,
      "query",
      undefined as never,
      undefined as never,
      undefined as never,
    );
  }

  static override mutation(
    id: string,
  ): AquaFunction<never, unknown, unknown, unknown, unknown> {
    return new AquaFunction(
      id,
      "mutation",
      undefined as never,
      undefined as never,
      undefined as never,
    );
  }

  createInstance<
    TNewError,
    TNewInput,
    TNewOutput,
    TNewTransformInput,
    TNewTransformOutput,
  >(
    id: string,
    type: AquaFunctionType,
    inputSchema: StandardSchemaV1<TInput, TTransformInput>,
    outputSchema: StandardSchemaV1<TOutput, TTransformOutput> | undefined,
    handlerFn: (
      input: TTransformInput,
    ) => Promise<AResult<TTransformOutput, any>>,
  ): AquaFunction<
    TNewError,
    TNewInput,
    TNewOutput,
    TNewTransformInput,
    TNewTransformOutput
  > {
    return new AquaFunction(
      id,
      type,
      inputSchema,
      outputSchema,
      handlerFn,
    ) as any;
  }

  async run(input: TInput): Promise<AResult<TTransformOutput, TError>> {
    const url =
      pathPrefix +
      (this.type === "query"
        ? `?q=${encodeURIComponent(JSON.stringify(input))}`
        : "");

    const res = await fetch(url, {
      method: this.type === "mutation" ? "POST" : "GET",
      body: this.type === "mutation" ? JSON.stringify(input) : undefined,
    });

    return res.json();
  }
}
