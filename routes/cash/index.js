const express = require('express')
const storeRoutes = require('./store')
const routeRoutes = require('./route')
const productRoutes = require('./product')
const { login } = require('../../controllers/authen/login')

const router = express.Router()

router.post('/login', login)
router.use('/store', storeRoutes)
router.use('/route', routeRoutes)
router.use('/product', productRoutes)

module.exports = router