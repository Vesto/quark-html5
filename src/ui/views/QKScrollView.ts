import { ScrollView, ScrollViewBacking, Point, Size, View, Color } from "quark";
import { QKView } from "./QKView";

export class QKScrollView extends QKView implements ScrollViewBacking {
    protected get qk_rootView(): ScrollView { return this.qk_view as ScrollView; }

    // An view that holds all the content and defines the size
    private contentView: View;

    public constructor() {
        super();

        // Listen for scroll event and tell the view
        this.addEventListener("scroll", () => {
            this.qk_onScrollCallback(new this.qk_lib.Point(this.scrollLeft, this.scrollTop));
        });
    }

    public qk_init() {
        super.qk_init();

        // Create the content view
        this.contentView = new this.qk_lib.View(); // TODO: Make it so when children query the superview, it gives the `QKScrollView`
        this.contentView.backgroundColor = new Color(0, 0, 0, 0);
        this.style.overflow = null; // Don't have a default overflow behavior
        super.qk_addSubview(this.contentView, 0); // Call on `super` since this overrides `qk_addSubview`
    }

    public qk_onScrollCallback: (offset: Point) => void;

    public qk_setContentSize(size: Size): void {
        this.contentView.rect.size = size;
    }

    public qk_setContentOffset(offset: Point): void {
        this.scrollTo({ left: offset.x, top: offset.y });
    }

    public qk_setScrollsHorizontally(scrolls: boolean): void {
        this.style.overflowX = scrolls ? "scroll" : "hidden";
    }

    public qk_setScrollsVertically(scrolls: boolean): void {
        this.style.overflowY = scrolls ? "scroll" : "hidden";
    }

    public qk_setClipSubviews(clip: boolean) {
        // Override so overflow for this view is always "scroll"
    }

    public qk_addSubview(view: View, index: number): void {
        // Proxy the add subview to the content view
        this.contentView.addSubviewAt(view, index);
    }
}

// Register the element with the window
window.customElements.define("qk-scroll-view", QKScrollView);
export function createScrollViewBacking(): ScrollViewBacking { return new QKScrollView(); }
