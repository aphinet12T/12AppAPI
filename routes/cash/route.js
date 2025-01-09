const express = require('express')
const { getRoute } = require('../../controllers/route/routeController')

const router = express.Router()

router.get('/getRoute', getRoute)

module.exports = router