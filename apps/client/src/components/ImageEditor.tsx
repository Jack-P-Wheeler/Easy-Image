import { For, Show, createEffect, createSignal, type Component } from "solid-js";
import { createStore } from "solid-js/store";
import { BasicResponseData } from "@types";
import { ErrorStore, narrowKeys } from "@helpers/type-helpers";
import { ImageOperations } from "@types";
import Panel from "./Panel";
import { Metadata } from "sharp";
import ImageMetaData from "./ImageMetaData";

import Scale from "@components/editorComponents/Scale";
import TransformButton from "./editorComponents/TransformButton";
import { useImageEditorContext } from "@helpers/context-helpers";



type ErrorKeys = keyof ErrorStore;

const ImageEditor: Component = () => {
    const context = useImageEditorContext()

    const [imageMeta, setImageMeta] = createSignal<(BasicResponseData & { data: Metadata }) | null>(null);

    

    createEffect(() => {
        let key: ErrorKeys;
        for (key in context.values.errors) {
            if (context.values.errors[key]) {
                context.values.setDisplayErrors(true);
            }
        }
    });

    

    const handleFileInput = async (e: Event) => {
        try {
            if (e.target instanceof HTMLInputElement && e.target.files != null) {
                const newImage = URL.createObjectURL(e.target.files[0]);
                context.values.setImageUrl(newImage);

                const formData = new FormData();
                formData.append("file", e.target.files[0]);
                context.values.setLoading("imageMeta", true);
                const metaPromise = await fetch(import.meta.env.VITE_API_URL + "/api/transform/info", {
                    method: "post",
                    body: formData,
                });
                context.values.setLoading("imageMeta", false);

                const meta = await metaPromise.json();
                setImageMeta(meta);
            }
        } catch (error) {
            context.values.setErrors("connectionIssue", "Issue getting meta data from the server.");
        }
    };

    

    return (
        <section>
            <Show when={context.values.displayErrors()}>
                <For each={narrowKeys(context.values.errors)}>{(item) =>
                    <Show when={context.values.errors[item]}>
                        <div role="alert" class="alert alert-error mt-10">
                            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>{context.values.errors[item]}</p>
                        </div>
                    </Show>
                }</For>

            </Show>
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

                    <Scale fields={context.values.fields} setFields={context.values.setFields} />

                    <div class="join">
                        <TransformButton operation={{ operation: "rotate", angle: -90 }}>
                            -90°
                        </TransformButton>

                        <TransformButton operation={{ operation: "rotate", angle: 90 }}>
                            90°
                        </TransformButton>

                        <TransformButton operation={{ operation: "flip" }}>
                            Flip
                        </TransformButton>

                        <TransformButton operation={{ operation: "flop" }}>
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
                                        <img src={image} class={`object-fill disable-blur w-full contrast-100 ${context.values.loading.imageOperation ? "opacity-50" : ""}`} alt="" />
                                    </>
                                );
                            }}
                        </Show>
                        <Show when={context.values.loading.imageOperation}>
                            <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 loading loading-spinner loading-lg"></span>
                        </Show>
                    </div>
                </Panel>

                <Panel classes="col-span-1">
                    <Show when={context.values.loading.imageMeta}>
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
            
        </section>
    );
};

export default ImageEditor;
