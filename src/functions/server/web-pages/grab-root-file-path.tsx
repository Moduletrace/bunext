import grabDirNames from "../../../utils/grab-dir-names";
import path from "path";
import AppNames from "../../../utils/grab-app-names";
import { existsSync } from "fs";

export default function grabRootFilePath() {
    const { PAGES_DIR } = grabDirNames();

    const root_pages_component_ts_file = `${path.join(PAGES_DIR, AppNames["RootPagesComponentName"])}.ts`;
    const root_pages_component_tsx_file = `${path.join(PAGES_DIR, AppNames["RootPagesComponentName"])}.tsx`;
    const root_pages_component_js_file = `${path.join(PAGES_DIR, AppNames["RootPagesComponentName"])}.js`;
    const root_pages_component_jsx_file = `${path.join(PAGES_DIR, AppNames["RootPagesComponentName"])}.jsx`;

    const root_file_path = existsSync(root_pages_component_tsx_file)
        ? root_pages_component_tsx_file
        : existsSync(root_pages_component_ts_file)
          ? root_pages_component_ts_file
          : existsSync(root_pages_component_jsx_file)
            ? root_pages_component_jsx_file
            : existsSync(root_pages_component_js_file)
              ? root_pages_component_js_file
              : undefined;

    return { root_file_path };
}
