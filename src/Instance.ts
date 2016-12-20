import { View } from "quark";

// Creates a Quark instance
export class Instance {
    public rootView: View;

    public rootElement(): HTMLElement { return this.rootView.backing as HTMLElement; }
}