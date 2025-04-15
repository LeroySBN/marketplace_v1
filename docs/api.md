# E-commerce API Documentation

## Base URL
http://localhost:3000/api/v1

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
Authorization: Bearer <your_jwt_token>

## Endpoints

### Authentication
#### Register a new user
```http
POST /auth/register
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response:
{
  "token": "string",
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string"
  }
}
```

### Products
#### List all products
```http
GET /products
Query Parameters:
- page (default: 1)
- limit (default: 10)
- category (optional)
- minPrice (optional)
- maxPrice (optional)
- sortBy (optional: price|created_at|name)
- order (optional: asc|desc)

Response:
{
  "data": [
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "price": number,
      "stock": "string",
      "category": "string",
      "vendorId": "string",
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "total": number,
  "page": number,
  "totalPages": number,
  "hasMore": boolean
}
```

#### Get product by ID
```http
GET /products/:id

Response:
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "price": number,
  "stock": "string",
  "category": "string",
  "vendorId": "string",
  "created_at": "date",
  "updated_at": "date"
}
```

### Vendors
#### List all vendors
```http
GET /vendors
Query Parameters:
- page (default: 1)
- limit (default: 10)

Response:
{
  "data": [
    {
      "_id": "string",
      "name": "string",
      "email": "string",
      "products": [],
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "total": number,
  "page": number,
  "totalPages": number,
  "hasMore": boolean
}
```

#### Create vendor
```http
POST /vendors
Content-Type: application/json

{
  "name": "string",
  "email": "string"
}
```

#### Add product to vendor
```http
POST /vendors/:id/products
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "price": number,
  "stock": number,
  "category": "string"
}
```

#### Remove product from vendor
```http
DELETE /vendors/:id/products/:productId
```

### Users
#### Get user profile
```http
GET /users/me

Response:
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "cart": [
    {
      "productId": "string",
      "quantity": number,
      "unitPrice": number
    }
  ]
}
```

#### Add item to cart
```http
POST /users/cart
Content-Type: application/json

{
  "productId": "string",
  "quantity": number
}
```

#### Remove item from cart
```http
DELETE /users/cart/:productId
```

#### Create order
```http
POST /users/orders
Content-Type: application/json

Response:
{
  "_id": "string",
  "userId": "string",
  "items": [
    {
      "productId": "string",
      "quantity": number,
      "unitPrice": number
    }
  ],
  "totalPrice": number,
  "status": "string",
  "dateCreated": "date"
}
```

#### Get user orders
```http
GET /users/orders
Query Parameters:
- page (default: 1)
- limit (default: 10)

Response:
{
  "data": [
    {
      "_id": "string",
      "userId": "string",
      "items": [
        {
          "productId": "string",
          "quantity": number,
          "unitPrice": number
        }
      ],
      "totalPrice": number,
      "status": "string",
      "dateCreated": "date"
    }
  ],
  "total": number,
  "page": number,
  "totalPages": number,
  "hasMore": boolean
}
```

## Error Responses
The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error response format:
```json
{
  "error": "string"
}