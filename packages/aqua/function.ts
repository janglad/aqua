import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { AResult } from "./result";

export type AquaFunctionType = "query" | "mutation";

export abstract class AquaFunction<
  TData,
  TError,
  TInput,
  TOutput,
  TTransformInput = TInput,
  TTransformOutput = TOutput,
> {
  id: string;
  type: AquaFunctionType;
  inputSchema: StandardSchemaV1<TInput, TTransformInput>;
  outputSchema: StandardSchemaV1<TOutput, TTransformOutput> | undefined;
  handlerFn: (input: TTransformInput) => Promise<TTransformOutput>;

  protected constructor(
    id: string,
    type: AquaFunctionType,
    inputSchema: StandardSchemaV1<TInput, TTransformInput>,
    outputSchema: StandardSchemaV1<TOutput, TTransformOutput> | undefined,
    handlerFn: (input: TTransformInput) => Promise<TTransformOutput>
  ) {
    this.id = id;
    this.type = type;
    this.inputSchema = inputSchema;
    this.outputSchema = outputSchema;
    this.handlerFn = handlerFn;
  }

  // This allows us to implement shared parts of the builder in this abstract class
  abstract createInstance<
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
  >;

  abstract run(input: TInput): Promise<AResult<TOutput, TError>>;

  query(id: string): AquaFunction<TData, TError, TInput, TOutput> {
    return this.createInstance(
      id,
      "query",
      this.inputSchema,
      this.outputSchema,
      this.handlerFn
    );
  }

  mutation(id: string): AquaFunction<TData, TError, TInput, TOutput> {
    return this.createInstance(
      id,
      "mutation",
      this.inputSchema,
      this.outputSchema,
      this.handlerFn
    );
  }

  input<TNewInput, TNewTransformInput = TNewInput>(
    schema: StandardSchemaV1<TNewInput, TNewTransformInput>
  ): AquaFunction<TData, TError, TNewInput, TOutput, TNewTransformInput> {
    return this.createInstance(
      this.id,
      this.type,
      schema as any,
      this.outputSchema,
      this.handlerFn
    );
  }

  output<TNewOutput, TNewTransformOutput>(
    schema: StandardSchemaV1<TNewOutput, TNewTransformOutput>
  ): AquaFunction<
    TData,
    TError,
    TInput,
    TNewOutput,
    TTransformInput,
    TNewTransformOutput
  > {
    return this.createInstance(
      this.id,
      this.type,
      this.inputSchema,
      schema as any,
      this.handlerFn
    );
  }

  handler<TNewOutput>(
    handlerFn: (input: TTransformInput) => Promise<TNewOutput>
  ): AquaFunction<
    TData,
    TError,
    TInput,
    TNewOutput,
    TTransformInput,
    TNewOutput
  > {
    return this.createInstance(
      this.id,
      this.type,
      this.inputSchema,
      this.outputSchema,
      handlerFn as any
    );
  }
}
