/// <reference types="astro/client" />
import 'alpinejs';
declare module '@alpinejs/collapse' {
    export default function (): void;
}
declare global {
    interface Window {
        Alpine: any;
    }
}
declare module 'alpinejs' {
    export interface Alpine {
        plugin: (plugin: any) => void;
        //引数をanyにすると、エラーが出なくなる
        store: (name: string, value: object) => any;
        start: () => void;
    }
    const Alpine: Alpine;
    export default Alpine;
}