import bunextRequestHandler from "./functions/server/bunext-req-handler";
declare const bunext: {
    bunextRequestHandler: typeof bunextRequestHandler;
};
export default bunext;
