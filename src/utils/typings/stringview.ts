declare module "stringview.js" { // https://developer.mozilla.org/en-US/Add-ons/Code_snippets/StringView
    class StringView {
        // Instance properties
        public encoding: string;
        public buffer: any;
        public rawData: ArrayBufferView;
        public bufferView: ArrayBufferView;

        // Constructor
        public constructor(input: any, encoding?: string, startOffset?: number, length?: number);
        public static makeFromBase64(base64String: string, encoding?: string, byteOffset?: number, length?: number): void;
        public static bytesToBase64(uint8Array: Uint8Array): string;
        public static base64ToBytes(base64String: string, regSize?: number): Uint8Array;
        public static loadUTF8CharCode(typedArray: any, index: number): number;
        public static putUTF8CharCode(typedArray: any, charCode: number, index: number): void;
        public static getUTF8CharLength(charCode: number): number;
        public static loadUTF16CharCode(typedArray: any, index: number): number;
        public static putUTF16CharCode(typedArray: any, charCode: number, index: number): void;
        public static getUTF16CharLength(charCode: number): number;
        public static b64ToUint6(charCode: number): number;
        public static uint6ToB64(uint6: number): string;

        // Instance methods
        public makeIndex(charactersLength?: number, startFrom?: number): number;
        public toBase64(wholeBuffer?: boolean): string;
        public subview(characterOffset: number, charactersLength?: number): StringView;
        public forEachChar(
            callback: (charCode: number, characterOffset: number, rawOffset: number, rawDataArray: any) => void,
            thisObject: any,
            characterOffset: number,
            charactersLength: number
        ): void;
        public valueOf(): string;
        public toString(): string;

    }
}
