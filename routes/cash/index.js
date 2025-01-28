const express = require('express')
const storeRoutes = require('./store')
const routeRoutes = require('./route')
const productRoutes = require('./product')
const manageRoutes = require('./manage')
const { login } = require('../../controllers/authen/login')

const router = express.Router()

router.post('/login', login)
router.use('/store', storeRoutes)
router.use('/route', routeRoutes)
router.use('/product', productRoutes)
router.use('/manage', manageRoutes)

module.exports = router