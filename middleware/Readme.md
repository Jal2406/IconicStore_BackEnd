
# IconicStore Backend Middleware

This directory contains middleware functions for the **IconicStore Backend**, a Node.js-based RESTful API for an e-commerce platform. These middleware functions handle authentication and authorization to secure API endpoints, ensuring that only authorized users and admins can access specific routes.

## Table of Contents
- [Overview](#overview)
- [Middleware Files](#middleware-files)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [Setup](#setup)
- [Contributing](#contributing)
- [License](#license)

## Overview
The middleware in this directory is designed to:
- Authenticate users via session-based or token-based mechanisms.
- Authorize admin-only actions for managing orders.
- Attach user data to requests for personalized API responses.
- Secure routes in the IconicStore backend, such as order management and statistics retrieval.

These middleware functions are used across the API routes to enforce security and access control, ensuring a robust and secure e-commerce platform.

## Middleware Files
The `middleware` directory includes the following files:

### 1. `authmiddle.js`
- **Purpose**: General authentication middleware.
- **Functionality**: Likely verifies user credentials, such as JWT tokens or session IDs, to ensure the user is logged in before accessing protected routes.
- **Usage**: Applied to routes requiring user authentication (e.g., fetching user-specific orders).

### 2. `adminAuth.js`
- **Purpose**: Authorization middleware for admin-only routes.
- **Functionality**: Checks if the authenticated user has admin privileges, restricting access to sensitive operations like fetching all orders or updating order statuses.
- **Usage**: Used in admin-specific routes, such as `GET /api/orders` and `PUT /api/orders/:orderId/status`.

### 3. `authSession.js`
- **Purpose**: Session-based authentication middleware.
- **Functionality**: Verifies user sessions (e.g., via JWT or session tokens) and attaches user data (e.g., `req.user`) to the request object for downstream processing.
- **Usage**: Applied to user-specific routes, such as `GET /api/orders/userOrders` and `GET /api/orders/states`.

## Usage
To use these middleware functions in your Express.js routes, import and apply them as follows:

```javascript
const express = require('express');
const router = express.Router();
const { authSession } = require('./middleware/authSession');
const { adminOnly } = require('./middleware/adminAuth');

// Example: Admin-only route
router.get('/orders', authSession, adminOnly, async (req, res) => {
  // Fetch all orders
});

// Example: User-specific route
router.get('/userOrders', authSession, async (req, res) => {
  // Fetch orders for req.user
});
```

### Middleware Flow
1. **authSession**: Verifies the user’s session or token and attaches user data (e.g., `req.user`) to the request.
2. **adminOnly**: Checks if the user has admin privileges (e.g., by checking a role field in `req.user`).
3. **authmiddle**: Likely used for additional authentication checks or as a fallback in specific routes.

Ensure that the middleware is applied in the correct order, as `adminOnly` typically depends on `authSession` to have already populated `req.user`.

## Dependencies
The middleware relies on the following dependencies (assumed based on the project structure):
- **express**: For handling HTTP requests and middleware integration.
- **jsonwebtoken** (assumed): For verifying JWT tokens in `authSession` or `authmiddle`.
- **mongoose**: For querying user data (e.g., roles) from the MongoDB database.
- **dotenv**: For loading environment variables (e.g., JWT secret).

Install dependencies using:
```bash
npm install express jsonwebtoken mongoose dotenv
```

## Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Jal2406/IconicStore_BackEnd.git
   cd IconicStore_BackEnd
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root with the following (adjust as needed):
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/iconicstore
   JWT_SECRET=your_jwt_secret_key
   ```
   - **JWT_SECRET**: Used for signing and verifying JWT tokens in authentication middleware.

4. **Run the Application**:
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000` (or the port specified in `.env`).

5. **Verify Middleware**:
   - Ensure MongoDB is running and the user schema includes necessary fields (e.g., `role`, `email`, `phoneNumber`).
   - Test authentication by sending requests with valid/invalid tokens or sessions.
   - Test admin routes with users who have and don’t have admin privileges.

## Contributing
Contributions to the middleware are welcome! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-middleware`).
3. Make your changes to the middleware files.
4. Test your changes thoroughly.
5. Commit your changes (`git commit -m "Add new middleware feature"`).
6. Push to the branch (`git push origin feature/your-middleware`).
7. Open a pull request.

Please include tests for new middleware and update documentation as needed.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.



### **Assumptions and Notes**
- **Middleware Files**: Since I couldn’t access the `middleware` directory, I inferred the purpose of `authmiddle.js`, `adminAuth.js`, and `authSession.js` based on their usage in the provided router code. If the directory contains additional files or different functionality, please provide details, and I can update the `README.md`.
- **Dependencies**: I assumed `jsonwebtoken` for JWT-based authentication, as it’s a common choice for Express.js middleware. If you use a different authentication mechanism (e.g., sessions with `express-session`), let me know.
- **Security**: The `README.md` emphasizes secure configuration (e.g., using `.env` for `JWT_SECRET`). Ensure sensitive data is not committed to the repository by adding `.env` to `.gitignore`.
- **Search Results Context**: The search results (e.g.,) mention middleware in other projects, reinforcing that middleware is typically used for authentication, authorization, and request processing, which aligns with the assumed functionality here.[](https://github.com/topics/middleware?l=go&o=desc&s=updated)

### **Suggestions for Improvement**
1. **Code Inspection**: If you share the contents of `authmiddle.js`, `adminAuth.js`, or `authSession.js`, I can provide a more precise `README.md` with specific functionality details.
2. **Testing**: Add a section on testing middleware (e.g., using `supertest` and `jest`) if you have a testing setup.
3. **Error Handling**: If the middleware includes specific error-handling logic (e.g., returning `401` or `403` responses), mention it in the `README.md`.
4. **Examples**: Include example request/response payloads for routes using the middleware to help developers understand their behavior.

If you have additional details about the middleware directory or want to include specific features (e.g., logging, rate limiting), let me know, and I can refine the `README.md` further!
