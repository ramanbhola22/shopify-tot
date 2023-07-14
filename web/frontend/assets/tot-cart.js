(async () => {
    console.log("tot-cart runned.");

    let TOT_PRODUCT_ID = null;//will populate after search
    const SHOP_URL = "https://" + Shopify.shop;

    //send cart fetch request
    async function sendCartRequest(path, data = null, TYPE = "POST") {
        return new Promise(async (resolve, reject) => {
            var url = SHOP_URL + path;
            try {
                let responseData = {
                    method: TYPE,
                    headers: new Headers({ 'Content-type': 'application/x-www-form-urlencoded' }),
                };
                if (TYPE == "POST") {
                    responseData['body'] = new URLSearchParams(data).toString();
                }
                const response = await fetch(url, responseData);
                const result = await response.json();
                return resolve(JSON.stringify(result));
            } catch (error) {
                return resolve(null);
            }
        });
    }

    //reload page content
    function reloadPageContent() {
        window.location.reload();
    }

    //add ToT item based on cart values
    function removeToTItem() {
        if (TOT_PRODUCT_ID === null) {
            return false;
        }
        sendCartRequest("/cart.js", null, "GET").then(async (res) => {
            let cart = JSON.parse(res);
            let items = cart.items;
            let haveTot = false;

            for (let cartItem of items) {
                if (cartItem.id.toString() == TOT_PRODUCT_ID.toString()) {
                    haveTot = true;
                }
            }

            if (haveTot) {
                //remove tot item as cart is empty
                await sendCartRequest("/cart/change", {
                    quantity: 0,
                    id: TOT_PRODUCT_ID
                });
                reloadPageContent();
            }

        });
    }

    //load tot product
    sendCartRequest("/products.json", null, "GET").then(async (res) => {
        let response = JSON.parse(res);
        let products = response.products;
        for (let product of products) {
            if (product.product_type == "tot") {
                TOT_PRODUCT_ID = product.variants[0].id;
                removeToTItem();
            }
        }
    });

})();