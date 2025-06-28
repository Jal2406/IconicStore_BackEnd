const express = require('express');
const { User, Order } = require('../db');
const router = express.Router();
const authmiddle = require('../middleware/authmiddle');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const JWT_SEC = 'asd123';
const jwt = require('jsonwebtoken');



const transpot = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mayanijal@gmail.com',
        pass: 'hquh oyak fmgl nlwt'
}
})

async function sendVerificationEmail(email, otp) {
       const mailOptions = {
         from: 'mayanijal@gmail.com',
         to: email,
         subject: 'OTP Verification',
         html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
       };

       try {
         await transpot.sendMail(mailOptions);
         console.log('Verification email sent successfully');
       } catch (error) {
         console.error('Error sending verification email:', error);
         throw error;
       }
    }

const OrderVerificationMail = async (orderId) => {
    console.log('orderId',orderId);
    
    try {
        console.log(orderId)
        const populatedOrder = await Order.findById(orderId)
            .populate('userId')
            .populate('products.productId');
           if (!populatedOrder) throw new Error(`Order not found: ${orderId}`);
      
        const customerName = populatedOrder.userId.fname || 'Customer';
        const customerEmail = populatedOrder.userId.email;
      
        const orderDate = populatedOrder.createdAt.toDateString();
        const shippingAddress = populatedOrder.address;
        const totalAmount = populatedOrder.totalAmount;
      
        const itemsHtml = populatedOrder.products.map(p => `
          <tr>
            <td style="padding:10px; border:1px solid #ddd;">${p.productId.name}</td>
            <td style="padding:10px; border:1px solid #ddd; text-align:center;">${p.quantity}</td>
            <td style="padding:10px; border:1px solid #ddd; text-align:right;">₹${p.productId.price * p.quantity}</td>
          </tr>
        `).join('');
      
        const mailOptions = {
          from: 'mayanijal@gmail.com',
          to: customerEmail,
          subject: "Order Placed Successfully!!",
          html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Order Confirmation</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f5f5f5; font-family: Arial, sans-serif; color:#333;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
                <tr>
                  <td style="background-color:#007bff; color:#ffffff; padding:20px; text-align:center;">
                    <h1 style="margin:0; font-size:24px;">Your Order is Confirmed!</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px;">
                    <p style="font-size:16px;">Hi <strong>${customerName}</strong>,</p>
                    <p style="font-size:16px;">Thank you for shopping with us! Your order has been successfully placed.</p>
                    <p style="font-size:16px;">Here are your order details:</p>
      
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin:20px 0;">
                      <tr>
                        <td style="padding:8px 0; font-weight:bold;">Order ID:</td>
                        <td style="padding:8px 0;">${populatedOrder._id}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; font-weight:bold;">Order Date:</td>
                        <td style="padding:8px 0;">${orderDate}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; font-weight:bold;">Shipping Address:</td>
                        <td style="padding:8px 0;">${shippingAddress}</td>
                      </tr>
                    </table>
      
                    <h3 style="font-size:18px; margin:20px 0 10px;">Items Ordered:</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ddd; border-collapse:collapse;">
                      <thead style="background-color:#f0f0f0;">
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
      
                    <p style="font-size:16px; margin:20px 0;">We will notify you once your order is shipped.</p>
      
                    <p style="font-size:16px;">If you have any questions, reply to this email or contact our support team at <a href="mailto:support@example.com">support@example.com</a>.</p>
      
                    <p style="font-size:16px;">Thank you for choosing us!</p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#f0f0f0; padding:20px; text-align:center; font-size:12px; color:#666;">
                    &copy; ${new Date().getFullYear()} Your Store Name. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>`
        };
        await transpot.sendMail(mailOptions);
    } catch (error) {
        console.log('Error Sending Mail', error)
    }
};

router.OrderVerificationMail = OrderVerificationMail

router.post('/forget-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000); 
        user.otp = otp;
        await user.save();
        await sendVerificationEmail(email, otp);
        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {

    }
})


router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
        console.log(`Verifying OTP for ${email} with OTP ${otp}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp != otp) {
            console.log(`Invalid OTP. Expected ${user.otp}, got ${otp}`);
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        user.otp = null;

        const resetToken = jwt.sign({ email: user.email }, JWT_SEC || 'fallbackSecret');
        user.token = resetToken;
        await user.save();

        console.log('OTP verified, token generated');
        res.status(200).json({ message: 'OTP verified successfully', token: resetToken });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SEC);
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        user.pass = hashedPassword; 
        user.token = null; 
        await user.save();
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;