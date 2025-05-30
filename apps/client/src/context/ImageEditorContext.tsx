import { ErrorStore, memoGuard, FieldStore } from "@helpers/type-helpers";
import { BasicResponseData, ImageAnalysis, ImageOperations, RGBTuple } from "@types";
import { ContextProviderComponent, createContext, createSignal } from "solid-js";
import { createStore, } from "solid-js/store";

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

const [fields, setFields] = createStore<FieldStore>();

const getBlobFromUrl = async (url: string) => {
    return await (await fetch(url)).blob();
};

const imageAnalysis = async (params: ImageAnalysis) => {
    const imageUrlValue = imageUrl();

    if (typeof imageUrlValue !== "string" || imageUrlValue == "") {
        return false;
    }

    setLoading('imageOperation', true)

    const currentImage = await getBlobFromUrl(imageUrlValue);
    const formData = new FormData();

    formData.append("file", currentImage);

    switch (params.operation) {
        case "sample-palette":
            formData.append("sampleSize", String(fields.samplePaletteSize || '4'))
        default:
            break;
    }

    const fetchData = await fetch(import.meta.env.VITE_API_URL + "/api/analysis/" + params.operation, {
        method: "post",
        body: formData,
    });

    const data = await fetchData.json() as BasicResponseData & { data: Array<RGBTuple> }



    switch (params.operation) {
        case "sample-palette":
            setFields('ditherPalette', data.data)
        default:
            break;
    }

    setLoading('imageOperation', false)
}

const imageTransform = async (params: ImageOperations) => {
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
                formData.append("palette", JSON.stringify(fields.ditherPalette))
            case "ordered":
                formData.append("palette", JSON.stringify(fields.ditherPalette))
            case "sample-palette":
                formData.append("sampleSize", String(fields.samplePaletteSize || '4'))
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

const [values, setValues] = createStore({ imageUrl, setImageUrl, guardedImage, errors, setErrors, displayErrors, setDisplayErrors, loading, setLoading, fields, setFields, imageTransform, imageAnalysis });

export const ImageEditorContextObject = createContext<{ values: typeof values, setValues: typeof setValues }>()

export const ImageEditorContext: ContextProviderComponent<{}> = (props) => {
    return <ImageEditorContextObject.Provider value={{ values, setValues }}>
        {props.children}
    </ImageEditorContextObject.Provider>
}