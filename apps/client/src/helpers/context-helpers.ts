import { useContext } from "solid-js"
import { ImageEditorContextObject } from "src/context/ImageEditorContext"

export const useImageEditorContext = () => {
    const context = useContext(ImageEditorContextObject)

    if (context == undefined) {
        throw new Error('Context should be defined.')
    }

    return context
}