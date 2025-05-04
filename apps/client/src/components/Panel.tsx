import { ParentComponent } from "solid-js"

const Panel:ParentComponent<{centered?: boolean, classes?: string}> = (props) => {    
    return (
        <div class={`border rounded-lg shadow-lg p-4 ${props.centered ? 'flex justify-center' : ''} ${props.classes ?? ''}`}>
            {props.children}
        </div>
    )
}

export default Panel