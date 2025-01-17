const express = require('express')
const { getProduct } = require('../../controllers/product/productController')

const router = express.Router()

router.get('/getProduct', getProduct)
// router.post('/checkIn', checkIn)
// router.post('/addFromERP', addFromERP)

module.exports = router