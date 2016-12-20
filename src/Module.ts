import fs = require("fs");
import * as URI from "urijs";

export class ModuleInfo {
    // The keys used in the info.js file
    private static nameKey: string = "name";
    private static versionKey: string = "version";
    private static moduleKey: string = "module";
    private static delegateKey: string = "delegate";
    private static buildKey: string = "build";
    private static resourcesKey: string = "resources";

    public constructor(
        public readonly name: string,
        public readonly version: string,
        public readonly module: string,
        public readonly delegate: string,
        public readonly build: string,
        public readonly resources: string
    ) {

    }

    public static fromURL(url: URI) {
        // Read and parse the file
        let contents = fs.readFileSync(url.toString(), "utf8");
        let info = JSON.parse(contents);

        // Return the module
        return new ModuleInfo(
            info[ModuleInfo.nameKey],
            info[ModuleInfo.versionKey],
            info[ModuleInfo.moduleKey],
            info[ModuleInfo.delegateKey],
            info[ModuleInfo.buildKey],
            info[ModuleInfo.resourcesKey]
        );
    }
}

export class ModuleResource {
    public readonly fileName: string; // File name without suffix
    public get suffix(): string { return this.url.suffix(); }

    public constructor(public readonly url: URI) {
        this.fileName = url.clone().suffix("").filename(); // Clones, removes suffix, and gets the file name
    }
}

export class Module {
    private static infoRelativePath = "info.json";

    // get infoURL(): URI { return this.baseUrl.absoluteTo(Module.infoRelativePath); }
    get infoURL(): URI { return this.baseUrl.clone().segment(Module.infoRelativePath); }
    get buildURL(): URI { return this.baseUrl.clone().segment(this.info.build); }
    get resourcesURL(): URI { return this.baseUrl.clone().segment(this.info.resources); }

    public readonly baseUrl: URI;
    public readonly info: ModuleInfo;
    public readonly source: string;
    public readonly resources: ModuleResource[];

    public constructor(public readonly url: URI) {
        this.baseUrl = url.segment("/").normalize();
        this.info = this.loadInfo();
        this.source = this.loadSource();
        this.resources = this.indexResources();
    }

    /* Module loading */
    private loadInfo(): ModuleInfo {
        return ModuleInfo.fromURL(this.infoURL);
    }

    private loadSource(): string {
        return fs.readFileSync(this.buildURL.toString(), "utf8");
    }

    private indexResources(url: URI | undefined = undefined): ModuleResource[] {
        // Use the basic URL or resources URL
        url = url ? url : this.resourcesURL;

        // List files in the directory and compile files to `resources`
        let resources: ModuleResource[] = [];
        let files = fs.readdirSync(url.readable());
        for (let file of files) {
            let absoluteURL = url.clone().segment(file); // Get the path to the file
            let stats = fs.statSync(absoluteURL.readable()); // Get statistics on the file
            if (stats.isDirectory()) { // If directory, recursively get resources
                absoluteURL.segment("/"); // Convert file to a path
                resources.push(...this.indexResources(absoluteURL));
            } else { // Add this resource
                resources.push(new ModuleResource(absoluteURL)); // Push a new resource item
            }
        }

        return resources;
    }

    /* Module usage */
    public loadResource(name: string, suffix: string | undefined): ModuleResource | undefined {
        for (let resource of this.resources) {
            if (
                resource.fileName === name && // Same file name and
                (suffix && suffix === resource.suffix || !suffix) // Has matching suffix or no suffix requested
            ) {
                return resource;
            }
        }

        return undefined;
    }
}
