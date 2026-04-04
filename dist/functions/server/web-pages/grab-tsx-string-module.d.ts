type Params = {
    tsx: string;
};
export default function grabTsxStringModule<T extends any = any>({ tsx, }: Params): Promise<T>;
export {};
