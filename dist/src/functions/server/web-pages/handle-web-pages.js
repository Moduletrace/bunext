import genWebHTML from "./generate-web-html";
import grabPageComponent from "./grab-page-component";
import writeWebPageHydrationScript from "./write-web-page-hydration-script";
export default async function ({ req }) {
    try {
        const { component, pageName, module, serverRes } = await grabPageComponent({ req });
        const html = await genWebHTML({
            component,
            pageProps: serverRes,
            pageName,
            module,
        });
        // writeWebPageHydrationScript({
        //     component,
        //     pageName,
        //     module,
        //     pageProps: serverRes,
        // });
        return new Response(html, {
            headers: {
                "Content-Type": "text/html",
            },
        });
    }
    catch (error) {
        return new Response(error.message || `Page Not Found`, {
            status: 404,
        });
    }
}
