const express = require('express')
const { getRoute, addFromERP } = require('../../controllers/route/routeController')

const router = express.Router()

router.get('/getRoute', getRoute)
router.post('/addFromERP', addFromERP)

module.exports = router