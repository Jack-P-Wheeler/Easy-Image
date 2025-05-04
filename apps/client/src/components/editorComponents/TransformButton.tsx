import { useImageEditorContext } from "@helpers/context-helpers";
import { ParentEditorComponent } from "@helpers/type-helpers";


const TransformButton: ParentEditorComponent = ({ imageTransform, children, operation }) => {
    const context = useImageEditorContext()

    return (
        <button class="join-item btn btn-primary mt-10" onClick={() => imageTransform(operation)} disabled={context.values.guardedImage() ? false : true}>
            {children}
        </button>
    );
};

export default TransformButton;
