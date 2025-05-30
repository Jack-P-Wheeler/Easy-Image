import { useImageEditorContext } from "@helpers/context-helpers";
import { ParentAnalysisComponent } from "@helpers/type-helpers";

const AnalysisButton: ParentAnalysisComponent = ({ children, operation, verification, classes = '' }) => {
    const context = useImageEditorContext()

    return (
        <button class={`join-item btn btn-primary ${classes}`} onClick={() => context.values.imageAnalysis(operation)} 
        disabled={(verification !== undefined && !verification()) || context.values.guardedImage() === null}>
            {children}
        </button>
    );
};

export default AnalysisButton;
