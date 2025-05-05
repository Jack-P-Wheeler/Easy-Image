import { EditorComponent } from "@helpers/type-helpers";
import TransformButton from "./TransformButton";
import { createMemo } from "solid-js";

const Scale: EditorComponent = ({ fields, setFields }) => {
    return (
        <div>
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

            <TransformButton operation={{ operation: "scale" }} verification={createMemo(() => fields.scale !== undefined)}>
                Scale
            </TransformButton>
        </div>
    );
};

export default Scale;
