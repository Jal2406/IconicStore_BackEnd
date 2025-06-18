const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://mayanijal:dbUser@cluster0.tgfv17w.mongodb.net/')


const UserSchema = new mongoose.Schema({
    fname: {type:String, required: true},
    lname: {type:String, required: true},
    pass: {type:String, required: true},
    email: {type:String, required: true, unique: true},
    role:{
        type: String,
        enum: ['admin', 'buyer'],
        default: 'buyer'
    }
})


const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Shoes', 'Watches', 'Audio', 'Clothing', 'Accessories', 'Electronics'], 
    },
    subCategory: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    color: {
      type: String,
    },
    size: {
      type: String,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    image: {
      type: String,
      required: true, 
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);




const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        }
    }]
});

const wishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        }
    }]});


const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],
  address: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    default: 'cod'
  },
  paymentId: {
    type: String, // Razorpay payment ID (only for online)
    default: null
  },
  razorpayOrderId: {
    type: String, // Razorpay order ID (only for online)
    default: null
  },
  codOrderId: {
    type: String, // You can use your own format for COD order tracking
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: function () {
      return this.paymentMethod === 'online' ? 'pending' : 'completed';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  }
}, { timestamps: true });


const User = mongoose.model('User',UserSchema)
const Product = mongoose.model('Product', productSchema);
const Cart = mongoose.model('Cart', CartSchema);
const Order = mongoose.model('Order', OrderSchema);
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = {User, Product, Cart, Order, Wishlist};
