import { Accessor, For, Show, createEffect, createMemo, createSignal, type Component } from "solid-js";
import { createStore } from "solid-js/store";
import { BasicResponseData } from "@types";
import { ImageOperations, memoGuard } from "@helpers/type-helpers";
import Panel from "./Panel";
import { Metadata } from "sharp";
import ImageMetaData from "./ImageMetaData";

const ImageEditor: Component = () => {
    interface FieldStore {
        scale: string;
    }

    const [imageUrl, setImageUrl] = createSignal<string | BasicResponseData>("");
    const [imageMeta, setImageMeta] = createSignal<(BasicResponseData & { data: Metadata }) | null>(null);
    const [fields, setFields] = createStore<FieldStore>({ scale: "0.5" });

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

    const submitScaleImage = async (params: ImageOperations) => {
        const imageUrlValue = imageUrl();

        if (typeof imageUrlValue !== "string" || imageUrlValue == "") {
            return false;
        }

        const currentImage = await getBlobFromUrl(imageUrlValue);
        const formData = new FormData();

        formData.append("file", currentImage);

        switch (params.opperation) {
            case "scale":
                formData.append("scale", fields.scale);
                break;
            case "rotate":
                formData.append("angle", String(params.angle));
                break;

            default:
                return false;
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
        <div class="grid grid-cols-1 lg:grid-cols-editor gap-10 mt-10">
            <Panel>
                <div class="space-y-4">
                    <div>
                        <label for="file" class="font-bold mb-2 block">
                            File to transform
                        </label>
                        <input required type="file" id="file" name="file" class="file-input file-input-bordered" onClick={(e) => e.currentTarget.value = ""} onChange={(e) => handleFileInput(e)} />
                    </div>
                    <div>
                        <label for="scale" class="font-bold block mb-2">
                            Scale
                        </label>
                        <input
                            required
                            value={fields.scale}
                            onChange={(e) => setFields("scale", e.target.value)}
                            id="scale"
                            type="number"
                            name="scale"
                            class="input input-bordered"
                            placeholder="0.5"
                            step="0.01"
                            min="0.1"
                            max="0.9"
                        />
                    </div>
                </div>

                <div class="join">
                <button class="join-item btn btn-primary mt-10" onClick={() => submitScaleImage({ opperation: "scale" })}>
                    Scale
                </button>

                <button class="join-item btn btn-primary mt-10" onClick={() => submitScaleImage({ opperation: "rotate", angle: 90 })}>
                    90°
                </button>

                <button class="join-item btn btn-primary mt-10" onClick={() => submitScaleImage({ opperation: "rotate", angle: -90 })}>
                    -90°
                </button>
                </div>
                
            </Panel>

            <Panel>
                <div class="">
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
