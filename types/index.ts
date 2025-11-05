import type { MatchedRoute } from "bun";

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
