/// <reference path="./vm2.d.ts"/>

import { View, ModuleDelegate, ModuleDelegateConstructor, Window, ModuleBacking } from "quark";
import { QKModule } from "./QKModule";
import { VM } from "vm2";

import fs = require("fs");
import { QKLogger } from "./QKLogger";
import { createBacking } from "../ui/views/QKView";
import { QKWindow } from "../ui/QKWindow";

// Creates a Quark instance
export class QKInstance implements ModuleBacking {
    /* Parameters */
    public rootView: View;

    public rootElement(): HTMLElement { return this.rootView.backing as HTMLElement; }

    // Return properties from the context
    public get moduleInstance(): any { return this.context[this.module.info.module]; }
    public get quarkLibrary(): any { return this.context.quark; }
    public get delegateClass(): ModuleDelegateConstructor { return this.moduleInstance[this.module.info.delegate]; }

    // If the instance is running yet
    public running: boolean = false;

    // The module that this instance is running
    public module: QKModule;

    // The window the instance is running in
    public window?: Window;

    public vm: VM; // the vm that runs the whole thing

    public delegate: ModuleDelegate; // the delegate from the context

    // The context that holds the module
    public get context(): any { return this.vm._context; }

    /* Module backing */
    public get qk_window(): Window | undefined { return this.window; }
    public get qk_delegate(): ModuleDelegate { return this.delegate; }

    /* Constructor */
    public constructor(module: QKModule) {
        // Save the module
        this.module = module;

        try {
            // Create the vm and load the source
            this.vm = new VM();
            this.vm.run(fs.readFileSync("node_modules/quark/bundle.js", "utf8")); // Load the quark bundle into the VM // TODO: More elegant
            this.assignBackings(); // Assigns the backings to the Quark library
            this.vm.run(this.module.source); // Load the module into the VM

            // Create the delegate
            this.delegate = new this.delegateClass();

            console.log("Final context", this.context);
        } catch (e) {
            console.log("Error", e, e.stack);
        }
    }

    // Assigns the backing to components of the Quark library
    private assignBackings(): void {
        // Module
        this.quarkLibrary.Module.shared.backing = this;

        // Core
        this.quarkLibrary.Logger.backing = QKLogger;

        // Types
        // TODO: These

        // UI
        this.quarkLibrary.View.createBacking = createBacking;
        this.quarkLibrary.Button.createBacking = () => { console.log("Unimplemented."); return this.quarkLibrary.View.createBacking(); };
        this.quarkLibrary.Label.createBacking = () => { console.log("Unimplemented."); return this.quarkLibrary.View.createBacking(); };
        // TODO: Button and label

        console.log("Assigned backings");
    }

    /* Methods */
    public start(rootElement: HTMLElement) {
        // Make sure not running
        if (this.running) { return; }

        // Save running
        this.running = true;

        // Save the window
        let rootView = new this.quarkLibrary.View(rootElement);
        let qkWindow = new QKWindow(rootView);
        this.window = new this.quarkLibrary.Window(qkWindow);
        if (!rootView || !qkWindow || !this.window) { throw new Error("Could not create `Window` for Quark."); }

        // Create the interface
        this.delegate.createInterface(this.window);
    }
}
