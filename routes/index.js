const express = require('express')
const cashRoute = require('./cash/index')
const { uploadImage } = require('../services/upload')

const router = express.Router()

router.post('/upload', uploadImage)
router.use('/cash', cashRoute)

module.exports = router