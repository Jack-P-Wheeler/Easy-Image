import { Accessor, Component, JSX, createMemo } from "solid-js";
import { ImageAnalysis, ImageOperations, RGBTuple } from "@types";

export interface FieldStore {
    scale?: string;
    ditherPalette?: Array<RGBTuple>
    samplePaletteSize?: string;
}

export const guarded = <T, U extends T>(data: T, predicate: (input: NonNullable<T>) => U | false) => {
    const guard = (value: T): value is U => value && predicate(value) !== false;
    if (guard(data)) return data;
    return null;
};

export const memoGuard = <T, U extends T>(val: Accessor<T>, fn: (input: NonNullable<T>) => U | false) => {
    return createMemo(() => guarded(val(), fn))
}

export const narrowKeys = <T extends Object,>(obj: T): (keyof T)[] => {
    return Object.keys(obj) as (keyof T)[]
}

declare module "solid-js" {
    namespace JSX {

    }
}

export type MaybeResolved<T> = T | Promise<T>

type EditorComponentProps = { }

export type EditorComponent = Component<EditorComponentProps>

export type ParentEditorComponent = Component<{operation: ImageOperations; children: JSX.Element, verification?: Accessor<boolean>, classes?: string}>

export type ParentAnalysisComponent = Component<{operation: ImageAnalysis; children: JSX.Element, verification?: Accessor<boolean>, classes?: string}>

export interface ErrorStore {
    connectionIssue?: string | false;
    transformIssue?: string | false;
}