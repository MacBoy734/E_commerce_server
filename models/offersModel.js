const mongoose = require("mongoose")
const Product = require('./productModel')

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  discountPercentage: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], 
  isActive: { type: Boolean, default: true },
})


module.exports = mongoose.model("Offer", offerSchema)
