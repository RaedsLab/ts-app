export type TrySuccess<T, E = string> = T extends undefined
  ? { success: true } | ITryError<E>
  : ITrySuccess<T> | ITryError<E>;

interface ITrySuccess<T> {
  success: true;
  val: T;
}

interface ITryError<E> {
  success: false;
  error: E;
}
