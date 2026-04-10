import type { MatchedRoute, Server, WebSocketHandler } from "bun";
import type {
    DetailedHTMLProps,
    FC,
    HtmlHTMLAttributes,
    JSX,
    PropsWithChildren,
    ReactNode,
} from "react";

export type ServerProps = {
    params: Record<string, string>;
    searchParams: Record<string, string>;
    headers: Headers;
    cookies: Record<string, string>;
    body: any;
    method: string;
    url: string;
    pathname: string;
    query: Record<string, string>;
    search: string;
    hash: string;
};

export type StaticProps = {
    params: Record<string, string>;
    searchParams: Record<string, string>;
    headers: Headers;
    cookies: Record<string, string>;
    body: any;
    method: string;
    url: string;
    pathname: string;
    query: Record<string, string>;
    search: string;
    hash: string;
};

export type StaticPaths = string[];

export type StaticParams = Record<string, string>;

export type PageModule = {
    component: React.ComponentType<any>;
    serverProps: ServerProps;
    staticProps: StaticProps;
    staticPaths: StaticPaths;
    staticParams: StaticParams;
};

export type BunextConfig = {
    distDir?: string;
    assetsPrefix?: string;
    origin?: string;
    globalVars?: { [k: string]: any };
    port?: number;
    development?: boolean;
    middleware?: (
        params: BunextConfigMiddlewareParams,
    ) =>
        | Promise<Response | Request | undefined>
        | Response
        | Request
        | undefined;
    defaultCacheExpiry?: number;
    websocket?: WebSocketHandler<any>;
    serverOptions?: Omit<Bun.Serve.Options<any>, "fetch" | "routes">;
};

export type BunextConfigMiddlewareParams = {
    req: Request;
    url: URL;
};

export type GetRouteReturn = {
    match: MatchedRoute;
    module: PageModule;
    component: React.ComponentType<any>;
    serverProps: ServerProps;
    staticProps: StaticProps;
    staticPaths: StaticPaths;
    staticParams: StaticParams;
};

export type BunxRouteParams = {
    req: Request;
    url: URL;
    body?: any;
    query?: any;
    /**
     * Intercept and Transform the response object
     */
    resTransform?: (res: Response) => Promise<Response> | Response;
    server?: Server<any>;
};

export interface PostInsertReturn {
    fieldCount?: number;
    affectedRows?: number;
    insertId?: number;
    serverStatus?: number;
    warningCount?: number;
    message?: string;
    protocol41?: boolean;
    changedRows?: number;
}

export type APIResponseObject<
    T extends { [k: string]: any } = { [k: string]: any },
> = {
    success: boolean;
    payload?: T[] | null;
    singleRes?: T | null;
    stringRes?: string | null;
    numberRes?: number | null;
    postInsertReturn?: PostInsertReturn | null;
    payloadBase64?: string;
    payloadThumbnailBase64?: string;
    payloadURL?: string;
    payloadThumbnailURL?: string;
    error?: any;
    msg?: string;
    queryObject?: any;
    countQueryObject?: any;
    status?: number;
    count?: number;
    errors?: any[];
    debug?: any;
    batchPayload?: any[][] | null;
    errorData?: any;
    token?: string;
    csrf?: string;
    cookieNames?: any;
    key?: string;
    userId?: string | number;
    code?: string;
    createdAt?: number;
    email?: string;
    requestOptions?: any;
    logoutUser?: boolean;
    redirect?: string;
};

export type BunextServerRouteConfig = {
    max_request_body_mb?: number;
};

export type LivePageDistGenParams = {
    component?: FC;
    pageProps?: any;
    module?: BunextPageModule;
    root_module?: BunextRootModule;
    bundledMap?: BundlerCTXMap;
    routeParams?: BunxRouteParams;
    debug?: boolean;
};

export type BunextPageHeadFCProps = {
    serverRes: BunextPageModuleServerReturn;
    ctx?: BunxRouteParams;
};

export type BunextPageModule = {
    default: FC<any>;
    meta?: BunextPageModuleMeta | BunextPageModuleMetaFn;
    Head?: FC<BunextPageHeadFCProps>;
    config?: BunextRouteConfig;
    html_props?: BunextHTMLProps;
};

export type BunextPageServerModule = {
    default?: BunextPageServerFn;
    server?: BunextPageServerFn;
};

export type BunextHTMLProps = DetailedHTMLProps<
    HtmlHTMLAttributes<HTMLHtmlElement>,
    HTMLHtmlElement
