const Razorpay = require('razorpay');
const crypto = require('crypto');
const express = require('express');
const {Order, Cart} = require('../db');
const router = express.Router();
const authmiddle = require('../middleware/authmiddle');
const { authSession } = require('../middleware/authSession');

var instance = new Razorpay({
  key_id: 'rzp_test_JVB6uyPjz1CHAi',
  key_secret: 'UYFJ5z2rOUi3ZJgBniINlICp',
});

router.post('/create-order', authSession, async (req, res) => {
    const { amount, currency='INR', receipt } = req.body;
   
    try{
        const order = await instance.orders.create({
            amount: amount, 
            currency: currency,
            receipt: receipt,
            payment_capture: 1
        });
        res.json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: 'Failed to create order', details: error.message });
    }
})

router.post('/verify-payment', authSession, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    address,
    products
  } = req.body;

  const generated_signature = crypto
    .createHmac('sha256', instance.key_secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    try {
        console.log("Saving Order with Data:", {
                userId: req.user.userId,
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                totalAmount: amount,
                paymentMethod: 'online',
                paymentStatus: 'Completed',
                razorpayOrderId: razorpay_order_id
            });
      const order = new Order({
        userId: req.user.userId,
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        totalAmount: amount/100,
        paymentMethod: 'online',
        paymentStatus: 'completed',
        products,
        address: req.body.address,
        status: 'pending'
      });
      try {
          await order.save(); 
      } catch (error) {
            console.error("Order save failed:", error);
            return res.status(500).json({ error: "Failed to save order", details: error.message });
      }

      // Empty cart
      await Cart.findOneAndUpdate(
        { userId: req.user.userId },
        { $set: { products: [] } }
      );

      res.json({ message: 'Payment verified and order placed', order });
    } catch (error) {
      console.error("Error saving order:", error);
      res.status(500).json({ error: 'Failed to save order' });
    }
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
});

module.exports = router;

