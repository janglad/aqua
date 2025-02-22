import type { AResult } from "../result";
import {
  AquaFunction as AquaFunctionBase,
  type AquaFunctionType,
} from "./function";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import "server-only";

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

  async run(input: TInput): Promise<AResult<TTransformOutput, TError>> {
    let transformedInputResult = this.inputSchema["~standard"].validate(input);
    if (transformedInputResult instanceof Promise) {
      transformedInputResult = await transformedInputResult;
    }

    if (transformedInputResult.issues) {
      return {
        ok: false,
        // @ts-expect-error
        error: {
          _tag: "INPUT_PARSING",
          cause: transformedInputResult.issues,
        },
      };
    }

    const handlerRes = await this.handlerFn(transformedInputResult.value);

    if (handlerRes.ok === false) {
      return handlerRes;
    }

    let output = handlerRes.data;

    if (this.outputSchema !== undefined) {
      let transformedOutputResult =
        this.outputSchema["~standard"].validate(output);
      if (transformedOutputResult instanceof Promise) {
        transformedOutputResult = await transformedOutputResult;
      }

      if (transformedOutputResult.issues) {
        return {
          ok: false,
          // @ts-expect-error
          error: {
            _tag: "OUTPUT_PARSING",
            cause: transformedOutputResult.issues,
          },
        };
      }

      output = transformedOutputResult.value;
    }

    return {
      ok: true,
      data: output,
    };
  }
}
