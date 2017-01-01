declare module "font-manager" {
    export interface FontDescriptor {
        path?: string;
        postscript?: string;
        family?: string;
        style?: string;
        weight?: number;
        width?: number;
        italic?: boolean;
        monospace?: boolean;
    }

    export function getAvailableFontsSync(): FontDescriptor[];
    export function getAvailableFonts(callback: (fonts: FontDescriptor[]) => void): void;

    export function findFontsSync(fontDescriptor: FontDescriptor): FontDescriptor[];
    export function findFonts(fontDescriptor: FontDescriptor, callback: (fonts: FontDescriptor[]) => void): void;

    export function findFontSync(fontDescriptor: FontDescriptor): FontDescriptor;
    export function findFont(fontDescriptor: FontDescriptor, callback: (font: FontDescriptor) => void): void;

    export function substituteFontSync(postscriptName: string, text: string): FontDescriptor;
    export function substituteFont(postscriptName: string, text: string, callback: (font: FontDescriptor) => void): void;
}
