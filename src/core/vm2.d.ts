declare module "vm2" { // See https://www.npmjs.com/package/vm2#vm
    import EventEmitter = NodeJS.EventEmitter;
    export interface VMOptions {
        timeout?: number;
        sandbox?: any;
        compiler?: "javascript" | "coffeescript";
    }

    export class VM extends EventEmitter {
        public options: VMOptions;

        public _context: any;
        public _eventsCount: number;
        public _internal: any;

        public constructor(options?: VMOptions);

        public run(code: string): any;
    }

    export interface NodeVMOptions {
        console?: "inherit" | "redirect" | "off";
        sandbox?: any;
        compiler?: "javascript" | "coffeescript";
        require?: boolean | {
            external?: boolean,
            builtin?: string[],
            root?: string,
            mock?: any,
            context?: "host" | "sandbox",
            import?: string[]
        };
        nesting?: boolean;
        wrapper?: "commonjs" | "none";
    }

    export class NodeVM extends EventEmitter {
        public options: VMOptions;

        public _context: any;
        public _eventsCount: number;
        public _internal: any;
        public _prepareRequire: Function;

        public constructor(options?: NodeVMOptions);

        public require(module: string): any;
        public run(code: string, filename?: string): any;

        public static code(script: string, filename?: string, options?: NodeVMOptions): any;
        public static file(filename: string, options?: NodeVMOptions): any;
    }

    export class VMError extends Error {
        public constructor(message: string);
    }
}
