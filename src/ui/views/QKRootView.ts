import { RootView, RootViewBacking, Rect, View } from "quark";
import { QKView } from "./QKView";

export class QKRootView extends QKView implements RootViewBacking {
    protected get qk_rootView(): RootView { return this.qk_view as RootView; }

    public constructor() {
        super();
    }

    public qk_setRect(rect: Rect): void {
        // Do nothing
    }

    public get qk_superview(): View | any {
        // Don't give access to superview
        return undefined;
    }

    public qk_removeFromSuperview(): void {
        // Do nothing
    }

    public qk_setIsHidden(hidden: boolean): any {
        // Do nothing
    }
}

// Register the element with the window
window.customElements.define("qk-root-view", QKRootView);
// This backing cannot be created from Quark, has to be created in native scope
