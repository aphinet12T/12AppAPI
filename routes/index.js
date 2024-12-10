const express = require('express')
const cashRoute = require('./cash/index')
const { uploadImage, test } = require('../services/upload')

const router = express.Router()

router.post('/upload', uploadImage)
router.post('/test', test)

router.use('/cash', cashRoute)

module.exports = router