import vm = require("vm");

import { View, ModuleDelegate, ModuleDelegateConstructor, Window } from "quark";
import { QKModule } from "./QKModule";
import { QKWindow } from "./ui/QKWindow";

// Creates a Quark instance
export class QKInstance {
    public rootView: View;

    public rootElement(): HTMLElement { return this.rootView.backing as HTMLElement; }

    public get moduleInstance(): any { return this.context[this.module.info.module]; }
    public get delegateClass(): ModuleDelegateConstructor { return this.moduleInstance[this.module.info.delegate]; }

    // If the instance is running yet
    public running: boolean = false;

    // The module that this instance is running
    public module: QKModule;

    // The context in which the module lives
    public context: any;

    // The instantiated delegate
    public delegate: ModuleDelegate;

    // The window the instance is running in
    public window?: Window;

    public constructor(module: QKModule) {
        // Save the module
        this.module = module;

        // Load the script
        // `quark` already configured by other classes here
        this.context = { quark: require("quark") };
        let script = new vm.Script(this.module.source);
        script.runInNewContext(this.context);

        // Create the delegate
        this.delegate = new this.delegateClass();
    }

    public start(qkWindow: QKWindow) {
        // Make sure not running
        if (this.running) { return; }

        // Save running
        this.running = true;

        // Save the window
        this.window = new Window(qkWindow);

        // Create the interface
        this.delegate.createInterface(this.window);
    }
}
