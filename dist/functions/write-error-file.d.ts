export default function writeErrorFile({ exitCode, error, }: {
    error?: Bun.ErrorLike;
    exitCode: number | null;
}): void;
