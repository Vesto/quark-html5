import fs = require("fs");
import URI = uri.URI;

export class QKModuleInfo {
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
        return new QKModuleInfo(
            info[QKModuleInfo.nameKey],
            info[QKModuleInfo.versionKey],
            info[QKModuleInfo.moduleKey],
            info[QKModuleInfo.delegateKey],
            info[QKModuleInfo.buildKey],
            info[QKModuleInfo.resourcesKey]
        );
    }
}

export class QKModuleResource {
    public readonly fileName: string; // File name without suffix
    public get suffix(): string { return this.url.suffix(); }

    public constructor(public readonly url: URI) {
        this.fileName = url.clone().suffix("").filename(); // Clones, removes suffix, and gets the file name
    }
}

export class QKModule {
    private static infoRelativePath = "info.json";

    // get infoURL(): URI { return this.baseUrl.absoluteTo(QKModule.infoRelativePath); }
    get infoURL(): URI { return this.baseUrl.clone().segment(QKModule.infoRelativePath); }
    get buildURL(): URI { return this.baseUrl.clone().segment(this.info.build); }
    get resourcesURL(): URI { return this.baseUrl.clone().segment(this.info.resources); }

    public readonly baseUrl: URI;
    public readonly info: QKModuleInfo;
    public readonly source: string;
    public readonly resources: QKModuleResource[];

    /* Constructor */
    public constructor(public readonly url: URI) {
        this.baseUrl = url.segment("/").normalize();
        this.info = this.loadInfo();
        this.source = this.loadSource();
        this.resources = this.indexResources();
    }

    /* QKModule loading */
    private loadInfo(): QKModuleInfo {
        return QKModuleInfo.fromURL(this.infoURL);
    }

    private loadSource(): string {
        return fs.readFileSync(this.buildURL.toString(), "utf8");
    }

    private indexResources(url: URI | undefined = undefined): QKModuleResource[] {
        // Use the basic URL or resources URL
        url = url ? url : this.resourcesURL;

        // List files in the directory and compile files to `resources`
        let resources: QKModuleResource[] = [];
        let files = fs.readdirSync(url.readable());
        for (let file of files) {
            let absoluteURL = url.clone().segment(file); // Get the path to the file
            let stats = fs.statSync(absoluteURL.readable()); // Get statistics on the file
            if (stats.isDirectory()) { // If directory, recursively get resources
                absoluteURL.segment("/"); // Convert file to a path
                resources.push(...this.indexResources(absoluteURL));
            } else { // Add this resource
                resources.push(new QKModuleResource(absoluteURL)); // Push a new resource item
            }
        }

        return resources;
    }

    /* QKModule usage */
    public loadResource(name: string, suffix: string | undefined): QKModuleResource | undefined {
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
