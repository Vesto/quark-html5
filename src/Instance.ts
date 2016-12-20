import { View, ModuleDelegate } from "quark";
import { Module } from "./Module";

// Creates a Quark instance
export class Instance {
    public rootView: View;

    public rootElement(): HTMLElement { return this.rootView.backing as HTMLElement; }

    public get moduleInstance(): any { return this.context[this.module.info.module]; }
    public get delegate(): ModuleDelegate { return this.moduleInstance[this.module.info.module]; }

    // The context in which the module lives
    public context: any;
    public module: Module;

    public constructor(module: Module) {
        // Save the module
        this.module = module;

        // Evaluate the source into the context. This will
        this.context = {};
        // (function() { eval(module.source); }).call(this.context); // TODO: this
        // console.log(this.context);
        // console.log(this.delegate);
    }
}
