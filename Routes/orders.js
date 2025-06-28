const express = require('express');
const { Order } = require('../db');
const router = express.Router();
const authmiddle = require('../middleware/authmiddle');
const adminOnly = require('../middleware/adminAuth');
const accountSid = 'AC5c2f5d523288d3aea890292724702678';
const authToken = '0bb9efd64f2ef83a418aff0b685f5be4';
const client = require('twilio')(accountSid, authToken);
const { authSession } = require('../middleware/authSession');
const nodemailer = require('nodemailer')
const axios = require('axios')

const transpot = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mayanijal@gmail.com',
        pass: 'hquh oyak fmgl nlwt'
}
})

const sendStatusMail = async(orderId) => {
console.log(orderId)
        const populatedOrder = await Order.findById(orderId)
            .populate('userId')
            .populate('products.productId');
          if (!populatedOrder) throw new Error(`Order not found: ${orderId}`);
      
        const customerName = populatedOrder.userId.fname || 'Customer';
        const customerEmail = populatedOrder.userId.email;
      
        const orderStatus = populatedOrder.status;
        const totalAmount = populatedOrder.totalAmount;

  const itemsHtml = populatedOrder.products.map(p => `
    <tr>
      <td style="padding:10px; border:1px solid #ddd;">${p.productId.name}</td>
      <td style="padding:10px; border:1px solid #ddd; text-align:center;">${p.quantity}</td>
      <td style="padding:10px; border:1px solid #ddd; text-align:right;">₹${p.productId.price * p.quantity}</td>
    </tr>`).join('');


  const mailOptions = {
                from: 'mayanijal@gmail.com',
                to: customerEmail,
                subject: "Order Status Updated!!",
                html: `
                <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <title>Order Status Update</title>
            </head>
            <body style="margin:0; padding:0; background:#f9f9f9; font-family: Arial, sans-serif; color:#333;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9; padding:40px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:8px; overflow:hidden;">
                      <!-- Header -->
                      <tr>
                        <td style="background:#007bff; padding:20px; text-align:center; color:#fff;">
                          <h1 style="margin:0; font-size:24px;">Order Status Update</h1>
                        </td>
                      </tr>
            
                      <!-- Body -->
                      <tr>
                        <td style="padding:30px;">
                          <p style="font-size:16px;">Hi <strong>${customerName}</strong>,</p>
                          <p style="font-size:16px;">We wanted to let you know that the status of your order has been updated.</p>
            
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0; border-collapse:collapse;">
                            <tr>
                              <td style="padding:8px 0; font-weight:bold;">Order ID:</td>
                              <td style="padding:8px 0;">${orderId}</td>
                            </tr>
                            <tr>
                              <td style="padding:8px 0; font-weight:bold;">Current Status:</td>
                              <td style="padding:8px 0;">${orderStatus}</td>
                            </tr>
                          </table>
            
                          <h3 style="margin:20px 0 10px; font-size:18px;">Order Details:</h3>
                          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ddd; border-collapse:collapse;">
                            <thead style="background:#f0f0f0;">
                              <tr>
                                <th style="padding:10px; border:1px solid #ddd; text-align:left;">Product</th>
                                <th style="padding:10px; border:1px solid #ddd; text-align:center;">Qty</th>
                                <th style="padding:10px; border:1px solid #ddd; text-align:right;">Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${itemsHtml}
                              <tr>
                                <td colspan="2" style="padding:10px; border:1px solid #ddd; text-align:right; font-weight:bold;">Total:</td>
                                <td style="padding:10px; border:1px solid #ddd; text-align:right; font-weight:bold;">₹${totalAmount}</td>
                              </tr>
                            </tbody>
                          </table>
            
                          <p style="margin:20px 0; font-size:16px;">You can track your order’s progress by logging into your account.</p>
            
                          <p style="font-size:16px;">If you have any questions, just reply to this email or contact our support team.</p>
            
                          <p style="font-size:16px;">Thank you for choosing us!</p>
                        </td>
                      </tr>
            
                      <!-- Footer -->
                      <tr>
                        <td style="background:#f0f0f0; padding:20px; text-align:center; font-size:12px; color:#666;">
                          &copy; ${new Date().getFullYear()} Your Store Name. All rights reserved.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>`}
  await transpot.sendMail(mailOptions)
  console.log("Mail Sent!")
}

const sendStatusWP = async (orderId) => {
  console.log('sendStatusWP called with:', orderId);
  try {
    const order = await Order.findById(orderId).populate('userId');
    if (!order || !order.userId) {
      throw new Error('Order or user phone number not found');
    }
    console.log(order);
    
    const customerName = order.userId.fname || 'Customer';
    const orderStatus = order.status;
    const customerPhone = order.userId.phoneNumber; // Ensure phoneNumber is in the user schema

    const apiKey = process.env.VONAGE_API_KEY || '323f0e8d';
    const apiSecret = process.env.VONAGE_API_SECRET || 'y7B4xawhyY5rTm3O';
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    const response = await axios.post(
      'https://messages-sandbox.nexmo.com/v1/messages',
      {
        from: '14157386102',
        to: '917041340328', // Dynamic phone number
        message_type: 'text',
        text: `Hi ${customerName}, your order (ID: ${orderId}) status has been updated to: ${orderStatus}`,
        channel: 'whatsapp'
      },
      {
        headers: {

          'Authorization': `Basic ${auth}`
        }
      }
    );

    console.log('WhatsApp message sent:', response.data);
  } catch (err) {
    console.error('Error sending WhatsApp message:', err.response?.data || err.message);
  }
};

router.get('/', authSession, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'fname email')
      .populate('products.productId', 'name price');
      res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

  router.put('/:orderId/status', authSession, adminOnly, async (req, res) => {
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
      return res.status(404).json({ message: 'Order not found', updatedOrder });
    }

    await sendStatusWP(orderId)
    await sendStatusMail(orderId)
    res.json({ message: 'Order status updated', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
});

router.get('/userOrders', authSession, async (req, res) => {
  const userId = req.user;

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


router.get('/states', authSession, async (req, res) => {
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