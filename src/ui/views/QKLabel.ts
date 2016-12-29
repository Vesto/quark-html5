import { LabelBacking, Font, Color, LineBreakMode, TextAlignmentMode } from "quark";
import { colorToCSS, QKView } from "./QKView";

export class QKLabel extends QKView implements LabelBacking {
    public constructor() {
        super();

        // Set to table-cell display so vertical center alignment works with multiple lines
        this.style.display = "table-cell";
    }

    get qk_text(): string { return this.textContent ? this.textContent : ""; }
    set qk_text(text: string) { this.textContent = text; }

    public qk_font: Font; // TODO: Implement

    private _qk_textColor: Color;
    public get qk_textColor(): Color { return this._qk_textColor; }
    public set qk_textColor(color: Color) {
        this._qk_textColor = color;
        this.style.color = colorToCSS(color);
    }

    public qk_lineCount: number; // TODO: Implement

    private _qk_lineBreakMode: LineBreakMode;
    public get qk_lineBreakMode(): LineBreakMode { return this._qk_lineBreakMode; }
    public set qk_lineBreakMode(mode: LineBreakMode) {
        // Save the mode
        this._qk_lineBreakMode = mode;

        // Get the CSS mode
        let cssMode: string;
        switch (mode) {
            case LineBreakMode.WordWrap:
                cssMode = "normal";
                break;
            case LineBreakMode.CharWrap:
                cssMode = "break-word";
                break;
            default:
                return;
        }

        // Set the property
        this.style.wordWrap = cssMode;
    }

    private _qk_alignmentMode: TextAlignmentMode;
    get qk_alignmentMode(): TextAlignmentMode { return this._qk_alignmentMode; }
    set qk_alignmentMode(mode: TextAlignmentMode) {
        // Save the mode
        this._qk_alignmentMode = mode;

        // Get the CSS mode
        let cssMode: string;
        switch (mode) {
            case TextAlignmentMode.Left:
                cssMode = "left";
                break;
            case TextAlignmentMode.Right:
                cssMode = "right";
                break;
            case TextAlignmentMode.Center:
                cssMode = "center";
                break;
            case TextAlignmentMode.Justify:
                cssMode = "justify";
                break;
            default:
                return;
        }

        // Set the alignment
        this.style.textAlign = cssMode;
    }

    // TODO: vertical alignment
}

// Register the element with the window
window.customElements.define("qk-label", QKLabel);
export function createLabelBacking(): LabelBacking { return new QKLabel(); }
