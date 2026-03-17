import type { PropsWithChildren } from "react";

export default function DefaultServerErrorPage({
    children,
}: PropsWithChildren) {
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
            <h1>500 Internal Server Error</h1>
            <span>{children}</span>
        </div>
    );
}
