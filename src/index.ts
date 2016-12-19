import "./ui/views/QKView";

/*
// Why does this work but not with the above module
// Try extracting TestClass into another module and see if it works
// https://www.typescriptlang.org/docs/handbook/declaration-merging.html
// Has to do some way with the fact that uses .d.ts for the module and .ts for the actua file
import { TestClass } from "../../../../../../Desktop/test-project/src/TestClass";
// import { TestClass } from "test-project";

// declare module "test-project" {
declare module "../../../../../../Desktop/test-project/src/TestClass" {
    interface TestClass {
        doSomethingElse(): void;
    }
}

TestClass.prototype.doSomethingElse = function(): void {
    console.log("else");
    this.someFunc(); // Notice it can see itself and it merges the interface with the class
};
*/
