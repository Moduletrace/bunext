import type { PropsWithChildren } from "react";

export default function DefaultNotFoundPage({ children }: PropsWithChildren) {
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "20px",
            }}
        >
            <h1>404 Not Found</h1>
            <span>{children}</span>
        </div>
    );
}
