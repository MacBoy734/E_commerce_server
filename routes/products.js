const express = require('express')
const {authenticateUser, checkIfIsAdmin} = require('../middleware/auth')
const { addProductsPost, featuredProductsGet, allProductsGet, productGet, allOffersGet, OfferGet, addOfferPost, offerGet, editOfferPatch, editProductPatch, deleteOfferDelete, deleteProductDelete, toggleFeaturedGet, searchProductsGet, checkOutPost, allOrdersGet, editOrderPatch, deleteOrderDelete } = require('../controllers/productsController')

const router = express.Router()

// GET ROUTES
router.get('/', allProductsGet)
router.get('/featured', featuredProductsGet)
router.get('/offers', allOffersGet)
router.get('/orders', authenticateUser, checkIfIsAdmin, allOrdersGet)
router.get('/search', searchProductsGet)
router.get('/offers/:id', offerGet)
router.get('/togglefeatured/:id', authenticateUser, checkIfIsAdmin, toggleFeaturedGet)
router.get('/:id', productGet)


// POST ROUTES
router.post('/addproduct', authenticateUser, checkIfIsAdmin, addProductsPost)
router.post('/addoffer',authenticateUser, checkIfIsAdmin, addOfferPost)
router.post('/checkout', authenticateUser, checkOutPost)

// PUT/PATCH ROUTES
router.patch('/editproduct/:id', authenticateUser, checkIfIsAdmin, editProductPatch)
router.patch('/editoffer/:id', authenticateUser, checkIfIsAdmin, editOfferPatch)
router.patch('/editorder/:id', authenticateUser, checkIfIsAdmin, editOrderPatch)

// DELETE ROUTES
router.delete('/deleteoffer/:id', authenticateUser, checkIfIsAdmin, deleteOfferDelete)
router.delete('/deleteorder/:id', authenticateUser, checkIfIsAdmin, deleteOrderDelete)
router.delete('/deleteproduct/:id', authenticateUser, checkIfIsAdmin, deleteProductDelete)

module.exports = router
