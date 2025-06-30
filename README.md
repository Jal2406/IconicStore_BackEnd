# IconicStore_BackEnd

A Node.js backend RESTful API for the IconicStore e-commerce platform. This API provides user authentication, product management, order placement and tracking, payment integration, and admin operations.

---

## Table of Contents
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
  - [Authentication & User](#authentication--user)
  - [Product Management](#product-management)
  - [Order Management](#order-management)
  - [Payment](#payment)
  - [Admin](#admin)
- [Middleware & Security](#middleware--security)
- [Dependencies](#dependencies)
- [License](#license)

---

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jal2406/IconicStore_BackEnd.git
   cd IconicStore_BackEnd
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root with at least:
   ```
   PORT=3000
   MONGO_URI=your_mongo_uri
   JWT_SECRET=your_jwt_secret_key
   SESSION_SEC=your_session_secret
   ```

4. **Run the application:**
   ```bash
   npm start
   ```
   The server will be available at `http://localhost:3000` (or as configured).

---

## API Endpoints

> **Note:** Below is a high-level overview based on the project structure and conventional RESTful design. For detailed request/response schemas, see the Swagger docs at `/api-docs` when running the server.

### Authentication & User

- `POST /login`  
  User login with credentials.

- `POST /signup`  
  User registration.

- `GET /auth/google`  
  Initiate Google OAuth login.

- `GET /user/profile`  
  Get logged-in user's profile.

- `PUT /user/profile`  
  Update profile information.

- `GET /user/orders`  
  Fetch orders for the logged-in user.

- `GET /user/logout`  
  Logout the current session.

### Product Management

- `GET /product`  
  List all products.

- `GET /product/:id`  
  View single product details.

- `POST /product`  
  **(Admin only)** Add a new product.

- `PUT /product/:id`  
  **(Admin only)** Update a product.

- `DELETE /product/:id`  
  **(Admin only)** Delete a product.

### Order Management

- `POST /orders`  
  Place a new order.

- `GET /orders/userOrders`  
  Get orders for the current user.

- `GET /orders`  
  **(Admin only)** List all orders.

- `PUT /orders/:orderId/status`  
  **(Admin only)** Update order status (pending, shipped, delivered, cancelled).

- `GET /orders/states`  
  Get possible order states.

### Payment

- `POST /payment/create`  
  Create a payment order (e.g., Razorpay integration).

- `POST /payment/verify`  
  Verify payment status.

### Admin

- `GET /admin/dashboard`  
  View platform statistics.

- `GET /admin/users`  
  List all users.

- `PUT /admin/user/:userId/role`  
  Change a user's role.

---

## Middleware & Security

The API uses the following middleware:

- **authSession.js**  
  Session or JWT-based authentication. Attaches `req.user` if valid.
- **adminAuth.js**  
  Restricts access to admin-only endpoints.
- **authmiddle.js**  
  General authentication, possibly for both users/admins.

Apply middleware to routes as shown:
```js
const { authSession } = require('./middleware/authSession');
const { adminOnly } = require('./middleware/adminAuth');

router.get('/orders', authSession, adminOnly, ...);
router.get('/userOrders', authSession, ...);
```

---

## Dependencies

- `express` — HTTP server and routing
- `mongoose` — MongoDB ORM
- `jsonwebtoken` — JWT authentication
- `express-session` & `connect-mongo` — Session management
- `passport`, `passport-google-oauth20` — OAuth2 authentication
- `dotenv` — Environment variable management
- `swagger-jsdoc`, `swagger-ui-express` — API documentation

---

## API Documentation

Visit [`/api-docs`](http://localhost:3000/api-docs) on your running server for Swagger-generated, interactive API documentation.

---

## License

This project is licensed under the MIT License.

---

## More Info

- This summary is based on detected route files. For the most up-to-date and detailed endpoints, see [Routes directory on GitHub](https://github.com/Jal2406/IconicStore_BackEnd/tree/master/Routes) and the API docs.
- For suggestions or contributions, please open an issue or PR!
