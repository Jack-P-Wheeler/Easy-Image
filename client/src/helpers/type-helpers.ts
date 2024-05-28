import { Accessor, createMemo } from "solid-js";

export const guarded = <T, U extends T>(data: T, predicate: (input: NonNullable<T>) => U | false) => {
    const guard = (value: T): value is U => value && predicate(value) !== false;
    if (guard(data)) return data;
    return null;
};

export const memoGuard = <T, U extends T>(val: Accessor<T>, fn: (input: NonNullable<T>) => U | false) => {
    return createMemo(() => guarded(val(), fn))
}

export type ImageOperations = (
    {
        opperation: 'scale',
    } | {
        opperation: 'rotate'
        angle?: number
    }
)