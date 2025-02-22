import type { AResult, InferAErr, InferAOk } from "../result";
import type { StandardSchemaV1 } from "@standard-schema/spec";

export type AquaFunctionType = "query" | "mutation";
export type AnyQuaFunction = AquaFunction<any, any, any, any, any>;
export abstract class AquaFunction<
  TError,
  TInput,
  TOutput,
  TTransformedInput,
  TTransformedOutput,
> {
  id: string;
  type: AquaFunctionType;
  inputSchema: StandardSchemaV1<TInput, TTransformedInput>;
  outputSchema: StandardSchemaV1<TOutput, TTransformedOutput> | undefined;
  handlerFn: (
    input: TTransformedInput,
  ) => Promise<AResult<TTransformedOutput, any>>;

  protected constructor(
    id: string,
    type: AquaFunctionType,
    inputSchema: StandardSchemaV1<TInput, TTransformedInput>,
    outputSchema: StandardSchemaV1<TOutput, TTransformedOutput> | undefined,
    handlerFn: (
      input: TTransformedInput,
    ) => Promise<AResult<TTransformedOutput, any>>,
  ) {
    this.id = id;
    this.type = type;
    this.inputSchema = inputSchema;
    this.outputSchema = outputSchema;
    this.handlerFn = handlerFn;
  }

  // This allows us to implement shared parts of the builder in this abstract class
  abstract createInstance<
    TNewError,
    TNewInput,
    TNewOutput,
    TNewTransformInput,
    TNewTransformOutput,
  >(
    id: string,
    type: AquaFunctionType,
    inputSchema: StandardSchemaV1<TInput, TTransformedInput>,
    outputSchema: StandardSchemaV1<TOutput, TTransformedOutput> | undefined,
    handlerFn: (
      input: TTransformedInput,
    ) => Promise<AResult<TTransformedOutput, any>>,
  ): AquaFunction<
    TNewError,
    TNewInput,
    TNewOutput,
    TNewTransformInput,
    TNewTransformOutput
  >;

  abstract run(input: TInput): Promise<AResult<TTransformedOutput, TError>>;

  static query(
    id: string,
  ): AquaFunction<never, unknown, unknown, unknown, unknown> {
    throw new Error("You've instantiated an abstract class?");
  }

  static mutation(
    id: string,
  ): AquaFunction<never, unknown, unknown, unknown, unknown> {
    throw new Error("You've instantiated an abstract class?");
  }

  input<TNewInput, TNewTransformInput = TNewInput>(
    schema: StandardSchemaV1<TNewInput, TNewTransformInput>,
  ): AquaFunction<
    {
      _tag: "INPUT_PARSING";
      cause: StandardSchemaV1.FailureResult;
    },
    TNewInput,
    TOutput,
    TNewTransformInput,
    TTransformedOutput
  > {
    return this.createInstance(
      this.id,
      this.type,
      schema as any,
      this.outputSchema,
      this.handlerFn,
    );
  }

  output<TNewOutput extends TOutput, TNewTransformOutput>(
    schema: StandardSchemaV1<TNewOutput, TNewTransformOutput>,
  ): AquaFunction<
    | TError
    | {
        _tag: "OUTPUT_PARSING";
        cause: StandardSchemaV1.FailureResult;
      },
    TInput,
    TNewOutput,
    TTransformedInput,
    TNewTransformOutput
  > {
    return this.createInstance(
      this.id,
      this.type,
      this.inputSchema,
      schema as any,
      this.handlerFn,
    );
  }

  handler<THandlerRes extends AResult<TOutput, any>>(
    handlerFn: (input: TTransformedInput) => Promise<THandlerRes>,
  ): AquaFunction<
    TError | InferAErr<THandlerRes>,
    TInput,
    InferAOk<THandlerRes>,
    TTransformedInput,
    InferAOk<THandlerRes>
  > {
    return this.createInstance(
      this.id,
      this.type,
      this.inputSchema,
      this.outputSchema,
      handlerFn as any,
    );
  }
}
