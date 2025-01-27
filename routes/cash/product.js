const express = require('express')
const { getProduct, addFromERP } = require('../../controllers/product/productController')

const router = express.Router()

router.get('/getProduct', getProduct)
router.post('/addFromERP', addFromERP)

module.exports = router