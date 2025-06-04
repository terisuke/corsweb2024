/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare global {
    interface Window {
        Alpine: import('alpinejs').Alpine;
    }
}

export {};
