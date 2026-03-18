import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function DefaultServerErrorPage({ children, }) {
    return (_jsxs("div", { style: {
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "20px",
        }, children: [_jsx("h1", { children: "500 Internal Server Error" }), _jsx("span", { children: children })] }));
}
