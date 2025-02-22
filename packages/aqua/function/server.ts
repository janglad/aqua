import type { StandardSchemaV1 } from "@standard-schema/spec";
import {
  AquaFunction as AquaFunctionBase,
  type AquaFunctionType,
} from "./function";
import type { AResult } from "../result";

export class AquaFunction<
  TData,
  TError,
  TInput,
  TOutput,
  TTransformInput = TInput,
  TTransformOutput = TOutput,
> extends AquaFunctionBase<
  TData,
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
    handlerFn: (input: TTransformInput) => Promise<TTransformOutput>
  ) {
    super(id, type, inputSchema, outputSchema, handlerFn);
  }

  createInstance<
    TNewData,
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
    handlerFn: (input: TTransformInput) => Promise<TTransformOutput>
  ): AquaFunction<
    TNewData,
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
      handlerFn
    ) as any;
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

    let output: TTransformOutput = await this.handlerFn(
      transformedInputResult.value
    );

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
