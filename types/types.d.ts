// @ts-ignore
declare module '@alpinejs/collapse' {
    // インポートされたモジュールの型定義
    const collapse: any;
    export default collapse;
}

// @ts-ignore
declare module 'alpinejs' {
    // Alpineの型定義
    export interface Alpine {
        plugin: (plugin: any) => void;
        store: (name: string, value: object) => any;
        start: () => void;
    }
}

// @ts-ignore
declare global {
    interface Window {
        Alpine: typeof import('alpinejs');
    }
    interface Alpine {
        $store: {
            theme: {
                isDark: boolean;
                toggle: () => void;
            };
        };
    }
}