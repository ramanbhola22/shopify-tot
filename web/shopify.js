import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";

import * as dotenv from 'dotenv'
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
dotenv.config({ path: './../.env' });

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: undefined
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // This should be replaced with your preferred storage strategy
  sessionStorage: new MongoDBSessionStorage(
    process.env.DB_URL,
    process.env.DB_NAME
  ),
});

export default shopify;
