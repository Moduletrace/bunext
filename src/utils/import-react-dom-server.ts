import path from "path";
import reactDomServer from "react-dom/server";

export default async function importReactDomServer() {
    try {
        const reactDomServerDynamicImport = await import(
            path.join(process.cwd(), "node_modules", "react-dom", "server")
        );

        if (!reactDomServerDynamicImport.renderToString) {
            return reactDomServer;
        }

        return reactDomServerDynamicImport;
    } catch (error) {
        return reactDomServer;
    }
}
