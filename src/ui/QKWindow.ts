import { View, RootView, WindowBacking } from "quark";

export class QKWindow implements WindowBacking {
    public rootView: RootView;

    public get qk_rootView(): View { return this.rootView; }

    public constructor(element: HTMLElement) {
        this.rootView = new RootView(element);
    }
}