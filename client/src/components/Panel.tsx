import { ParentComponent } from "solid-js"

const Panel:ParentComponent<{centered?: boolean}> = (props) => {    
    return (
        <div class={`border rounded-lg shadow-lg p-4 ${props.centered ? 'flex justify-center' : ''}`}>
            {props.children}
        </div>
    )
}

export default Panel