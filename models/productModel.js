const mongoose = require("mongoose");
const Offer = require('./offersModel')

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ], 
    offers: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
