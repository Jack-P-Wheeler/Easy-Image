import { ParentEditorComponent } from "@helpers/type-helpers";

const TransformButton: ParentEditorComponent = ({ imageTransform, children, operation }) => {
    return (
        <button class="join-item btn btn-primary mt-10" onClick={() => imageTransform(operation)}>
            {children}
        </button>
    );
};

export default TransformButton;
