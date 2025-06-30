const express = require('express')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
require('./Routes/GoogleAuth')
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
require('dotenv').config();
const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

const loginRoute = require('./Routes/login')
const signupRoute = require('./Routes/signup');
const path = require('path');
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SEC,
  resave: false,
  saveUninitialized: false,
  cookie:{
    secure:false,
    sameSite: 'none',
    httpOnly: true
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions"
  })
}))
app.get('/', (req, res) => {
  res.send('API is running...');
})
app.use('/login', loginRoute)
app.use('/signup', signupRoute)
app.use('/product', require('./Routes/product'))
app.use('/orders', require('./Routes/orders'));
app.use('/admin', require('./Routes/admin'));
app.use('/payment', require('./Routes/payment'));
app.use('/user', require('./Routes/user'))
app.use(passport.initialize());
app.use('/auth', require('./Routes/auth'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
