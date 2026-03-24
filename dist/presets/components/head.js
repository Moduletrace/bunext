import { jsx as _jsx } from "react/jsx-runtime";
export default function Head({ children, ...props }) {
    return _jsx("head", { ...props, children: children });
}
