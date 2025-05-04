import { memoGuard } from "@helpers/type-helpers";
import { BasicResponseData } from "@types";
import { ContextProviderComponent, createContext, createSignal } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

const [imageUrl, setImageUrl] = createSignal<string | BasicResponseData>("");
const guardedImage = memoGuard(imageUrl, (val) => typeof val == "string" && val != "" && val);
const [values, setValues] = createStore({ imageUrl, setImageUrl, guardedImage });

export const ImageEditorContextObject = createContext<{values: typeof values, setValues: typeof setValues}>()

export const ImageEditorContext: ContextProviderComponent<{}> = (props) => {
    return <ImageEditorContextObject.Provider value={{ values, setValues }}>
        {props.children}
    </ImageEditorContextObject.Provider>
}