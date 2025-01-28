// const { query } = require('express')
const axios = require('axios')
const { Route, RouteChangeLog } = require('../../models/cash/route')
const { period } = require('../../utilitys/datetime')
const { Store } = require('../../models/cash/store')
const { uploadFiles } = require('../../utilitys/upload')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage }).array('checkInImage', 1)
const path = require('path')

exports.getRoute = async (req, res) => {
    try {
        const { storeId, area, period, routeId } = req.query

        if (!period) {
            return res.status(400).json({ status: '400', message: 'period is required!' })
        }

        let query = { period }
        let response = []
        let store = null

        if (storeId) {
            store = await Store.findOne({ storeId }).select('_id')
            if (!store) {
                return res.status(404).json({ status: '404', message: 'Store not found!' })
            }
        }

        if (area && !routeId && !storeId) {
            query.area = area
            const routes = await Route.find(query, { _id: 0, __v: 0 })

            response = routes.map((route) => ({
                id: route.id,
                period: route.period,
                area: route.area,
                day: route.day,
                storeAll: route.storeAll,
                storePending: route.storePending,
                storeSell: route.storeSell,
                storeNotSell: route.storeNotSell,
                storeTotal: route.storeTotal,
                percentComplete: route.percentComplete,
                percentEffective: route.percentEffective
            }))
        }

        else if (area && routeId && !storeId) {
            query.area = area
            query.id = routeId

            const routes = await Route.findOne(query)
                .populate('listStore.storeInfo', 'storeId name address typeName')

            if (!routes) {
                return res.status(404).json({ status: '404', message: 'Route not found!' });
            }
            response = [routes]
        }

        else if (area && routeId && storeId) {
            query.area = area
            query.id = routeId

            const routes = await Route.findOne(query)
                .populate('listStore.storeInfo', 'storeId name address typeName')

            if (!routes) {
                return res.status(404).json({ status: '404', message: 'Route not found!' });
            }

            response = [
                {
                    ...routes.toObject(),
                    listStore: routes.listStore.filter((store) => store.storeInfo && store.storeInfo.storeId === storeId)
                },
            ]
        }

        else if (!area && !routeId && storeId) {
            const routes = await Route.find({ period, "listStore.storeInfo": store._id })
                .populate('listStore.storeInfo', 'storeId name address typeName')

            response = routes.map(route => ({
                ...route.toObject(),
                listStore: route.listStore.filter(store => store.storeInfo && store.storeInfo.storeId === storeId)
            }))
        }
        else {
            return res.status(400).json({ status: '400', message: 'params is required!' })
        }

        res.status(200).json({
            status: '200',
            message: 'Success',
            data: response,
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({ status: '500', message: error.message })
    }
}


// exports.getRoute = async (req, res) => {
//     try {
//         const { area, period } = req.query

//         if (!area || !period) {
//             return res.status(400).json({ status: 400, message: 'area and period are required!' })
//         }

//         const route = await Route.aggregate([
//             { $match: { area, period } },
//             { $unwind: '$listStore' },
//             {
//                 $lookup: {
//                     from: 'stores',
//                     localField: 'listStore.storeInfo',
//                     foreignField: 'storeId',
//                     as: 'storeDetails',
//                 }
//             },
//             { $unwind: { path: '$storeDetails', preserveNullAndEmptyArrays: true } },
//             {
//                 $project: {
//                     _id: 0,
//                     id: 1,
//                     period: 1,
//                     area: 1,
//                     day: 1,
//                     'listStore.storeInfo': {
//                         storeId: '$storeDetails.storeId',
//                         storeName: '$storeDetails.name',
//                         storeAddress: '$storeDetails.address',
//                         storeType: '$storeDetails.typeName',
//                     },
//                     'listStore.latitude': 1,
//                     'listStore.longtitude': 1,
//                     'listStore.note': 1,
//                     'listStore.status': 1,
//                     'listStore.statusText': 1,
//                     'listStore.date': 1,
//                     'listStore.listOrder': 1,
//                 }
//             },
//             {
//                 $group: {
//                     _id: '$id',
//                     id: { $first: '$id' },
//                     period: { $first: '$period' },
//                     area: { $first: '$area' },
//                     day: { $first: '$day' },
//                     listStore: { $push: '$listStore' },
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     id: 1,
//                     period: 1,
//                     area: 1,
//                     day: 1,
//                     listStore: 1,
//                 },
//             },
//         ])

//         res.status(200).json({
//             status: '200',
//             message: 'Success',
//             data: route,
//         });
//     } catch (error) {
//         console.error(error)
//         res.status(500).json({ status: '501', message: error.message })
//     }
// }

exports.addFromERP = async (req, res) => {
    try {
        const response = await axios.post('http://58.181.206.159:9814/ca_api/ca_route.php')
        if (!response.data || !Array.isArray(response.data)) {
            return res.status(400).json({
                status: '400',
                message: 'Invalid response data from external API',
            })
        }

        const route = await Route.find({ period: period() })
        const routeMap = new Map(route.map((route) => [route.id, route]))
        let routeId
        const latestRoute = route.sort((a, b) => b.id.localeCompare(a.id))[0]
        if (!latestRoute) {
            routeId = `${period()}${response.data.area}R01`
            console.log('route', routeId)
            console.log('period', period())
        } else {
            const prefix = latestRoute.id.slice(0, 6)
            const subfix = (parseInt(latestRoute.id.slice(7)) + 1).toString().padStart(2, '0')
            routeId = prefix + subfix
        }

        for (const storeList of response.data) {
            try {
                const existingRoute = routeMap.get(storeList.id)

                if (existingRoute) {
                    for (const list of storeList.storeInfo || []) {
                        const store = await Store.findOne({ storeId: list })
                        if (!store) {
                            console.warn(`Store with storeId ${list} not found`)
                            continue
                        }

                        const storeExists = existingRoute.listStore.some((store) => store.storeInfo.toString() === store._id.toString())
                        if (!storeExists) {
                            const newData = {
                                storeInfo: store._id,
                                note: '',
                                image: '',
                                latitude: '',
                                longtitude: '',
                                status: 0,
                                statusText: 'รอเข้าเยี่ยม',
                                listOrder: [],
                                date: '',
                            };
                            existingRoute.listStore.push(newData)
                        }
                    }
                    await existingRoute.save()
                } else {
                    const listStore = []

                    for (const storeId of storeList.listStore || []) {
                        const idStore = storeId.storeInfo
                        const store = await Store.findOne({ storeId: idStore })
                        if (store) {
                            listStore.push({
                                storeInfo: store._id,
                                latitude: '',
                                longtitude: '',
                                status: 0,
                                note: '',
                                date: '',
                                listOrder: [],
                            })
                        } else {
                            console.warn(`Store with storeId ${storeId} not found`)
                        }
                    }

                    const data = {
                        id: storeList.id,
                        area: storeList.area,
                        period: period(),
                        day: storeList.day,
                        listStore,
                    };
                    await Route.create(data)
                }
            } catch (err) {
                console.error(`Error processing storeList with id ${storeList.id}:`, err.message)
                continue
            }
        }

        res.status(200).json({
            status: '200',
            message: 'Add Route Successfully',
        })
    } catch (e) {
        console.error('Error in addFromERP:', e.message)
        res.status(500).json({
            status: '500',
            message: e.message,
        })
    }
}

exports.checkIn = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: '400', message: err.message })
        }
        try {
            const { routeId, storeId, note, latitude, longtitude } = req.body

            if (!routeId || !storeId) {
                return res.status(400).json({
                    status: '400',
                    message: 'routeId and storeId are required',
                })
            }

            const store = await Store.findOne({ storeId })
            if (!store) {
                return res.status(404).json({ status: '404', message: 'Store not found' })
            }

            let image = null
            if (req.files) {
                try {
                    const files = req.files;
                    const uploadedFile = await uploadFiles(
                        files,
                        path.join(__dirname, '../../public/images/stores/checkin'),
                        store.area,
                        storeId
                    )

                    if (uploadedFile.length > 0) {
                        image = uploadedFile[0].path;
                    }
                } catch (fileError) {
                    return res.status(500).json({
                        status: '500',
                        message: `File upload error: ${fileError.message}`,
                    })
                }
            }

            const route = await Route.findOneAndUpdate(
                { id: routeId, "listStore.storeInfo": store._id },
                {
                    $set: {
                        "listStore.$.note": note,
                        "listStore.$.image": image,
                        "listStore.$.latitude": latitude,
                        "listStore.$.longtitude": longtitude,
                        "listStore.$.status": '2',
                        "listStore.$.statusText": 'ไม่ซื้อ',
                        "listStore.$.date": new Date(),
                    },
                },
                { new: true }
            )

            if (!route) {
                return res.status(404).json({
                    status: '404',
                    message: 'Route not found or listStore not matched',
                })
            }

            res.status(200).json({
                status: '200',
                message: 'check in successfully'
            })
        } catch (error) {
            console.error('Error saving data to MongoDB:', error)
            res.status(500).json({ status: '500', message: 'Server Error' })
        }
    })
}

