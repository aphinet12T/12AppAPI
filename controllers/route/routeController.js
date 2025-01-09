const { Route } = require('../../models/cash/route')

exports.getRoute = async (req, res) => {
    try {

        res.status(200).json({
            status: '200',
            message: 'Success',
            data: 'data',
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({ status: '501', message: error.message })
    }
}
