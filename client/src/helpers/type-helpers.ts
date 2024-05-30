import { FieldStore } from "@components/ImageEditor";
import { Accessor, Component, JSX, createMemo } from "solid-js";
import { SetStoreFunction } from "solid-js/store";

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
    } | {
        opperation: 'flip'
    } | {
        opperation: 'flop'
    }
)

declare module "solid-js" {
    namespace JSX {
        interface Directives {
            editorField: true
        }
    }
}

export type MaybeResolved<T> = T | Promise<T>

type EditorComponentProps = { fields: FieldStore; setFields: SetStoreFunction<FieldStore>; imageTransform: (params: ImageOperations) => Promise<false | undefined>}

export type EditorComponent = Component<EditorComponentProps>

export type ParentEditorComponent = Component<{imageTransform: (params: ImageOperations) => Promise<false | undefined>; operation: ImageOperations; children: JSX.Element}>