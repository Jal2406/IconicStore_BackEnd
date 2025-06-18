const express = require('express');
const { Product, Cart, Order, Wishlist } = require('../db');
const router = express.Router();
const authmiddle = require('../middleware/authmiddle');
const multer = require("multer");
const path = require("path");
const adminOnly = require('../middleware/adminAuth');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../ecom/public/images"));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

router.post('/', authmiddle, adminOnly, upload.single('image'), async (req, res) => {
  const { name, brand, price, category, subCategory, stock, color, size, description } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const imagePath = req.file ? `/images/${req.file.filename}` : null;

  try {
    const newProduct = await Product.create({ 
      name, 
      brand, 
      price, 
      category, 
      subCategory, 
      stock, 
      color, 
      size, 
      description,
      image: imagePath
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: 'Error creating product' });
  }
});


router.put('/:id', authmiddle, adminOnly, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated', product: updated });
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err });
  }
});

router.post('/addTocart', authmiddle, async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.userId;
    if (!userId || !productId) {
        return res.status(400).json({ message: 'User ID and Product ID are required' });
    }
    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            const newCart = await Cart.create({ userId, products: [{ productId, quantity: 1 }] });
            return res.status(201).json(newCart);
        }
        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
        if (productIndex > -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ productId, quantity: 1 });
        }
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart' });
    }
});

router.get('/cart',authmiddle, async (req, res) => {
    const userId = req.user.userId;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const cart = await Cart.findOne({ userId }).populate('products.productId');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart' });
    }
})

router.delete('/cart/:productId', authmiddle, async (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.params;
  if (!userId || !productId) {
    return res.status(400).json({ message: 'User ID and Product ID are required' });
  }
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(p => p.productId.toString() !== productId);
    await cart.save();

    res.json({ message: "Product removed from cart" });
  } catch (error) {
    res.status(500).json({ message: "Error removing product", error: error.message });
  }
});

router.post('/checkout', authmiddle, async (req, res) => {
  const { address, paymentMethod, products, totalAmount } = req.body;
  const userId = req.user.userId;

  if (!address || !paymentMethod || !products || products.length === 0) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const order = await Order.create({
      userId,
      products,
      address,
      paymentMethod,
      totalAmount,
      status: 'pending'
    });
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { products: [] } }
    );

    res.json({ message: 'Checkout successful', orderDetails: { address, paymentMethod, products } });
  } catch (error) {
    res.status(500).json({ message: 'Error during checkout', error: error.message });
  }
});

router.get('/wishlist', authmiddle, async (req, res) => {
  const userId = req.user.userId;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  try {
    const wishlist = await Wishlist.findOne({ userId }).populate('products.productId');
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});

router.post('/wishlist', authmiddle, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.userId;

  if (!userId || !productId) {
    return res.status(400).json({ message: 'User ID and Product ID are required' });
  }

  try {
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [{ productId }] });
    } else {
      const productExists = wishlist.products.some(p => p.productId.toString() === productId);
      if (!productExists) {
        wishlist.products.push({ productId });
        await wishlist.save();
      }
    }
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
});

router.delete('/wishlist/', authmiddle, async (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ message: 'User ID and Product ID are required' });
  }

  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    wishlist.products = wishlist.products.filter(p => p.productId.toString() !== productId);
    await wishlist.save();

    res.json({ message: "Product removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Error removing product", error: error.message });
  }
});


router.get('/search', async (req, res) => {
  const searchQuery = req.query.filter.trim().toLowerCase();
  if (!searchQuery) {
    return res.status(400).json({ message: 'Search query is required' });
  }
  try{
    const products = await Product.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { brand: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } },
        { subCategory: { $regex: searchQuery, $options: 'i' } }
      ]
    });
    res.json(products);
  }
  catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: 'Error searching products' });
  }
})


module.exports = router;