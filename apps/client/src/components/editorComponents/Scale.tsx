import { EditorComponent } from "@helpers/type-helpers";
import TransformButton from "./TransformButton";
import { createMemo } from "solid-js";
import { useImageEditorContext } from "@helpers/context-helpers";

const Scale: EditorComponent = () => {
    const { fields, setFields } = useImageEditorContext().values
    return (
        <div class="border-b-2 pb-4 mb-4">
            <div>
                <label for="scale" class="font-bold block mb-2">
                    Scale
                </label>
                <input
                    required
                    onInput={(e) => setFields("scale", e.target.value)}
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

            <TransformButton classes="mt-4" operation={{ operation: "scale" }} verification={createMemo(() => fields.scale !== undefined)}>
                Scale
            </TransformButton>
        </div>
    );
};

export default Scale;
