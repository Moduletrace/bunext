import type { GrabPageComponentRes } from "../../../types";
export default function generateWebPageResponseFromComponentReturn({ component, module, bundledMap, head, meta, routeParams, serverRes, debug, }: GrabPageComponentRes): Promise<Response>;
