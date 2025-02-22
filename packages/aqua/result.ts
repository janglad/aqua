export interface AOk<D, E> {
  ok: true;
  data: D;
}
export interface AErr<D, E> {
  ok: false;
  error: E;
}

export type AResult<D, E> = AOk<D, E> | AErr<D, E>;

export const ok = <D, E>(data: D): AOk<D, E> => ({ ok: true, data });
export const err = <D, E>(error: E): AErr<D, E> => ({ ok: false, error });
