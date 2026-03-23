import type {
    DetailedHTMLProps,
    HTMLAttributes,
    PropsWithChildren,
} from "react";

type Props = PropsWithChildren<
    DetailedHTMLProps<HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>
>;

export default function Head({ children, ...props }: Props) {
    return <head {...props}>{children}</head>;
}
