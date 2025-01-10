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

exports.addFromERP = async (req, res) => {
    try {
        const response = await axios.post('http://58.181.206.159:9814/ca_api/ca_route.php')
        const idRu = await Route.findOne({ period: currentdateFormatYearMont() }).sort({ id: -1 })

        let routeId;
        if (!idRu) {
            routeId = currentdateFormatYearMont() + 'R1'
        } else {
            const prefix = idRu.id.slice(0, 7)
            const subfix = parseInt(idRu.id.slice(7)) + 1
            routeId = prefix + subfix
        }

        for (const storeList of response.data) {
            const existingRoute = await Route.findOne({ id: storeList.id, period: currentdateFormatYearMont() })

            if (existingRoute) {
                for (const listSub of storeList.list) {
                    const storeExists = existingRoute.list.some(store => store.storeId === listSub)
                    if (!storeExists) {
                        const newData = {
                            storeId: listSub,
                            latitude: '',
                            longtitude: '',
                            status: 0,
                            note: '',
                            dateCheck: '',
                            listCheck: []
                        }
                        existingRoute.list.push(newData)
                    }
                }
                await existingRoute.save()
            } else {
                const listStore = []
                for (const listSub of storeList.list) {
                    const newData = {
                        storeInfo: listSub,
                    }
                    listStore.push(newData)
                }
                const mainData = {
                    id: storeList.id,
                    area: storeList.area,
                    period: currentdateFormatYearMont(),
                    day: storeList.day,
                    list: listStore
                }
                await Route.create(mainData)
            }
        }

        await createLog('200', req.method, req.originalUrl, res.body, 'Add Route Successfully')
        res.status(200).json({ status: 201, message: 'Add Route Successfully' })
    } catch (e) {
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}
