import genWebHTML from "./generate-web-html";
import grabPageComponent from "./grab-page-component";

type Params = {
    req: Request;
};

export default async function ({ req }: Params): Promise<Response> {
    try {
        const { component, pageName, module, serverRes } =
            await grabPageComponent({ req });

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
    } catch (error: any) {
        return new Response(error.message || `Page Not Found`, {
            status: 404,
        });
    }
}
