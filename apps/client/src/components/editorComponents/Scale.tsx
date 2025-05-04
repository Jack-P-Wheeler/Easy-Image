import { EditorComponent } from "@helpers/type-helpers";
import { editorField } from "src/hooks/editorField";

const Scale: EditorComponent = ({ fields, setFields, imageTransform }) => {    
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

            <button use:editorField class="join-item btn btn-primary mt-10" disabled={fields.scale == undefined} onClick={() => imageTransform({ opperation: "scale" })}>
                Scale
            </button>
        </div>
    );
};

export default Scale;
