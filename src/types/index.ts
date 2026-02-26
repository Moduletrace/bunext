import type { MatchedRoute, Server } from "bun";
import type { FC, JSX, ReactNode } from "react";

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
    server: Server;
    body?: any;
    query?: any;
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
    component: ReactNode;
    pageProps?: any;
    module?: BunextPageModule;
    pageName: string;
};

export type BunextPageModule = {
    default: FC<any>;
    server?: (
        routeParams: BunxRouteParams,
    ) => Promise<BunextPageModuleServerReturn>;
};

export type BunextPageModuleServerReturn = {
    props?: any;
};

export type BunextPageModuleMetadata = {
    title?: string;
    description?: string;
};
