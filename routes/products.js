const express = require('express')
const mongoose = require('mongoose')
const {authenticateUser, checkIfIsAdmin} = require('../middleware/auth')
const { addProductsPost, featuredProductsGet, allProductsGet, productGet, allOffersGet, OfferGet, addOfferPost, offerGet, editOfferPatch, editProductPatch, deleteOfferDelete, deleteProductDelete, toggleFeaturedGet } = require('../controllers/productsController')

const router = express.Router()

// GET ROUTES
router.get('/', allProductsGet)
router.get('/featured', featuredProductsGet)
router.get('/offers', allOffersGet)
router.get('/offers/:id', offerGet)
router.get('/togglefeatured/:id', authenticateUser, checkIfIsAdmin, toggleFeaturedGet)
router.get('/:id', productGet)

// POST ROUTES
router.post('/addproduct', authenticateUser, checkIfIsAdmin, addProductsPost)
router.post('/addoffer',authenticateUser, checkIfIsAdmin, addOfferPost)

// PUT/PATCH ROUTES
// router.patch('/editproduct', authenticateUser, checkIfIsAdmin, editProductPatch)
router.patch('/editoffer/:id', authenticateUser, checkIfIsAdmin, editOfferPatch)

// DELETE ROUTES
router.delete('/deleteoffer/:id', authenticateUser, checkIfIsAdmin, deleteOfferDelete)
router.delete('/deleteproduct/:id', authenticateUser, checkIfIsAdmin, deleteProductDelete)

module.exports = router
