import { RootView, WindowBacking } from "quark";

export class QKWindow implements WindowBacking {
    public rootView: RootView;

    public get qk_rootView(): RootView { return this.rootView; }

    public constructor(view: RootView) {
        this.rootView = view;
    }
}