exports.changeRoute = async (req, res) => {
    try {
        const { area, period, storeId, fromRoute, toRoute, changedBy } = req.body

        if (!area || !period || !storeId || !fromRoute || !toRoute || !changedBy) {
            return res.status(400).json({ status: '400' , message: 'Missing required fields.' })
        }

        const store = await Store.findOne({ storeId })
        if (!store) {
            return res.status(404).json({ status: '404' , message: `Store with storeId ${storeId} not found.` })
        }

        const existingRoute = await Route.findOne({
            id: `${period-1}${area}${toRoute}`,
            'listStore.storeInfo': store._id,
        })

        const existingRouteChange = await RouteChangeLog.findOne({
            area,
            period,
            storeInfo: store._id,
            toRoute
        })

        console.log('555', existingRouteChange)
        console.log('666', existingRoute)

        if (existingRoute || existingRouteChange) {
            return res.status(409).json({
                status: '409',
                message: `Store already exists in route ${toRoute}`
            })
        }

        const routeChange = new RouteChangeLog({
            area,
            period,
            storeInfo: store._id,
            fromRoute,
            toRoute,
            changedBy,
            changedDate: new Date(),
            status: '0',
            approvedBy: '',
            approvedDate: null,
        })

        // await routeChange.save()

        res.status(201).json({
            status: '201',
            message: 'Route has changed',
            data: routeChange
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ status: '500', message: 'Internal server error.' })
    }
}

