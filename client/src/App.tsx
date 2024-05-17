import type { Component } from "solid-js";
import { createEffect, onMount } from "solid-js";
import { MetaProvider, Title, Link, Meta } from "@solidjs/meta";
import { themeChange } from "theme-change";
import ThemeSwitch from "@components/ThemeSwitch";

const App: Component = () => {
    onMount(async () => {
        themeChange();
    });
    

    return (
        <MetaProvider>
            <Title>Easy Image</Title>
            <ThemeSwitch bruh="wef"/>
            
            <button class="btn btn-primary">Click</button>
        </MetaProvider>
    );
};

export default App;
