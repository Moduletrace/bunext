import type { MatchedRoute, ServeOptions, Server, WebSocketHandler } from "bun";
import type { FC, JSX, PropsWithChildren, ReactNode } from "react";

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
    serverOptions?: ServeOptions;
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
    maxRequestBodyMB?: number;
};

export type PageDistGenParams = {
    pageName: string;
    page_file: string;
};

export type LivePageDistGenParams = {
    component: ReactNode;
    head?: FC<BunextPageHeadFCProps>;
    pageProps?: any;
    module?: BunextPageModule;
    bundledMap?: BundlerCTXMap;
    meta?: BunextPageModuleMeta;
    routeParams?: BunxRouteParams;
    debug?: boolean;
};

export type BunextPageHeadFCProps = {
    serverRes: BunextPageModuleServerReturn;
    ctx?: BunxRouteParams;
};

export type BunextPageModule = {
    default: FC<any>;
    server?: BunextPageServerFn;
    meta?: BunextPageModuleMeta | BunextPageModuleMetaFn;
    Head?: FC<BunextPageHeadFCProps>;
    config?: BunextRouteConfig;
};

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
    og?: {
        title?: string;
        description?: string;
        image?: string;
        url?: string;
        type?: string;
        siteName?: string;
        locale?: string;
    };
    twitter?: {
        card?: "summary" | "summary_large_image" | "app" | "player";
        title?: string;
        description?: string;
        image?: string;
        site?: string;
        creator?: string;
    };
};

export type BunextPageServerFn<
    T extends { [k: string]: any } = { [k: string]: any },
> = (
    ctx: Omit<BunxRouteParams, "body">,
) => Promise<BunextPageModuleServerReturn<T>>;

export type BunextRouteConfig = {
    cachePage?: boolean;
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
    cachePage?: boolean;
    /**
     * Expiry time of the cache in seconds
     */
    cacheExpiry?: number;
    url?: BunextPageModuleServerReturnURLObject;
};

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
    component: JSX.Element;
    serverRes?: BunextPageModuleServerReturn;
    routeParams?: BunxRouteParams;
    bundledMap?: BundlerCTXMap;
    module: BunextPageModule;
    meta?: BunextPageModuleMeta;
    head?: FC<BunextPageHeadFCProps>;
    debug?: boolean;
};

export type GrabPageReactBundledComponentRes = {
    component: JSX.Element;
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
