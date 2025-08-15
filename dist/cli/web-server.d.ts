export interface WebServerConfig {
    port: number;
    host: string;
    agentsDir: string;
    allowOrigins: string[];
    logLevel: string;
}
export declare function startWebServer(config: WebServerConfig): Promise<void>;
//# sourceMappingURL=web-server.d.ts.map