## Startup steps:

1. run command from terminal
   node init_env.js

2. update file api\_keys/\_key\_mailgun.json with keys (sandboxid, token_pub, token_sec)

3. update file api\_keys/\_key\_stripe.json with keys (token_pub, token_sec)

4. create folder https and provide files cert.pem and key.pem

5. review and update lib/config.js file

6. run command from terminal
   node index.js

7. navigate to localhost:3000

## The APP routes:

* GET host:3000/ : index
  * to show landing page
* GET host:3000/account/create
  * to create a new user
* GET host:3000/account/edit
  * to edit user's data, change password, delete user and user's orders, shopping cart
* GET host:3000/account/deleted
  * to notify user about user's account deletion
* GET host:3000/account/history
  * to get user's order history
* GET host:3000/session/create
  * to login user
* GET host:3000/session/deleted
  * to notify user about user has been logged out
* GET host:3000/cart/all
  * to get shopping cart content (all items)
* GET host:3000/cart/add
  * to add article to shopping cart
* GET host:3000/cart/edit
  * to edit article in shopping cart line or delete from shopping cart
* GET host:3000/cart/checkout
  * to place order and create invoice
* GET host:3000/cart/payment
  * to payment for invoice
* GET host:3000/catalog/all
  * offer list
* GET host:3000/ping
  * up/down service test

## The API routes:

* POST host:3000/api/tokens - application/json
   * body
      * email, string
      * password, string

   * response-body
      * email, string
      * id, string(20)
      * expires, number

* PUT host:3000/api/tokens - application/json
   * body
      * token, string(20)
      * extend, boolean

   * response-body
      * email, string
      * id, string(20)
      * expires, number

* DELETE host:3000/api/tokens
   * query string
      * id, string(20)

* POST host:3000/api/users - application/json
   * body
      * fullName, string
      * email, string
      * address, string
      * password, string

* PUT host:3000/api/users - application/json
  * header
      * token, string(20)
  * body
      * fullName, string
      * email, string
      * address, string
      * password, string

* GET host:3000/api/users - application/json
  * header
      * token, string(20)
  * body
      * email, string
  * response-body
      * fullName, string
      * email, string
      * address, string
      * password, string

* DELETE host:3000/api/users - application/json
   * header
      * token, string(20)
  * query string
      * email, string

* GET host:3000/api/offer
   * header
      * token, string(20)
   * response-body
      * array[object<catalog>]

* POST host:3000/api/shopping - application/json
   * header
      * token, string(20)
   * body
      * id, string(3) [100-122, 500]
      * email, string
   * response-body
      * object<Cart>
         * totalPrice, number
         * totalCount, number
         * cartItems, Array[object<CartItem>]
            * id, string(3)
            * name, string
            * mixtureCzech, string
            * mixtureEnglish, string
            * price, number

* PUT host:3000/api/shopping - application/json
   * header
      * token, string(20)
   * body
      * id, string(3) [100-122, 500]
      * index, number [0-n] = order of line in shopping cart
      * email, string
   * response-body
      * object<Cart>
         * totalPrice, number
         * totalCount, number
         * cartItems, Array[object<CartItem>]
            * id, string(3)
            * name, string
            * mixtureCzech, string
            * mixtureEnglish, string
            * price, number

* GET host:3000/api/shopping
   * header
      * token, string(20)
   * query string
      * email, string
   * response-body
      * object<Cart>
         * totalPrice, number
         * totalCount, number
         * cartItems, Array[object<CartItem>]
            * id, string(3)
            * name, string
            * mixtureCzech, string
            * mixtureEnglish, string
            * price, number

* DELETE host:3000/api/shopping
   * header
      * token, string(20)
  * query string
      * email, string
      * index, number [0-n] = order of line in shopping cart

* POST host:3000/api/checkout
   * header
      * token, string(20)
  * body
      * email, string

* POST host:3000/api/payment
   * header
      * token, string(20)
  * body
      * email, string
  * response-body
      * object<Invoice>

* POST host:3000/api/orders
   * header
      * token, string(20)
  * body
      * email, string
  * response-body
      * object<Invoice>

* GET host:3000/api/orders
   * header
      * token, string(20)
  * query string
      * email, string
      * id, string(20)
  * response-body
    * case
      - id == empty
        * array[object<Invoice>]
      - id == 'last'
        * object<Invoice>
      - id == valid order string(20)
        * object<Invoice>


## The API documentation (POSTMAN):

https://www.getpostman.com/collections/2b52ea559d7b02b6ae8e

https://documenter.getpostman.com/view/2851355/RzZAme6k

## The Assignment (Scenario):

This is the third of several homework assignments you'll receive in this course. In order to receive your certificate of completion (at the end of this course) you must complete all the assignments and receive a passing grade.

How to Turn It In:

1. Create a public github repo for this assignment.

2. Create a new post in the Facebook Group  and note "Homework Assignment #3" at the top.

3. In that thread, discuss what you have built, and include the link to your Github repo.

The Assignment (Scenario):

It is time to build a simple frontend for the Pizza-Delivery API you created in Homework Assignment #2. Please create a web app that allows customers to:

1. Signup on the site

2. View all the items available to order

3. Fill up a shopping cart

4. Place an order (with fake credit card credentials), and receive an email receipt

This is an open-ended assignment. You can take any direction you'd like to go with it, as long as your project includes the requirements. It can include anything else you wish as well.
