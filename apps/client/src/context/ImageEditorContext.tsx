import { ErrorStore, memoGuard, FieldStore } from "@helpers/type-helpers";
import { BasicResponseData, ImageOperations } from "@types";
import { ContextProviderComponent, createContext, createSignal } from "solid-js";
import { createStore,  } from "solid-js/store";

interface LoadingState {
    imageOperation: boolean;
    imageMeta: boolean;
}

const [imageUrl, setImageUrl] = createSignal<string | BasicResponseData>("");
const guardedImage = memoGuard(imageUrl, (val) => typeof val == "string" && val != "" && val);

const [errors, setErrors] = createStore<ErrorStore>({
    connectionIssue: false,
    transformIssue: false
});
const [displayErrors, setDisplayErrors] = createSignal<boolean>(false);

const [loading, setLoading] = createStore<LoadingState>({
    imageOperation: false,
    imageMeta: false,
});

const [fields, setFields] = createStore<FieldStore>({
    scale: '1',
    ditherPalette: [[0,0,0],[255,255,255]],
});

const getBlobFromUrl = async (url: string) => {
    return await (await fetch(url)).blob();
};

const imageTransform = async (params: ImageOperations) => {
    console.log(params)
    try {
        const imageUrlValue = imageUrl();

        if (typeof imageUrlValue !== "string" || imageUrlValue == "") {
            return false;
        }

        setLoading('imageOperation', true)

        const currentImage = await getBlobFromUrl(imageUrlValue);
        const formData = new FormData();

        formData.append("file", currentImage);

        switch (params.operation) {
            case "scale":
                if (!fields.scale) return false;
                formData.append("scale", fields.scale);
                break;
            case "rotate":
                formData.append("angle", String(params.angle));
                break;
            case "dither":
                console.log(params.palette)
                formData.append("palette", JSON.stringify(fields.ditherPalette))
            default:
                break;
        }

        const fetchData = await fetch(import.meta.env.VITE_API_URL + "/api/transform/" + params.operation, {
            method: "post",
            body: formData,
        });

        if (fetchData.headers.get("content-type")?.includes("application/json")) {
            const response = await fetchData.json()
            setLoading('imageOperation', false)
            setErrors("transformIssue", `The server threw an error: "${response.message}". Please try another operation.`);
            return false;
        }

        const fileBlob = await fetchData.blob();
        const newImage = URL.createObjectURL(fileBlob);

        setLoading('imageOperation', false)
        setErrors('transformIssue', undefined)
        setImageUrl(newImage);

    } catch (error) {
        setErrors("connectionIssue", "Issue performing transformation on the server.");
    }
};

const [values, setValues] = createStore({ imageUrl, setImageUrl, guardedImage, errors, setErrors, displayErrors, setDisplayErrors, loading, setLoading, fields, setFields, imageTransform });

export const ImageEditorContextObject = createContext<{ values: typeof values, setValues: typeof setValues }>()

export const ImageEditorContext: ContextProviderComponent<{}> = (props) => {
    return <ImageEditorContextObject.Provider value={{ values, setValues }}>
        {props.children}
    </ImageEditorContextObject.Provider>
}