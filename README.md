# Shopify Tot App

This app is developed in NodeJs with express. It is created on Node version:- `v16.17.1`

# Folder Sturcture

1. `web` folder contains the NodeJs Source code
2. `web/frontend` folder have all the react based shopify app template which will be visible in shopify admin on app page
3. `.env` file should contain all configuration, you can copy content from env.example and change accordingly.

# Requirement

1. Develop a Shopify app that adds an extra product called “TOT Item” to the shopping cart when any other items are added to the cart. When this is done the overall price of the line item is $1 for each other item in the cart.
2. Ensure the TOT Item updates each time the cart is modified - keeping the $1/item as you make changes to what else is in the cart.
3. Capture a webhook when the order is complete, adding a tag called 'taxes_collected' to the order.
4. Utilize Node.js and Express for development.
5. Integrate the app with one of your test Shopify stores in order to demonstrate your work.
6. Place a strong emphasis on code quality and the overall quality of the solution.


# Code Functionality

This app is based on shopify app template, which provide basic installation and auth flow.

After installation, shop offline access token get stored in mongodb. You can manage mongodb details in `.env` file.

The app sync below things to shopify:- 

1. It create ToT product in store
2. It add a script tag to website to manage cart
3. It create webhook to listen to orders/create action


Script tag include javascript file, which have all the logic when to add ToT Item product in cart, when to remove it.

After order place, webhook received order creation event, on this webhook app update order tags with `tax_collected`

With all above things the basic requirement of app is completed.