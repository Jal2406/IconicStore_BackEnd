const express = require('express')
const cors = require('cors');
const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true
}));

const loginRoute = require('./Routes/login')
const signupRoute = require('./Routes/signup');
const path = require('path');
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.json())
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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
