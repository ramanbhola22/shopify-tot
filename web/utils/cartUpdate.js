import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./../shopify.js";

export const addToTToCart = async (cart, session) => {
    console.log("Cart", cart);
    console.log("session", session);

    const ADD_CART_LINE_MUTATION = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
          }
          userErrors {
            field
            message
          }
        }
      }`;

    let totalItems = cart.line_items.length;
    let cartId = cart.id;

    const client = new shopify.api.clients.Graphql({ session });

    try {
        await client.query({
            data: {
                query: ADD_CART_LINE_MUTATION,
                variables: {
                    cartId: cartId,
                    lines: {
                        merchandiseId: "gid://shopify/ProductVariant/1",
                        quantity: 1
                    }
                },
            },
        });
    } catch (error) {
        if (error instanceof GraphqlQueryError) {
            console.log(`${error.message}\n${JSON.stringify(error.response, null, 2)}`);
        } else {
            console.log(error);
        }
    }
}

export const addScript = async (session) => {
    console.log(process.env);
    const script_tag = new shopify.api.rest.ScriptTag({ session: session });
    script_tag.event = "onload";
    script_tag.src = "https://kb-scoring-laid-buck.trycloudflare.com/assets/cart.js";
    await script_tag.save({
        update: true,
    });

}