export interface AOk<D, E> {
  ok: true;
  data: D;
}

export type InferAOk<R> = R extends AOk<infer D, infer E> ? D : never;

export interface AErr<D, E> {
  ok: false;
  error: E;
}
export type InferAErr<R> = R extends AErr<infer D, infer E> ? E : never;

export type AResult<D, E> = AOk<D, E> | AErr<D, E>;

export const ok = <D, E>(data: D): AOk<D, E> => ({ ok: true, data });
export const err = <D, E>(error: E): AErr<D, E> => ({ ok: false, error });

const test = {
  ok: true,
  data: "hi",
};

type Test = InferAOk<typeof test>;
