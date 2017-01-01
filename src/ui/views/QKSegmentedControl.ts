import { SegmentedControl, SegmentedControlBacking, Button, Appearance, SegmentItem, View } from "quark";
import { QKView } from "./QKView";

export class QKSegmentedControl extends QKView implements SegmentedControlBacking {
    protected get qk_segmentedControl(): SegmentedControl { return this.qk_view as SegmentedControl; }

    private totalSegmentWidth: number = 0; // All SegmentItem.width added up
    private segmentButtons: Button[] = [];

    public constructor() {
        super();
    }

    public qk_appearanceChanged(appearance: Appearance) {
        super.qk_appearanceChanged(appearance);

        // Style this view
        appearance.normalControl.styleView(this.qk_view);

        // Set the style of each segment and restyle them all
        for (let segment of this.segmentButtons) {
            segment.appearance = appearance;
        }
        this.restyleSegments();
    }

    protected _qk_layout() {
        super._qk_layout();

        let xShift = 0;
        for (let i = 0; i < this.segmentButtons.length; i++) {
            let segment = this.segmentButtons[i];

            // Resize the view to the appropriate percentage
            let segmentWidth = this.qk_view.rect.width * this.qk_segmentedControl.segments[i].width / this.totalSegmentWidth;
            segment.rect = new this.qk_lib.Rect(
                xShift, 0,
                segmentWidth, this.qk_view.rect.height
            );

            // Add to the x shift for the next element
            xShift += segmentWidth;
        }
    }

    public get qk_subviews(): View[] {
        // Filter out the buttons from the subviews
        return super.qk_subviews.filter(view => {
            if (view instanceof this.qk_lib.Button) {
                // `as any` to silence error where it can't tell that `this.qk_lib.Button` is a Button
                return this.segmentButtons.indexOf(view as any) === -1;
            } else {
                return true;
            }
        });
    }

    public qk_setIsEnabled(enabled: boolean): void {
        // TODO: This
    }

    public qk_setSegments(segments: SegmentItem[]): void {
        // Clear previous segments
        this.clearSegments();

        // Recreate the buttons
        for (let i = 0; i < segments.length; i++) {
            let segment = segments[i];

            // Create the button
            let button = new this.qk_lib.Button() as Button;
            button.onButtonUp = button => {
                this.qk_segmentedControl.selectedIndex = i;
            };

            // Set enabled
            button.isEnabled = segment.isEnabled;

            // Configure the button
            if (typeof segment.content === "string") {
                button.title = segment.content;
            } else if (segment.content instanceof this.qk_lib.Image) {
                button.title = "Image";
            }

            // Add the width
            this.totalSegmentWidth += segment.width;

            // Add to view
            this.qk_view.addSubview(button);

            // Add it
            this.segmentButtons.push(button);
        }
    }

    public qk_setSelectedIndex(index: number | any): void {
        this.restyleSegments();
    }

    private clearSegments(): void {
        for (let segment of this.segmentButtons) {
            // Remove from the superview
            segment.removeFromSuperview();

            // Remove the callbacks
            segment.onButtonDown = undefined;
            segment.onButtonUp = undefined;
        }

        // Empty the array
        this.totalSegmentWidth = 0;
        this.segmentButtons = [];
    }

    private restyleSegments(): void {
        // All the buttons already have the appropriate style since they are a subview of this view, and when the
        // appearance is changed for this view, it was set for them.

        for (let i = 0; i < this.segmentButtons.length; i++) {
            let segment = this.segmentButtons[i];

            // Set if emphasized
            segment.isEmphasized = i === this.qk_segmentedControl.selectedIndex;

            // Remove corner radius
            segment.cornerRadius = 0;
        }
    }
}

// Register the element with the window
window.customElements.define("qk-segmented-control", QKSegmentedControl);
export function createSegmentedControlBacking(): SegmentedControlBacking { return new QKSegmentedControl(); }
