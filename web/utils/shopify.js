import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import shopify from "../shopify.js";

const TOT_PRODUCT_PRICE = 1;

export const syncToTProduct = async (session) => {
    try {
        let haveProduct = false;

        let matchProduct = await shopify.api.rest.Product.all({
            session: session,
            product_type: 'tot'
        });
        if (matchProduct.data.length > 0) {
            haveProduct = true;
        }

        if (!haveProduct) {
            const productModel = new shopify.api.rest.Product({
                session: session
            });
            productModel.title = "ToT Item";
            productModel.body_html = "ToT Item not to be purchased Individually";
            productModel.product_type = "tot";
            productModel.status = "active";
            productModel.variants = [
                {
                    price: TOT_PRODUCT_PRICE,
                    title: "ToT Item"
                }
            ];
            await productModel.save({
                update: true
            });
            console.log("ToT Product added");
        } else {
            console.log("ToT Product already exist");
        }
    } catch (error) {
        console.log(error);
    }
}

export const syncScript = async (session) => {
    try {
        let haveScript = false;
        let scriptUrl = process.env.APP_URL + "/assets/tot-cart.js";

        let allScriptTags = await shopify.api.rest.ScriptTag.all({
            session: session,
        });
        for (let scriptItem of allScriptTags.data) {
            if (scriptItem.src == scriptUrl) {
                haveScript = true;
            } else {
                //remove any other old scripts matching plugin js file 
                if (scriptItem.src.toString().includes("tot-cart.js")) {
                    await shopify.api.rest.ScriptTag.delete({
                        session: session,
                        id: scriptItem.id
                    });
                }
            }
        }

        if (!haveScript) {
            const scriptModel = new shopify.api.rest.ScriptTag({ session: session });
            scriptModel.event = "onload";
            scriptModel.src = scriptUrl;
            await scriptModel.save({
                update: true
            });
            console.log("Script Added");
        } else {
            console.log("Scirpt already exist");
        }
    } catch (error) {
        console.log(error);
    }
}


export const syncWebhook = async (session) => {
    try {
        const webHookTopic = "orders/create";
        let haveWebhook = false;
        let webhookUrl = process.env.APP_URL + "/api/webhooks";

        let allWebhooks = await shopify.api.rest.Webhook.all({
            session: session,
        });
        for (let webhookItem of allWebhooks.data) {
            if (webhookItem.address == webhookUrl && webhookItem.topic == webHookTopic) {
                haveWebhook = true;
            }
        }

        if (!haveWebhook) {
            const webhookModel = new shopify.api.rest.Webhook({ session: session });
            webhookModel.address = webhookUrl;
            webhookModel.topic = "orders/create";
            webhookModel.format = "json";
            await webhookModel.save({
                update: true
            });
            console.log("Webhook Created");
        } else {
            console.log("Webhook already exist");
        }
    } catch (error) {
        console.log(error);
    }
}

export const getSesionByShop = async (shop) => {
    let storage = new MongoDBSessionStorage(
        process.env.DB_URL,
        process.env.DB_NAME
    );
    let session = await storage.findSessionsByShop(shop);
    return session[0];
}

export const updateOrderTags = async (session, orderId, tags) => {
    try {
        console.log("sessiondata", session);
        const order = new shopify.api.rest.Order({ session: session });
        order.id = orderId;
        if (tags.length > 0) {
            order.tags = tags.join(", ");
        } else {
            order.tags = "";
        }
        await order.save({
            update: true,
        });
    } catch (error) {
        console.log(error);
    }
}