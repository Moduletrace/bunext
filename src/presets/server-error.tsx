export default function DefaultServerErrorPage() {
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <span>500 Internal Server Error</span>
        </div>
    );
}
