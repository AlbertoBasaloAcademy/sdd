import express from "express";
import { clientSrc, isDev, port, staticOptions } from "./server/config.js";
import { serveIndexHtml } from "./server/indexHtml.js";
import { listen } from "./server/listener.js";
import { handleSplatRoute } from "./server/splatRoute.js";
import { serveTsAsJs } from "./server/tsMiddleware.js";

const app = express();
if (isDev) {
  app.set("etag", false);
}
app.use(serveTsAsJs);
app.use(express.static(clientSrc, staticOptions));
app.get("/", serveIndexHtml);
app.get("*splat", handleSplatRoute);

listen(app, port);
