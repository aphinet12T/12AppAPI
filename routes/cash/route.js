const express = require('express')
const { getStore, addStore, editStore } = require('../../controllers/store/storeController')

const router = express.Router()

router.get('/getStore', getStore)

module.exports = router