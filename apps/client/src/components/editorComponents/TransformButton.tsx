import { useImageEditorContext } from "@helpers/context-helpers";
import { ParentEditorComponent } from "@helpers/type-helpers";

const TransformButton: ParentEditorComponent = ({ children, operation, verification, classes = '' }) => {
    const context = useImageEditorContext()

    return (
        <button class={`join-item btn btn-primary ${classes}`} onClick={() => context.values.imageTransform(operation)} 
        disabled={(verification !== undefined && !verification()) || context.values.guardedImage() === null}>
            {children}
        </button>
    );
};

export default TransformButton;
