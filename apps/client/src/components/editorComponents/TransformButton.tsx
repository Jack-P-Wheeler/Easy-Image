import { useImageEditorContext } from "@helpers/context-helpers";
import { ParentEditorComponent } from "@helpers/type-helpers";


const TransformButton: ParentEditorComponent = ({ children, operation }) => {
    const context = useImageEditorContext()

    return (
        <button class="join-item btn btn-primary mt-10" onClick={() => context.values.imageTransform(operation)} disabled={context.values.guardedImage() ? false : true}>
            {children}
        </button>
    );
};

export default TransformButton;
