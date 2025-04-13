// check status of API
curl 0.0.0.0:5000/api/v1/status ; echo ""

// check count of objects
curl 0.0.0.0:5000/api/v1/stats ; echo ""

// add a new vendor
curl -XPOST 0.0.0.0:5000/api/v1/vendors -H "Content-Type: application/json" -d '{ "email": "vendor1@sd.com", "password": "vtest123!" }' ; echo ""

// try add the same vendor
curl -XPOST 0.0.0.0:5000/api/v1/vendors -H "Content-Type: application/json" -d '{ "email": "vendor1@sd.com", "password": "vtest123!" }' ; echo ""

// view currently logged in vendor with no token provided
curl -XGET 0.0.0.0:5000/api/v1/vendors/me ; echo ""

// authenticate vendor
curl -XGET 0.0.0.0:5000/api/v1/connect -H "Authorization: Basic dmVuZG9yMUBzZC5jb206dnRlc3QxMjMh" ; echo ""

// view currently logged in vendor with token
curl -XGET 0.0.0.0:5000/api/v1/vendors/me -H "X-Token: 7fa74186-06ec-454e-a71d-9b690f135e62" ; echo ""

// add a new product as an authenticated vendor
curl -XPUT 0.0.0.0:5000/api/v1/vendors/products -H "X-Token: 7fa74186-06ec-454e-a71d-9b690f135e62" -H "Content-Type: application/json" -d '{ "name": "HP Printer", "price": 60000, "stock": 5 }' ; echo ""

// get list of vendor products
curl -XGET 0.0.0.0:5000/api/v1/vendors/products -H "X-Token: 7fa74186-06ec-454e-a71d-9b690f135e62" ; echo ""

// de-authenticate vendor
curl -XGET 0.0.0.0:5000/api/v1/disconnect -H "X-Token: 7fa74186-06ec-454e-a71d-9b690f135e62" ; echo ""

// add a new user
curl -XPOST 0.0.0.0:5000/api/v1/users -H "Content-Type: application/json" -d '{ "email": "user1@sd.com", "password": "utest123!" }' ; echo ""

// authenticate user
curl -XGET 0.0.0.0:5000/api/v1/connect -H "Authorization: Basic dXNlcjFAc2QuY29tOnV0ZXN0MTIzIQ==" ; echo ""

// view currently logged in user with token
curl -XGET 0.0.0.0:5000/api/v1/users/me -H "X-Token: d5d7230c-fa85-4866-b0ff-8e7549b465c3" ; echo ""

// view all current products
curl -XGET 0.0.0.0:5000/api/v1/products ; echo ""

// add a new product to cart as an authenticated user
// first try to add more than the available stock
curl -XPUT 0.0.0.0:5000/api/v1/users/cart -H "X-Token: d5d7230c-fa85-4866-b0ff-8e7549b465c3" -H "Content-Type: application/json" -d '{ "productId": "fd8ec433-c41d-4650-8374-1fbed6f3e418", "quantity": 6 }' ; echo ""
curl -XPUT 0.0.0.0:5000/api/v1/users/cart -H "X-Token: d5d7230c-fa85-4866-b0ff-8e7549b465c3" -H "Content-Type: application/json" -d '{ "productId": "c5341b36-88a4-4b18-b845-659be1546c39", "quantity": 2 }' ; echo ""

// checkout cart to view all cart contents before making order
curl -XGET 0.0.0.0:5000/api/v1/users/cart/checkout -H "X-Token: d5d7230c-fa85-4866-b0ff-8e7549b465c3" ; echo ""

// delete cart item
curl -XDELETE 0.0.0.0:5000/api/v1/users/cart -H "X-Token: d5d7230c-fa85-4866-b0ff-8e7549b465c3" -H "Content-Type: application/json" -d '{ "productId": "c5341b36-88a4-4b18-b845-659be1546c39" }' ; echo ""

// checkout cart to view all cart contents before making order
curl -XGET 0.0.0.0:5000/api/v1/users/cart/checkout -H "X-Token: d5d7230c-fa85-4866-b0ff-8e7549b465c3" ; echo ""

// add a new product to cart as an authenticated user
curl -XPUT 0.0.0.0:5000/api/v1/users/cart -H "X-Token: d5d7230c-fa85-4866-b0ff-8e7549b465c3" -H "Content-Type: application/json" -d '{ "productId": "XXXXXXXXXX", "quantity": 4 }' ; echo ""

// make an order
curl -XPOST 0.0.0.0:5000/api/v1/users/orders?checkout=1 -H "X-Token: d5d7230c-fa85-4866-b0ff-8e7549b465c3" ; echo ""

// view users orders
curl -XGET 0.0.0.0:5000/api/v1/users/orders -H "X-Token: d5d7230c-fa85-4866-b0ff-8e7549b465c3" ; echo ""

// view products again to confirm stock reduction
curl -XGET 0.0.0.0:5000/api/v1/products/ ; echo ""

// de-authenticate user
curl -XGET 0.0.0.0:5000/api/v1/disconnect -H "X-Token: d5d7230c-fa85-4866-b0ff-8e7549b465c3" ; echo ""

// authenticate vendor
curl -XGET 0.0.0.0:5000/api/v1/connect -H "Authorization: Basic dmVuZG9yMUBzZC5jb206dnRlc3QxMjMh" ; echo ""

// view orders as an authenticated vendor
curl -XGET 0.0.0.0:5000/api/v1/vendors/orders -H "X-Token: XXXXXXXXXXX" ; echo ""