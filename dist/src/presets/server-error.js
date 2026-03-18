import { jsx as _jsx } from "react/jsx-runtime";
export default function DefaultServerErrorPage() {
    return (_jsx("div", { style: {
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }, children: _jsx("span", { children: "500 Internal Server Error" }) }));
}
