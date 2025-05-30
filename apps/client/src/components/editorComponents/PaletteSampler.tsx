import { EditorComponent } from "@helpers/type-helpers";
import { useImageEditorContext } from "@helpers/context-helpers";
import AnalysisButton from "./AnalysisButton";

const PaletteSampler: EditorComponent = () => {
    const { fields, setFields } = useImageEditorContext().values

    return (
        <div class="border-b-2 pb-4 mb-4">
            <div>
                <label for="palette" class="font-bold block mb-2">
                    Sample Palette
                </label>
                <input
                    required
                    onInput={(e) => setFields("samplePaletteSize", e.target.value)}
                    id="sampleSize"
                    type="number"
                    name="scale"
                    class="input input-bordered"
                    placeholder="4"
                    step="1"
                    min="1"
                    value={4}
                />
            </div>

            <div class="join">
                <AnalysisButton classes="mt-4" operation={{ operation: "sample-palette" }}>
                    Sample
                </AnalysisButton>
            </div>

        </div>
    );
};

export default PaletteSampler;
