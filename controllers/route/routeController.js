const { Route } = require('../../models/cash/route')
exports.getRoute = async (req, res) => {
    try {
        const { area, type } = req.query

        const currentDate = new Date()
        const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const NextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)

        let query = { area }

        if (type === 'new') {
            query.createdDate = {
                $gte: startMonth,
                $lt: NextMonth,
            };
        } else {
            query.area
        }

        const data = await Store.find(query, { _id: 0, __v: 0 })

        if (data.length === 0) {
            return res.status(204).json()
        }
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: data,
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({ status: '501', message: error.message })
    }
}
