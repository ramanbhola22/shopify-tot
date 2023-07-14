// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import webhookHandlers from "./webhook-handlers.js";
import { syncScript, syncToTProduct, syncWebhook } from "./utils/shopify.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: webhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/sync/all", async (_req, res) => {
  await syncScript(res.locals.shopify.session);
  await syncToTProduct(res.locals.shopify.session);
  await syncWebhook(res.locals.shopify.session);
  res.status(200).send({ status: true });
});  

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));   

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)     
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));   
});

app.listen(PORT);
