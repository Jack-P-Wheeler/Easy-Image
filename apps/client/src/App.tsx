import type { Component } from "solid-js";
import { MetaProvider, Title } from "@solidjs/meta";
import ImageEditor from "@components/ImageEditor";

const App: Component = () => {
    

    return (
        <MetaProvider>
            <Title>Easy Image</Title>
            <main class="max-w-page mx-auto">
                <h1 class="text-center text-3xl font-bold mt-10">Easy Image</h1>
                <p class="text-neutral text-center">By <a href="https://jackwheeler.ca/" class="underline hover:no-underline" target="_blank">Jack Wheeler</a></p>
                <ImageEditor/>
            </main>
        </MetaProvider>
    );
};

export default App;
