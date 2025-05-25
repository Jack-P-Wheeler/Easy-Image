import { EditorComponent } from "@helpers/type-helpers";
import TransformButton from "./TransformButton";
import { createEffect, createMemo, For } from "solid-js";
import { useImageEditorContext } from "@helpers/context-helpers";
import { RGBTuple } from "@types";
import { rgbToHex, textContrastCheck } from "@helpers/utils";

const Dither: EditorComponent = () => {
    const { fields, setFields } = useImageEditorContext().values

    const palettes: Array<Array<RGBTuple>> = [
        [[255, 255, 255], [255, 0, 0], [0, 255, 255], [58, 55, 61]],
        [[8, 24, 32], [52, 104, 86], [136, 192, 112], [224, 248, 208]],
        [[0, 0, 0], [255, 255, 255]],
        [[251, 187, 173], [238, 134, 149], [74, 122, 150], [51, 63, 88], [41, 40, 49]],
        [[251, 187, 173], [238, 134, 149], [74, 122, 150], [51, 63, 88], [41, 40, 49], [255, 255, 255], [52, 104, 86], [136, 192, 112], [224, 248, 208]]
    ]

    return (
        <div class="border-b-2 pb-4 mb-4">
            <div>
                <label for="palette" class="font-bold block mb-2">
                    Palette Select
                </label>

                <For each={palettes}>
                    {(palette) => {
                        return (
                            <button onClick={(e) => setFields("ditherPalette", palette)} class="mb-10 flex flex-wrap">
                                {
                                    palette.map((color) => {
                                        const hexColor = rgbToHex(color)
                                        return <div class="badge font-bold" style={`background-color: #${hexColor}; color: ${textContrastCheck(color) ? 'black' : 'white'}`}>#{hexColor}</div>
                                    })
                                }
                            </button>
                        )
                    }
                    }
                </For>
            </div>

            <div class="join">
                <TransformButton classes="mt-4" operation={{ operation: "dither" }} verification={createMemo(() => fields.ditherPalette !== undefined)}>
                    Dither
                </TransformButton>
                <TransformButton classes="mt-4" operation={{ operation: "ordered" }} verification={createMemo(() => fields.ditherPalette !== undefined)}>
                    Ordered
                </TransformButton>
            </div>

        </div>
    );
};

export default Dither;
