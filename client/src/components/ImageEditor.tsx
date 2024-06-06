import { Show, createSignal, type Component } from "solid-js";
import { createStore } from "solid-js/store";
import { BasicResponseData } from "@types";
import { memoGuard } from "@helpers/type-helpers";
import { ImageOperations } from "@types";
import Panel from "./Panel";
import { Metadata } from "sharp";
import ImageMetaData from "./ImageMetaData";

import Scale from "@components/editorComponents/Scale";
import TransformButton from "./editorComponents/TransformButton";

export interface FieldStore {
    scale?: string;
}

const ImageEditor: Component = () => {
    const [imageUrl, setImageUrl] = createSignal<string | BasicResponseData>("");
    const [imageMeta, setImageMeta] = createSignal<(BasicResponseData & { data: Metadata }) | null>(null);
    const [fields, setFields] = createStore<FieldStore>();

    const guardMemo = memoGuard(imageUrl, (val) => typeof val == "string" && val != "" && val);

    const getBlobFromUrl = async (url: string) => {
        return await (await fetch(url)).blob();
    };

    const handleFileInput = async (e: Event) => {
        if (e.target instanceof HTMLInputElement && e.target.files != null) {
            const newImage = URL.createObjectURL(e.target.files[0]);
            setImageUrl(newImage);

            const formData = new FormData();
            formData.append("file", e.target.files[0]);
            const metaPromise = await fetch(import.meta.env.VITE_API_URL + "/api/transform/info", {
                method: "post",
                body: formData,
            });

            const meta = await metaPromise.json();
            setImageMeta(meta);
        }
    };

    const imageTransform = async (params: ImageOperations) => {
        const imageUrlValue = imageUrl();

        if (typeof imageUrlValue !== "string" || imageUrlValue == "") {
            return false;
        }

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
            setImageUrl(await fetchData.json());
            return false;
        }

        const fileBlob = await fetchData.blob();
        const newImage = URL.createObjectURL(fileBlob);

        setImageUrl(newImage);
    };

    return (
        <div class="grid grid-cols-1 lg:grid-cols-editor gap-10 mt-10 min-h-[800px]">
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

                    <Scale fields={fields} setFields={setFields} imageTransform={imageTransform} />
                </div>

                <div class="join">
                    <TransformButton imageTransform={imageTransform} operation={{ opperation: "rotate", angle: -90 }}>
                        -90°
                    </TransformButton>

                    <TransformButton imageTransform={imageTransform} operation={{ opperation: "rotate", angle: 90 }}>
                        90°
                    </TransformButton>

                    <TransformButton imageTransform={imageTransform} operation={{ opperation: "flip"}}>
                        Flip
                    </TransformButton>

                    <TransformButton imageTransform={imageTransform} operation={{ opperation: "flop"}}>
                        Flop
                    </TransformButton>
                </div>
            </Panel>

            <Panel>
                <div class="flex items-center h-full">
                    <Show when={guardMemo()} keyed>
                        {(image) => {
                            return (
                                <>
                                    <img src={image} class="object-fill w-full" alt="" />
                                </>
                            );
                        }}
                    </Show>
                </div>
            </Panel>

            <Panel>
                <Show when={imageMeta()?.data} keyed>
                    {(data: Metadata) => {
                        return <ImageMetaData data={data} />;
                    }}
                </Show>
                <Show when={guardMemo()} keyed>
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
    );
};

export default ImageEditor;
