export interface ApiServerConfig {
    port: number;
    host: string;
    agentsDir: string;
    allowOrigins: string[];
    logLevel: string;
}
export declare function startApiServer(config: ApiServerConfig): Promise<void>;
//# sourceMappingURL=api-server.d.ts.map