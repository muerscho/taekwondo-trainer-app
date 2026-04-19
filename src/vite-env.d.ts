/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => Database;
  }
  export interface Database {
    run(sql: string, params?: unknown[]): Database;
    exec(sql: string, params?: unknown[]): { columns: string[]; values: unknown[][] }[];
    prepare(sql: string, params?: unknown[]): Statement;
    export(): Uint8Array;
    close(): void;
  }
  export interface Statement {
    step(): boolean;
    getAsObject(params?: unknown[]): Record<string, unknown>;
    bind(params: unknown[]): boolean;
    free(): boolean;
    run(params?: unknown[]): void;
  }
  export default function initSqlJs(config?: { locateFile?: (file: string) => string }): Promise<SqlJsStatic>;
}
