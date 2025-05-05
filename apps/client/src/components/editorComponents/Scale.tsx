import { useImageEditorContext } from "@helpers/context-helpers";
import { EditorComponent } from "@helpers/type-helpers";
import TransformButton from "./TransformButton";

const Scale: EditorComponent = ({ fields, setFields }) => {    
    const context = useImageEditorContext()
    
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

            <TransformButton operation={{ operation: "scale" }}>
                Scale
            </TransformButton>

            <button class="join-item btn btn-primary mt-10" disabled={fields.scale == undefined} onClick={() => context.values.imageTransform({ operation: "scale" })}>
                Scale
            </button>
        </div>
    );
};

export default Scale;
