const express = require('express');
const { Order } = require('../db');
const router = express.Router();
const authmiddle = require('../middleware/authmiddle');
const adminOnly = require('../middleware/adminAuth');


router.get('/', authmiddle, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'fname email')
      .populate('products.productId', 'name price');
      console.log(orders)
      res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

router.put('/:orderId/status', authmiddle, adminOnly, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
});

router.get('/userOrders', authmiddle, async (req, res) => {
  const userId = req.user.userId;

  try {
    const orders = await Order.find({ userId })
      .populate('products.productId', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: 'Error fetching user orders' });
  }
});


router.get('/states', authmiddle, async (req, res) => {
  try {
    const order = await Order.find()
    const delivered = order.filter((item)=>{
      return item.status === "delivered";
    })
    res.status(200).json({
      length: order.length,
      delivered: delivered.length,
    });
  } catch (error) {
    console.error("Error fetching states:", error);
    res.status(500).json({ message: 'Error fetching states' });
  }
});
module.exports = router;