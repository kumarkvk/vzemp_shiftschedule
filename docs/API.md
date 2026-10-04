# API Documentation

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <refresh_token>
```

---

## Products

### List Products
```http
GET /products?page=1&limit=10&search=keyword&category=electronics

Response:
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "...",
      "price": 29.99,
      "imageUrl": "...",
      "inventory": 100,
      "category": { "id": "uuid", "name": "Electronics" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150
  }
}
```

### Get Product
```http
GET /products/:id

Response:
{
  "id": "uuid",
  "name": "Product Name",
  "description": "...",
  "price": 29.99,
  "imageUrl": "...",
  "inventory": 100,
  "category": { ... },
  "reviews": [ ... ]
}
```

### Create Product (Admin)
```http
POST /admin/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "...",
  "price": 29.99,
  "categoryId": "uuid",
  "inventory": 100,
  "imageUrl": "..."
}
```

---

## Shopping Cart

### Get Cart
```http
GET /cart
Authorization: Bearer <token>

Response:
{
  "items": [
    {
      "id": "uuid",
      "product": { ... },
      "quantity": 2
    }
  ],
  "total": 59.98
}
```

### Add to Cart
```http
POST /cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "uuid",
  "quantity": 2
}
```

### Remove from Cart
```http
DELETE /cart/items/:itemId
Authorization: Bearer <token>
```

### Clear Cart
```http
DELETE /cart
Authorization: Bearer <token>
```

---

## Orders

### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701",
    "country": "US"
  }
}

Response:
{
  "id": "uuid",
  "userId": "uuid",
  "status": "pending",
  "items": [ ... ],
  "totalAmount": 59.98,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Get Orders
```http
GET /orders
Authorization: Bearer <token>

Response:
{
  "data": [ ... ],
  "pagination": { ... }
}
```

### Get Order
```http
GET /orders/:id
Authorization: Bearer <token>
```

---

## Payments

### Create Payment Intent
```http
POST /orders/:orderId/pay
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethodId": "pm_..."
}

Response:
{
  "clientSecret": "pi_...",
  "status": "requires_confirmation"
}
```

### Confirm Payment
```http
POST /orders/:orderId/pay/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentIntentId": "pi_..."
}

Response:
{
  "status": "succeeded",
  "order": { ... }
}
```

---

## Admin Endpoints

### Dashboard
```http
GET /admin/dashboard
Authorization: Bearer <admin_token>

Response:
{
  "totalUsers": 1000,
  "totalOrders": 500,
  "totalRevenue": 50000,
  "recentOrders": [ ... ]
}
```

### Manage Products
```http
GET /admin/products
PUT /admin/products/:id
DELETE /admin/products/:id
```

### Manage Users
```http
GET /admin/users
PUT /admin/users/:id
DELETE /admin/users/:id
```

---

## Health Check Endpoints

### Liveness
```http
GET /health/live

Response:
{
  "status": "ok"
}
```

### Readiness
```http
GET /health/ready

Response:
{
  "status": "ready",
  "database": "connected"
}
```

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [ ... ]
  }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error
