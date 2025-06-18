const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: { type: String },
  color: { type: String },
  sku: { type: String, required: true },
  stock: { type: Number, default: 0 }
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      required: true
    },
    shortDescription: {
      type: String
    },
    images: [
      {
        type: String // URL
      }
    ],
    thumbnail: {
      type: String
    },
    videos: [
      {
        type: String
      }
    ],
    price: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    finalPrice: {
      type: Number
    },
    currency: {
      type: String,
      default: 'INR'
    },
    sku: {
      type: String,
      unique: true,
      required: true
    },
    stock: {
      type: Number,
      default: 0
    },
    variants: [variantSchema],
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory'
    },
    tags: [
      {
        type: String
      }
    ],
    brand: {
      type: String
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    weight: {
      type: Number
    },
    dimensions: {
      height: Number,
      width: Number,
      depth: Number
    },
    deliveryInfo: {
      type: String
    },
    returnPolicy: {
      type: String
    },
    rating: {
      type: Number,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active'
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    views: {
      type: Number,
      default: 0
    },
    metaTitle: {
      type: String
    },
    metaDescription: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Auto-calculate final price
productSchema.pre('save', function (next) {
  this.finalPrice = this.price - (this.discount || 0);
  next();
});

module.exports = mongoose.model('Product', productSchema);
