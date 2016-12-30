/// <reference path="./font-manager.d.ts" />

import { findFontsSync } from "font-manager";
import { FontBacking, FontDescriptor } from "quark";
import { getAvailableFontsSync } from "font-manager";

export let QKFont: FontBacking = {
    qk_fontVariations(descriptor: FontDescriptor): FontDescriptor[] {
        return findFontsSync({ // Map from FontDescriptor => ManagerDescriptor and query
            family: descriptor.family,
            italic: descriptor.italic,
            weight: descriptor.weight,
            width: descriptor.width
        })
            .map(d => ({ // Convert from ManagerDescriptor => FontDescriptor and return
                family: d.family ? d.family : "",
                italic: d.italic,
                weight: d.weight,
                width: d.width
            }));
    },
    qk_listFonts(): FontDescriptor[] {
        return getAvailableFontsSync()
            .map(d => ({ // Convert from ManagerDescriptor => FontDescriptor and return
                family: d.family ? d.family : "",
                italic: d.italic,
                weight: d.weight,
                width: d.width
            }));
    }
};

// declare global {
//     interface Document {
//         fonts: FontFaceSet;
//     }
//
//     interface FontFaceDescriptors {
//         style?: string;
//         weight?: string;
//         stretch?: string;
//         unicodeRange?: string;
//         variant?: string;
//         featureSettings?: string;
//     }
//
//     class FontFace {
//         public family: string;
//         public style: string;
//         public weight: string;
//         public stretch: string;
//         public unicodeRange: string;
//         public variant: string;
//         public featureSettings: string;
//
//         public readonly status: "unloaded" | "loading" | "loaded" | "error";
//
//         public constructor(family: string, source: string | ArrayBuffer, descriptors?: FontFaceDescriptors);
//
//         public load(): Promise<FontFace>;
//         public readonly loaded: Promise<boolean>;
//     }
//
//     class FontFaceSet {
//         public readonly status: "loading" | "loaded";
//
//         public add(face: FontFace): void;
//         public check(font: string, text?: string): boolean;
//         public clear(): void;
//         // noinspection ReservedWordAsName
//         public delete(face: FontFace): void;
//         public load(face: FontFace, text?: string): Promise<FontFace[]>;
//         public ready(): Promise<FontFaceSet>;
//     }
// }

// class FontTester { // http://download.remysharp.com/font.js
//     private static testString: string = "mmmmmmmmmwwwwwww";
//     private static testFont: "\"Comic Sans MS\"";
//     private static notInstalledWidth: number = 0;
//     private static testBed: undefined;
//     private static testId: 0;
//
//     public static setup() {
//         // Append the style
//         let css =
//             `#fontInstalledTest, #fontTestBed {
//                 position: absolute;
//                 left: -9999px;
//                 top: 0;
//                 visibility: hidden;
//             }
//             #fontInstalledTest {
//                 font-size: 50px!important;
//                 font-family: ${this.testFont}
//             }`;
//         let cssElement = document.createElement("style");
//         cssElement.innerHTML = css;
//         document.head.appendChild(cssElement);
//
//         // Append the test beds
//         let fontTestBed = document.createElement("div");
//         fontTestBed.id = "fontTestBed";
//
//         let fontInstallTestBed = document.createElement("span");
//         fontInstallTestBed.id = "fontInstallTest";
//         fontInstallTestBed.classList.add("fonttest");
//
//         this.notInstalledWidth = fontInstallTestBed.getBoundingClientRect().width;
//     }
//
//     public static isInstalled(fontName: string) {
//         // Increase the test ID
//         this.testId++;
//     }
// }
