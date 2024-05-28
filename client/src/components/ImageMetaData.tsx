import { Metadata } from "sharp";
import { Component, For } from "solid-js";

const ImageMetaData: Component<{ data: Metadata }> = ({ data }: { data: Metadata }) => {

    const formatedMetaValues = (key: keyof Metadata): any => {
        let value: any = false;
        switch (key) {
            case "background":
                value = typeof data.background == "object" ? `${data.background.r}, ${data.background.g}, ${data.background.b}` : data.background;
                break;
            case "xmp":
                value = 'Buffer';
                break;
            default:
                value = data[key];
                break;
        }

        if (value == "" || value === false) {
            value = 'N/A'
        }

        return value
    };

    return (
        <For each={Object.keys(data) as Array<keyof Metadata>}>
            {(item: keyof Metadata) => {
                return (
                    <p>
                        <span class="font-bold">{item}</span>: {formatedMetaValues(item)}
                    </p>
                );
            }}
        </For>
    );
};

export default ImageMetaData;
