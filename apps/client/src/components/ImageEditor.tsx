import { For, Show, createEffect, createSignal, type Component } from "solid-js";
import { createStore } from "solid-js/store";
import { BasicResponseData } from "@types";
import { narrowKeys } from "@helpers/type-helpers";
import { ImageOperations } from "@types";
import Panel from "./Panel";
import { Metadata } from "sharp";
import ImageMetaData from "./ImageMetaData";

import Scale from "@components/editorComponents/Scale";
import TransformButton from "./editorComponents/TransformButton";
import { useImageEditorContext } from "@helpers/context-helpers";

export interface FieldStore {
    scale?: string;
}

interface ErrorStore {
    connectionIssue?: string | false;
    transformIssue?: string | false;
}

interface LoadingState {
    imageOperation: boolean;
    imageMeta: boolean;
}

type ErrorKeys = keyof ErrorStore;

const ImageEditor: Component = () => {
    const context = useImageEditorContext()

    const [imageMeta, setImageMeta] = createSignal<(BasicResponseData & { data: Metadata }) | null>(null);

    const [fields, setFields] = createStore<FieldStore>();

    const [errors, setErrors] = createStore<ErrorStore>({
        connectionIssue: false,
        transformIssue: false
    });
    const [displayErrors, setDisplayErrors] = createSignal<boolean>(false);

    const [loading, setLoading] = createStore<LoadingState>({
        imageOperation: false,
        imageMeta: false,
    });

    createEffect(() => {
        let key: ErrorKeys;
        for (key in errors) {
            if (errors[key]) {
                setDisplayErrors(true);
            }
        }
    });

    const getBlobFromUrl = async (url: string) => {
        return await (await fetch(url)).blob();
    };

    const handleFileInput = async (e: Event) => {
        try {
            if (e.target instanceof HTMLInputElement && e.target.files != null) {
                const newImage = URL.createObjectURL(e.target.files[0]);
                context.values.setImageUrl(newImage);

                const formData = new FormData();
                formData.append("file", e.target.files[0]);
                setLoading("imageMeta", true);
                const metaPromise = await fetch(import.meta.env.VITE_API_URL + "/api/transform/info", {
                    method: "post",
                    body: formData,
                });
                setLoading("imageMeta", false);

                const meta = await metaPromise.json();
                setImageMeta(meta);
            }
        } catch (error) {
            setErrors("connectionIssue", "Issue getting meta data from the server.");
        }
    };

    const imageTransform = async (params: ImageOperations) => {
        try {
            const imageUrlValue = context.values.imageUrl();

            if (typeof imageUrlValue !== "string" || imageUrlValue == "") {
                return false;
            }

            setLoading('imageOperation', true)

            const currentImage = await getBlobFromUrl(imageUrlValue);
            const formData = new FormData();

            formData.append("file", currentImage);

            switch (params.opperation) {
                case "scale":
                    if (!fields.scale) return false;
                    formData.append("scale", fields.scale);
                    break;
                case "rotate":
                    formData.append("angle", String(params.angle));
                    break;
                default:
                    break;
            }

            const fetchData = await fetch(import.meta.env.VITE_API_URL + "/api/transform/" + params.opperation, {
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
            context.values.setImageUrl(newImage);

        } catch (error) {
            setErrors("connectionIssue", "Issue performing transformation on the server.");
        }
    };

    return (
        <section>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10 min-h-[800px]">
                <Panel>
                    <div class="space-y-4">
                        <div>
                            <label for="file" class="font-bold mb-2 block">
                                File to transform
                            </label>
                            <input
                                required
                                type="file"
                                id="file"
                                name="file"
                                class="file-input file-input-bordered"
                                onClick={(e) => (e.currentTarget.value = "")}
                                onChange={(e) => handleFileInput(e)}
                            />
                        </div>
                    </div>

                    <Scale fields={fields} setFields={setFields} imageTransform={imageTransform} />

                    <div class="join">
                        <TransformButton imageTransform={imageTransform} operation={{ opperation: "rotate", angle: -90 }}>
                            -90°
                        </TransformButton>

                        <TransformButton imageTransform={imageTransform} operation={{ opperation: "rotate", angle: 90 }}>
                            90°
                        </TransformButton>

                        <TransformButton imageTransform={imageTransform} operation={{ opperation: "flip" }}>
                            Flip
                        </TransformButton>

                        <TransformButton imageTransform={imageTransform} operation={{ opperation: "flop" }}>
                            Flop
                        </TransformButton>
                    </div>
                </Panel>

                <Panel classes="col-span-2">
                    <div class="flex items-center justify-center h-full relative">

                        <Show when={context.values.guardedImage()} keyed>
                            {(image) => {
                                return (
                                    <>
                                        <img src={image} class={`object-fill disable-blur w-full contrast-100 ${loading.imageOperation ? "opacity-50" : ""}`} alt="" />
                                    </>
                                );
                            }}
                        </Show>
                        <Show when={loading.imageOperation}>
                            <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 loading loading-spinner loading-lg"></span>
                        </Show>
                    </div>
                </Panel>

                <Panel classes="col-span-1">
                    <Show when={loading.imageMeta}>
                        <span class="block loading loading-spinner loading-lg"></span>
                    </Show>

                    <Show when={imageMeta()?.data} keyed>
                        {(data: Metadata) => {
                            return <ImageMetaData data={data} />;
                        }}
                    </Show>
                    <Show when={context.values.guardedImage()} keyed>
                        {(image) => {
                            return (
                                <>
                                    <a href={image} class="btn btn-secondary mt-2" download="easy-image">
                                        Download
                                    </a>
                                </>
                            );
                        }}
                    </Show>
                </Panel>
            </div>
            <Show when={displayErrors()}>
                <For each={narrowKeys(errors)}>{(item) =>
                    <Show when={errors[item]}>
                        <div role="alert" class="alert alert-error mt-10">
                            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>{errors[item]}</p>
                        </div>
                    </Show>
                }</For>

            </Show>
        </section>
    );
};

export default ImageEditor;