>;

export type BunextPageModuleMetaFn = (params: {
    ctx: BunxRouteParams;
    serverRes?: BunextPageModuleServerReturn;
}) => Promise<BunextPageModuleMeta>;

export type BunextPageModuleMeta = {
    title?: string;
    description?: string;
    keywords?: string | string[];
    author?: string;
    robots?: string;
    canonical?: string;
    themeColor?: string;
    og?: BunextPageModuleMetaOG;
    twitter?: BunextPageModuleMetaTwitter;
};

export type BunextPageModuleMetaOG = {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    siteName?: string;
    locale?: string;
};

export type BunextPageModuleMetaTwitter = {
    card?: "summary" | "summary_large_image" | "app" | "player";
    title?: string;
    description?: string;
    image?: string;
    site?: string;
    creator?: string;
};

export type BunextPageServerFn<
    T extends { [k: string]: any } = { [k: string]: any },
> = (
    ctx: Omit<BunxRouteParams, "body">,
) => Promise<BunextPageModuleServerReturn<T>>;

export type BunextRouteConfig = {
    /**
     * Whether to cache the current page
     */
    cachePage?: BunextCachePageType;
    /**
     * Expiry time of the cache in seconds
     */
    cacheExpiry?: number;
};

export type BunextPageModuleServerReturn<
    T extends { [k: string]: any } = { [k: string]: any },
    Q extends { [k: string]: any } = { [k: string]: any },
> = {
    props?: T;
    query?: Q;
    redirect?: BunextPageModuleServerRedirect;
    responseOptions?: ResponseInit;
    /**
     * Whether to cache the current page
     */
    cachePage?: BunextCachePageType;
    /**
     * Expiry time of the cache in seconds
     */
    cacheExpiry?: number;
    url?: BunextPageModuleServerReturnURLObject;
    error?: string;
};

export type BunextCachePageType =
    | boolean
    | ((params: {
          ctx: Omit<BunxRouteParams, "body">;
          serverRes?: BunextPageModuleServerReturn;
      }) => Promise<boolean> | boolean);

export type BunextPageProps<
    T extends { [k: string]: any } = { [k: string]: any },
    Q extends { [k: string]: any } = { [k: string]: any },
> = BunextPageModuleServerReturn<T, Q>;

export type BunextPageModuleServerReturnURLObject = URL & {};

export type BunextPageModuleServerRedirect = {
    destination: string;
    permanent?: boolean;
    status_code?: number;
};

export type BunextPageModuleMetadata = {
    title?: string;
    description?: string;
};

export type GrabPageComponentRes = {
    component?: FC;
    serverRes?: BunextPageModuleServerReturn;
    routeParams?: BunxRouteParams;
    bundledMap?: BundlerCTXMap;
    module?: BunextPageModule;
    root_module?: BunextRootModule;
    debug?: boolean;
};

export type BunextRootModule = BunextPageModule;

export type GrabPageReactBundledComponentRes = {
    component?: FC;
    server_res?: BunextPageModuleServerReturn;
    tsx?: string;
};

export type PageFiles = {
    local_path: string;
    url_path: string;
    file_name: string;
};

export type BundlerCTXMap = {
    path: string;
    hash: string;
    type: string;
    entrypoint: string;
    local_path: string;
    url_path: string;
    file_name: string;
    css_path?: string;
};

export type GlobalHMRControllerObject = {
    controller: ReadableStreamDefaultController<string>;
    page_url: string;
    target_map?: BundlerCTXMap;
    page_props?: any;
};

export type BunextCacheFileMeta = {
    date_created: number;
    paradigm: "html" | "json";
    expiry_seconds?: number;
};

export type BunextRootComponentProps = PropsWithChildren & BunextPageProps;

export type GrabTSXModuleSingleParams = {
    tsx: string;
    page_file_path: string;
};

export type GrabTSXModuleBatchParams = {
    tsx_map: GrabTSXModuleBatchMap[];
};

export type GrabTSXModuleBatchMap = {
    tsx: string;
    page_file_path: string;
};

export type BunextAPIRouteHandler<
    T extends BunextAPIRouteJSONRes = {
        [k: string]: any;
    },
> = (params: BunxRouteParams) => Promise<Response | T> | Response | T;

export type BunextAPIRouteJSONRes = {
    bunext_api_route_res_options?: ResponseInit;
} & {
    [k: string]: any;
};
