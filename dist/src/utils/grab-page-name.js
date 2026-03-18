export default function grabPageName(params) {
    const pathArr = params.path.split("/");
    const routesIndex = pathArr.findIndex((p) => p == "pages");
    const newPathArr = [...pathArr].slice(routesIndex + 1);
    const filename = newPathArr
        .filter((p) => Boolean(p.match(/./)))
        .map((p) => p.replace(/\.\w+$/, "").replace(/[^a-z]/g, ""))
        .join("-");
    return filename;
}
