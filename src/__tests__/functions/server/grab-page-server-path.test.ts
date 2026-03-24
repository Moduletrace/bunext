import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import path from "path";
import fs from "fs";
import grabPageServerPath from "../../../../src/functions/server/web-pages/grab-page-server-path";

const tmpDir = path.join(import.meta.dir, "__tmp_server_path__");

beforeAll(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("grabPageServerPath", () => {
    it("returns undefined when no companion file exists", () => {
        const { server_file_path } = grabPageServerPath({
            file_path: path.join(tmpDir, "index.tsx"),
        });
        expect(server_file_path).toBeUndefined();
    });

    it("resolves .server.ts companion for a .tsx page", () => {
        const serverFile = path.join(tmpDir, "profile.server.ts");
        fs.writeFileSync(serverFile, "export default async () => ({})");

        const { server_file_path } = grabPageServerPath({
            file_path: path.join(tmpDir, "profile.tsx"),
        });

        expect(server_file_path).toBe(serverFile);
    });

    it("resolves .server.tsx companion when only .server.tsx exists", () => {
        const serverFile = path.join(tmpDir, "about.server.tsx");
        fs.writeFileSync(serverFile, "export default async () => ({})");

        const { server_file_path } = grabPageServerPath({
            file_path: path.join(tmpDir, "about.tsx"),
        });

        expect(server_file_path).toBe(serverFile);
    });

    it("prefers .server.ts over .server.tsx when both exist", () => {
        const tsFile = path.join(tmpDir, "blog.server.ts");
        const tsxFile = path.join(tmpDir, "blog.server.tsx");
        fs.writeFileSync(tsFile, "export default async () => ({})");
        fs.writeFileSync(tsxFile, "export default async () => ({})");

        const { server_file_path } = grabPageServerPath({
            file_path: path.join(tmpDir, "blog.tsx"),
        });

        expect(server_file_path).toBe(tsFile);
    });

    it("resolves companion for a .ts page file", () => {
        const serverFile = path.join(tmpDir, "api-page.server.ts");
        fs.writeFileSync(serverFile, "export default async () => ({})");

        const { server_file_path } = grabPageServerPath({
            file_path: path.join(tmpDir, "api-page.ts"),
        });

        expect(server_file_path).toBe(serverFile);
    });
});
