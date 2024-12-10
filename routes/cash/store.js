const express = require('express')
const { getStore, addStore, editStore } = require('../../controllers/store/storeController')

const router = express.Router()

router.get('/getStore', getStore)
router.post('/addStore', addStore)
router.patch('/editStore/:storeId', editStore)

module.exports = router