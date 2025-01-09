const { Store } = require('../../models/cash/store')
const { uploadFiles } = require('../../utilitys/upload')
const { calculateSimilarity } = require('../../utilitys/utility')
const _ = require('lodash')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage }).array('storeImages', 3)
const path = require('path')

exports.getStore = async (req, res) => {
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

exports.addStore = async (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: 'error', message: err.message })
        }
        try {
            if (!req.body.store) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Store data is required',
                })
            }

            const files = req.files
            const store = JSON.parse(req.body.store)
            const types = req.body.types ? req.body.types.split(',') : []

            if (!store.name || !store.address) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Required fields are missing: name, address',
                });
            }

            if (files.length !== types.length) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Number of files and types do not match',
                });
            }

            const existingStores = await Store.find({}, { _id: 0, __v: 0, idIndex: 0 })
            const fieldsToCheck = [
                'name',
                'taxId',
                'tel',
                'address',
                'district',
                'subDistrict',
                'province',
                'postCode',
                'latitude',
                'longtitude',
            ];

            const similarStores = existingStores
                .map((existingStore) => {
                    let totalSimilarity = 0;
                    fieldsToCheck.forEach((field) => {
                        const similarity = calculateSimilarity(
                            store[field]?.toString() || '',
                            existingStore[field]?.toString() || ''
                        );
                        totalSimilarity += similarity;
                    });

                    const averageSimilarity = totalSimilarity / fieldsToCheck.length;
                    return {
                        store: existingStore,
                        similarity: averageSimilarity,
                    };
                })
                .filter((result) => result.similarity > 50)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 3);

            if (similarStores.length > 0) {
                const sanitizedStores = similarStores.map((item) => ({
                    store: Object.fromEntries(
                        Object.entries(item.store._doc || item.store).filter(([key]) => key !== '_id')
                    ),
                    similarity: item.similarity.toFixed(2),
                }));
                return res.status(200).json({
                    status: 'error',
                    message: 'similar store',
                    data: sanitizedStores,
                });
            }

            // const uploadedFiles = files
            //     ? await uploadFiles(files, path.join(__dirname, '../../public/images/stores'), store.area, types)
            //     : []

            // const imageList = uploadedFiles.map((file, index) => ({
            //     name: file.name,
            //     path: file.fullPath,
            //     type: types[index] || 'unknown',
            // }));

            const uploadedFiles = [];
            for (let i = 0; i < files.length; i++) {
                const uploadedFile = await uploadFiles(
                    [files[i]],
                    path.join(__dirname, '../../public/images/stores'),
                    store.area,
                    types[i]
                );
                uploadedFiles.push({
                    name: uploadedFile[0].name,
                    path: uploadedFile[0].fullPath,
                    type: types[i],
                });
            }

            const imageList = uploadedFiles;

            const policyAgree = {
                status: store.policyConsent?.status || '',
            };
            const approve = {
                status: '19',
            }

            const shippingAddress = Array.isArray(store.shippingAddress) ? store.shippingAddress : []
            const shipping = shippingAddress.map((ship) => ({
                default: ship.default || '',
                address: ship.address || '',
                district: ship.district || '',
                subDistrict: ship.subDistrict || '',
                provinceCode: ship.provinceCode || '',
                postCode: ship.postCode || '',
                latitude: ship.latitude || '',
                longtitude: ship.longtitude || '',
            }))

            const checkIn = {}

            const storeData = new Store({
                storeId: '',
                name: store.name,
                taxId: store.taxId,
                tel: store.tel,
                route: store.route,
                type: store.type,
                typeName: store.typeName,
                address: store.address,
                district: store.district,
                subDistrict: store.subDistrict,
                province: store.province,
                provinceCode: store.provinceCode,
                postCode: store.postCode,
                zone: store.zone,
                area: store.area,
                latitude: store.latitude,
                longtitude: store.longtitude,
                lineId: store.lineId,
                note: store.note,
                status: store.status,
                approve: approve,
                policyConsent: policyAgree,
                imageList: imageList,
                shippingAddress: shipping,
                checkIn: checkIn,
            })

            await storeData.save()
            res.status(200).json({
                status: 'success',
                message: 'Store added successfully',
            })
        } catch (error) {
            console.error('Error saving store to MongoDB:', error)
            res.status(500).json({ status: 'error', message: 'Server Error' })
        }
    })
}

exports.editStore = async (req, res) => {
    const { storeId } = req.params
    const data = req.body

    try {
        const immutableFields = ['latitude', 'longitude', 'taxId', 'approve', 'policyAgree']

        immutableFields.forEach((field) => delete data[field])

        Object.keys(data).forEach((key) => {
            if (data[key] === '' || data[key] === null) {
                delete data[key]
            }
        });

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' })
        }

        // const store = await Store.findByIdAndUpdate(id, data, { new: true })
        const store = await Store.findOneAndUpdate({ storeId }, data, { new: true })

        if (!store) {
            return res.status(404).json({ status: '404', message: 'Store not found' })
        }

        res.status(200).json({
            message: 'Store updated successfully',
            data: store,
        })
    } catch (error) {
        console.error('Error updating store:', error)
        res.status(500).json({ message: 'Server error' })
    }
}

exports.checkInStore = async (req, res) => {
    const { storeId } = req.params
    const { latitude, longtitude } = req.body

    try {
        console.log('store', storeId)
        console.log('data', latitude, longtitude)
        // const store = await Store.findOne({storeId})

        if (!latitude || !longtitude) {
            return res.status(200).json({ status: 404, message: 'latitude and longtitude are required!' })
        }

        const result = await Store.findOneAndUpdate(
            { storeId },
            {
                $set: {
                    "checkIn.latitude": latitude,
                    "checkIn.longtitude": longtitude,
                    "checkIn.updateDate": Date()
                }
            },
            {
                // new: true,
                // upsert: true
            }
        )

        if (!result) {
            return res.status(200).json({ status: 404, message: 'store not found!' })
        }

        res.status(200).json({ 
            status: 201, 
            message: 'Checked In Successfully', 
            data: result
        })
    } catch (error) {
        console.error('Error updating store:', error)
        res.status(500).json({ message: 'Server error' })
    }
}