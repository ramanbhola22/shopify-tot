// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import webhookHandlers from "./webhook-handlers.js";
import { addScript, addToTToCart } from "./utils/cartUpdate.js";

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

app.get("/api/products/count", async (_req, res) => {
  console.log(res.locals.shopify);
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  await addScript(res.locals.shopify.session);
  // await addToTToCart({"id":"1c46cf89f74c3a8d11c846c379d776a6","token":"1c46cf89f74c3a8d11c846c379d776a6","line_items":[{"id":45281406157104,"properties":{},"quantity":3,"variant_id":45281406157104,"key":"45281406157104:17d1a696eb7f51e38cfe63b75017735f","discounted_price":"52000.00","discounts":[],"gift_card":false,"grams":0,"line_price":"156000.00","original_line_price":"156000.00","original_price":"52000.00","price":"52000.00","product_id":8379058454832,"sku":"","taxable":true,"title":"IPhone 13","total_discount":"0.00","vendor":"Phase 1 Store Dev","discounted_price_set":{"shop_money":{"amount":"52000.0","currency_code":"INR"},"presentment_money":{"amount":"52000.0","currency_code":"INR"}},"line_price_set":{"shop_money":{"amount":"156000.0","currency_code":"INR"},"presentment_money":{"amount":"156000.0","currency_code":"INR"}},"original_line_price_set":{"shop_money":{"amount":"156000.0","currency_code":"INR"},"presentment_money":{"amount":"156000.0","currency_code":"INR"}},"price_set":{"shop_money":{"amount":"52000.0","currency_code":"INR"},"presentment_money":{"amount":"52000.0","currency_code":"INR"}},"total_discount_set":{"shop_money":{"amount":"0.0","currency_code":"INR"},"presentment_money":{"amount":"0.0","currency_code":"INR"}}}],"note":null,"updated_at":"2023-06-06T08:20:32.408Z","created_at":"2023-06-05T10:01:12.069Z"}, res.locals.shopify.session);
  res.status(200).send(countData);
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  console.log("sdfs", res.locals.shopify);
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
