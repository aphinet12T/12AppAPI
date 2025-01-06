const express = require('express')
const storeRoutes = require('./store')
const { login } = require('../../controllers/authen/login')

const router = express.Router()

router.post('/login', login)
router.use('/store', storeRoutes)

module.exports = router