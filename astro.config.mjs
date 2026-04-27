// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },
    integrations: [
        starlight({
            customCss: ["./src/styles/theme.css"],
            title: "DappFence",
            description: "Cryptographic frontend integrity verification for web applications.",
            social: [
                { icon: "github", label: "GitHub", href: "https://github.com/coinspect/dappfence" },
            ],
            sidebar: [
                {
                    label: "Getting Started",
                    autogenerate: { directory: "getting-started" },
                },
                {
                    label: "Core Concepts",
                    autogenerate: { directory: "core-concepts" },
                },
                {
                    label: "Integration",
                    autogenerate: { directory: "integration" },
                },
                {
                    label: "Reference",
                    autogenerate: { directory: "reference" },
                },
            ],
        }),
    ],
});
