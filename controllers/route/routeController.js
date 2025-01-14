const { query } = require('express')
const { Route } = require('../../models/cash/route')
const { period } = require('../../utilitys/datetime')
const axios = require('axios')
const { Store } = require('../../models/cash/store')

exports.getRoute = async (req, res) => {
    try {
        const { area, period } = req.query

        if (!area || !period) {
            return res.status(400).json({ status: 400, message: 'area and period are required!' })
        }

        let query = { area, period }
        const response = await Route.find(query, { _id: 0, __v: 0 })
            .populate('listStore.storeInfo', 'storeId name address typeName')
            .lean()
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

// exports.addFromERP = async (req, res) => {
//     try {
//         const response = await axios.post('http://58.181.206.159:9814/ca_api/ca_route.php')
//         if (!response.data || !Array.isArray(response.data)) {
//             return res.status(400).json({
//                 status: 400,
//                 message: 'Invalid response data from external API'
//             })
//         }

//         const allRoutes = await Route.find({ period: period() })
//         const routeMap = new Map(allRoutes.map(route => [route.id, route]))

//         let routeId
//         const latestRoute = allRoutes.sort((a, b) => b.id.localeCompare(a.id))[0]
//         if (!latestRoute) {
//             routeId = `${period()}R01`
//         } else {
//             const prefix = latestRoute.id.slice(0, 6)
//             const subfix = (parseInt(latestRoute.id.slice(7)) + 1).toString().padStart(2, '0')
//             routeId = prefix + subfix;
//         }

//         for (const storeList of response.data) {
//             try {
//                 const existingRoute = routeMap.get(storeList.id)
//                 if (existingRoute) {
//                     for (const list of storeList.storeInfo || []) {
//                         const storeExists = existingRoute.list.some(store => store.storeInfo === list)
//                         if (!storeExists) {
//                             const newData = {
//                                 storeInfo: list,
//                                 latitude: '',
//                                 longtitude: '',
//                                 status: 0,
//                                 note: '',
//                                 date: '',
//                                 listOrder: []
//                             }
//                             existingRoute.list.push(newData)
//                         }
//                     }
//                     await existingRoute.save()
//                 } else {
//                     // const listStore = [...(storeList.listStore || [])]
//                     // const data = {
//                     //     id: storeList.id,
//                     //     area: storeList.area,
//                     //     period: period(),
//                     //     day: storeList.day,
//                     //     listStore
//                     // };
//                     // await Route.create(data)
//                     for (const storeId of storeList.storeInfo || []) {
//                         const store = await Store.findOne({ storeId })
//                         if(store) {
                            
//                         }
//                     }
//                 }
//             } catch (err) {
//                 console.error(`Error processing storeList with id ${storeList.id}:`, err.message)
//                 continue
//             }
//         }

//         res.status(200).json({
//             status: 201,
//             message: 'Add Route Successfully'
//         });
//     } catch (e) {
//         console.error('Error in addFromERP:', e.message)
//         res.status(500).json({
//             status: 500,
//             message: e.message
//         })
//     }
// }

exports.addFromERP = async (req, res) => {
    try {
        const response = await axios.post('http://58.181.206.159:9814/ca_api/ca_route.php')
        if (!response.data || !Array.isArray(response.data)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid response data from external API',
            })
        }

        const allRoutes = await Route.find({ period: period() })
        const routeMap = new Map(allRoutes.map((route) => [route.id, route]))
        console.log('allRoute',allRoutes)
        let routeId
        const latestRoute = allRoutes.sort((a, b) => b.id.localeCompare(a.id))[0]
        if (!latestRoute) {
            routeId = `${period()}${response.data.area}R01`
            console.log('route',routeId)
            console.log('period',period())
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
                                latitude: '',
                                longtitude: '',
                                status: 0,
                                note: '',
                                date: '',
                                listOrder: [],
                            };
                            existingRoute.listStore.push(newData)
                        }
                    }
                    await existingRoute.save()
                } else {
                    const listStore = []

                    for (const storeId of storeList.listStore || []) {
                        const idStore = storeId.storeInfo
                        // console.log('storeId',idStore)
                        const store = await Store.findOne({ storeId: idStore })
                        // console.log('store',store)
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
            status: 201,
            message: 'Add Route Successfully',
        })
    } catch (e) {
        console.error('Error in addFromERP:', e.message)
        res.status(500).json({
            status: 500,
            message: e.message,
        })
    }
}
