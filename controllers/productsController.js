const mongoose = require('mongoose')
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Product = require("../models/productModel");
const Offer = require("../models/offersModel");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ecommerce",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

// Multer Upload Middleware
const upload = multer({ storage });


// get all products
module.exports.allProductsGet = async (req, res) => {
  try {
    const products = await Product.find()
    res.status(200).json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

//get a single product

module.exports.productGet = async (req, res) => {
  try {
    const id = req.params.id
    if (!id) {
      return res.status(400).json({ error: "please include the product id!" })
    }
    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ error: "the product was not found!" })
    }
    res.status(200).json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// toggle featured products
module.exports.toggleFeaturedGet = async (req, res) => {
  try {
    const { id } = req.params
    const item = await Product.findById(id)
    if (!item || item === null) {
      res.status(404).json({ error: 'the product cant be found!' })
    } else {
      await Product.updateOne({ _id: item._id }, { $set: { isFeatured: !item.isFeatured } })
      res.status(200).json({ message: 'product updated' })
    }
  } catch (err) {
    res.json({ error: err.message })
  }
}


// get featured products
module.exports.featuredProductsGet = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true })
    res.status(200).json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// get all offers

module.exports.allOffersGet = async (req, res) => {
  try {
    const allOffers = await Offer.find()
    res.status(200).json(allOffers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// get one offer

module.exports.offerGet = async (req, res) => {
  try {
    const id = req.params.id
    if (!id) {
      return res.status(400).json({ error: "please include the product id!" })
    }
    const offer = await offers.findById({ _id: id })
    if (!offer) {
      return res.status(404).json({ error: 'the offer was not found!' })
    }
    res.status(200).json(offer)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// search products route
module.exports.searchProductsGet = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}


// POST ROUTES

// Route to Add Products
module.exports.addProductsPost = [
  (req, res, next) => {
    upload.array("images", 10)(req, res, (err) => {
      if (err) {
        console.error("Multer Error:", err.message);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const { name, description, price, quantity, category } = req.body;

      // Validate inputs
      if (!name || !description || !price || !req.files || req.files.length === 0 || !quantity || !category) {
        return res.status(400).json({ error: "All fields are required, including images." });
      }

      // Map uploaded files to get their Cloudinary URLs and public IDs
      const uploadedFiles = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      // Save the product to the database
      const newProduct = new Product({
        name,
        description,
        price,
        category,
        quantity,
        images: uploadedFiles,
      });

      await newProduct.save();

      res.status(201).json({ message: "Product added successfully!", product: newProduct });
    } catch (err) {
      console.error("Error adding product:", err);
      res.status(500).json({ error: err.message });
    }
  },
];


// adding an offer
module.exports.addOfferPost = async (req, res) => {
  const { offerTitle, discountPercentage, startDate, endDate } = req.body
  if (!offerTitle || !discountPercentage || !startDate || !endDate) {
    return res.status(401).json({ error: "please include all fields!" })
  }
  try {
    const newOffer = new Offer({
      title: offerTitle,
      discountPercentage,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    })
    const savedOffer = await newOffer.save()
    if (savedOffer) {
      return res.status(201).json(savedOffer)
    } else {
      return res.status(500).json({ error: "failed to save offer!" })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PATCH/PUT ROUTES
module.exports.editOfferPatch = async (req, res) => {
  try {
    const item = await Offer.findById(req.params.id)
    if (!item || item === null) {
      res.status(404).json({ error: 'the offer was not found' })
    } else {
      const { offerTitle, discountPercentage, startDate, endDate } = req.body
      const updatedOffer = await Offer.findByIdAndUpdate(item._id, { $set: { title: offerTitle, discountPercentage, startDate, endDate } }, { new: true })
      const item1 = await Offer.findById(req.params.id)
      res.status(200).json(updatedOffer)
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
module.exports.editProductPatch = async (req, res) => {
  try {
    const item = await Product.findById(req.params.id)
    if (!item || item === null) {
      res.status(404).json({ error: 'the product was not found' })
    } else {
      const { offers, name, description, price, category, quantity, isFeatured } = req.body
      const updatedProduct = await Product.findByIdAndUpdate(item._id, { $set: { name, description, price, category, quantity, isFeatured, offers } }, { new: true })
      if (offers) {
        const currentOffer = await Offer.findById(offers)
        if (currentOffer && !currentOffer.applicableProducts.includes(item._id)) {
          currentOffer.applicableProducts.push(item._id)
          await currentOffer.save()
        }
      }
      console.log(updatedProduct)
      res.status(200).json({ message: 'product updated succesfully' })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
// DELETEROUTES
module.exports.deleteProductDelete = async (req, res) => {
  try {
    console.log(req.params.id)
    const item = await Product.findById(req.params.id)
    if (item !== null) {
      await Product.findByIdAndDelete({ _id: item._id })
      res.status(204).json({ message: 'Product deleted succesfully!' })
    } else {
      res.status(404).json({ error: 'oops the product was not found!' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports.deleteOfferDelete = async (req, res) => {
  try {
    const item = await Offer.findById(req.params.id)
    if (item !== null) {
      await Offer.findByIdAndDelete({ _id: item._id })
      res.status(204).json({ message: 'Product deleted succesfully!' })
    } else {
      res.status(404).json({ error: 'oops the Offer was not found!' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
