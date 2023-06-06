(async () => {
    var TOT_PRODUCT_ID = "45288550859056";
    var SHOP_URL = "https://phase-1-store-dev.myshopify.com";
    window.SCRIPT_INITIATED = false;

    //check if cart request
    function isCartRequest(cartRequestUrl) {
        var matches = [
            "/cart/add",
            "/cart/update",
            "/cart/change",
            "/cart/clear",
        ];
        for (let item of matches) {
            if (cartRequestUrl.includes(item)) {
                return true;
            }
        }
        return false;
    }

    if (!window.SCRIPT_INITIATED) {  
        window.SCRIPT_INITIATED = true;
        //for old Xhr Requests
        var open = window.XMLHttpRequest.prototype.open;
        function openReplacement() {
            this.addEventListener("load", function () {
                if (isCartRequest(this._url)) {
                    addToTItem();
                }
            });
            return open.apply(this, arguments);
        }

        window.XMLHttpRequest.prototype.open = openReplacement;

        //for fetch requests
        window.fetch = new Proxy(window.fetch, {
            apply(fetch, that, args) {
                const result = fetch.apply(that, args);
                result.then((response) => {
                    var url = args[0];
                    if (isCartRequest(url)) {
                        return addToTItem();
                    }
                });
                return result;
            }
        });
    }

    //send cart fetch request
    async function sendCartRequest(path, data = null, TYPE = "POST") {
        return new Promise(async (resolve, reject) => {
            var url = SHOP_URL + path;
            try {
                let responseData = {
                    method: TYPE
                };
                if (TYPE == "POST") {
                    responseData['body'] = data;
                }
                const response = await fetch(url, responseData);
                const result = await response.json();
                return resolve(JSON.stringify(result));
            } catch (error) {
                return resolve(null);
            }
        });
    }

    //add ToT item based on cart values
    function addToTItem() {
        sendCartRequest("/cart.js", null, "GET").then(async (res) => {
            console.log(res);
        //     let cart = JSON.parse(res);
        //     console.log("cart", cart);
        //     let items = cart.items;
        //     let haveTot = false;

        //     let totalToTQuantities = 0;
        //     for (let cartItem of items) {
        //         if (cartItem.id.toString() == TOT_PRODUCT_ID.toString()) {
        //             haveTot = true;
        //             totalToTQuantities = cartItem.quantity;
        //         }
        //     }

        //     //totalCartItems without tot item
        //     let totalCartItems = items.length;
        //     if (haveTot) {
        //         totalCartItems = totalCartItems - 1;
        //     }

        //     console.table({
        //         totalCartItems, totalToTQuantities
        //     });

        //     if (totalCartItems <= 0) {
        //         if (haveTot) {
        //             //remove tot item as cart is empty
        //             await sendCartRequest("/cart/change", {
        //                 quantity: 0,
        //                 id: TOT_PRODUCT_ID
        //             });
        //         }
        //     } else {
        //         if (totalToTQuantities != totalCartItems) {
        //             if (haveTot) {
        //                 await sendCartRequest("/cart/change", {
        //                     quantity: totalCartItems,
        //                     id: TOT_PRODUCT_ID
        //                 });
        //             } else {
        //                 await sendCartRequest("/cart/add", {
        //                     quantity: totalCartItems,
        //                     id: TOT_PRODUCT_ID
        //                 });
        //             }
        //         }
        //     }
        // });
    }

})();