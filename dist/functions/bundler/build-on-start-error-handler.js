export default async function buildOnstartErrorHandler(params) {
    // const error_msg = `Build Failed. Please check all your components and imports.`;
    // log.error(error_msg);
    if (global.BUNEXT_BUNDLER_CTX_DISPOSED) {
        return;
    }
    // console.log(`Killing Bundler ...`);
    // console.log(`global.BUNEXT_BUNDLER_CTX_DISPOSED`, global.BUNEXT_BUNDLER_CTX_DISPOSED);
    global.BUNEXT_BUNDLER_CTX_DISPOSED = true;
    global.BUNEXT_RECOMPILING = false;
    global.BUNEXT_IS_SERVER_COMPONENT = false;
    await Promise.all([
        global.BUNEXT_SSR_BUNDLER_CTX?.dispose(),
        global.BUNEXT_BUNDLER_CTX?.dispose(),
    ]);
    global.BUNEXT_SSR_BUNDLER_CTX = undefined;
    global.BUNEXT_BUNDLER_CTX = undefined;
}