exports.createRoute = async (req, res) => {
    try {
        const { period, area } = req.body

        if (!period || !area || area.length === 0) {
            return res.status(400).json({ message: 'Period and area are required.' })
        }

        const newRoutes = []

        for (const currentArea of area) {
            const changeLogs = await RouteChangeLog.find({
                area: currentArea,
                period,
                status: '0'
            })

            if (!changeLogs.length) {
                console.warn(`No change logs found for area ${currentArea} with status = 0`)
                continue
            }

            const routesGroupedByToRoute = changeLogs.reduce((grouped, log) => {
                const routeId = `${period}${currentArea}${log.toRoute}`
                if (!grouped[routeId]) {
                    grouped[routeId] = {
                        id: routeId,
                        period,
                        area: currentArea,
                        toRoute: log.toRoute,
                        listStore: [],
                    };
                }
                grouped[routeId].listStore.push({
                    storeInfo: log.storeInfo,
                    status: log.status || '0',
                    note: '',
                    image: '',
                    latitude: '0.00',
                    longtitude: '0.00',
                    date: Date.now(),
                });
                return grouped
            }, {})

            for (const [routeId, routeData] of Object.entries(routesGroupedByToRoute)) {
                const newRoute = new Route({
                    id: routeId,
                    period: routeData.period,
                    area: routeData.area,
                    day: '01',
                    listStore: routeData.listStore,
                })

                await newRoute.save();
                newRoutes.push(newRoute)

                await RouteChangeLog.updateMany(
                    {
                        area: currentArea,
                        period,
                        toRoute: routeData.toRoute,
                        status: '0'
                    },
                    { $set: { status: '1' } }
                )
            }
        }

        res.status(200).json({ 
            status: '200',
            message: 'Routes created successfully.', 
            newRoutes 
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

exports.routeHistory = async (req, res) => {
    try {
        const { area, period, route, storeId } = req.query

        if (!area || !period) {
            return res.status(400).json({ message: 'Area and period are required.' })
        }

        const query = {
            area,
            period,
        }

        if (storeId) {
            const store = await Store.findOne({ storeId })
            if (!store) {
                return res.status(404).json({ message: `Store with storeId ${storeId} not found.` })
            }
            query.storeInfo = store._id
        }

        if (route && !storeId) {
            query.toRoute = route
        }

        const changeLogs = await RouteChangeLog.find(query)
            .populate('storeInfo', 'storeId name')
            .sort({ changedDate: -1 })

        if (!changeLogs.length) {
            return res.status(404).json({ status: '404' , message: 'History not found.' })
        }

        res.status(200).json({ 
            status: '200', 
            message: 'Success', 
            data: changeLogs 
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error.' })
    }
}