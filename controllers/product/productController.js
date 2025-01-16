const { query } = require('express')
const { Store } = require('../../models/')

exports.getProduct = async (req, res) => {
    try {
        const { area, period } = req.query

        if (!area || !period) {
            return res.status(400).json({ status: 400, message: 'area and period are required!' })
        }
        let query = { area, period }
        const response = await Route.find(query, { _id: 0, __v: 0 })
            .populate('listStore.storeInfo', 'storeId name address typeName')
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: response,
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({ status: '501', message: error.message })
    }
}