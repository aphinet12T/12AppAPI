const { Store } = require('../../models/cash/store')
const { calculateSimilarity } = require('../../utilitys/utility')
const _ = require('lodash')

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

        const data = await Store.find(query,{_id: 0, __v: 0})

        // const sanitizedData = _.cloneDeepWith(data, (value, key) => {
        //     if (key === '_id' || key === '$__' || key === '$isNew' || key === '__v') {
        //         return undefined; 
        //     }
        //     if (Array.isArray(value)) {
        //         return value.map((item) =>
        //             _.omit(item, ['_id', '$__', '$isNew', '__v'])
        //         );
        //     }
        //     if (typeof value === 'object' && value !== null) {
        //         return _.omit(value, ['_id', '$__', '$isNew', '__v']);
        //     }
        // });

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
    const store = req.body;
    try {
        const existingStores = await Store.find({}, { _id: 0, __v: 0, idIndex: 0 });

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

        const sanitizedStores = similarStores.map((item) => ({
            store: Object.fromEntries(
                Object.entries(item.store._doc || item.store).filter(([key]) => key !== '_id')
            ),
            similarity: item.similarity.toFixed(2),
        }));

        // if (similarStores.length > 0) {
        //     return res.status(200).json({
        //         status: 'error',
        //         message: 'similar store',
        //         data: similarStores.map((item) => ({
        //             store: item.store,
        //             similarity: item.similarity.toFixed(2),
        //         })),
        //     });
        // }

        if (sanitizedStores.length > 0) {
            return res.status(200).json({
                status: 'error',
                message: 'similar store',
                data: sanitizedStores,
            });
        }

        const policyAgree = {
            status: store.policyConsent.status,
        };
        const approve = {
            status: '19',
        };

        const imageList = Array.isArray(store.imageList) ? store.imageList : []
        const images = imageList.map((image) => ({
            name: image.name || '',
            path: image.path || '',
            type: image.type || '',
        }))

        const shipping = {
            default: '',
            address: '',
            district: '',
            subDistrict: '',
            province: '',
            provinceCode: '',
            postCode: '',
            latitude: '',
            longtitude: '',
        };

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
            imageList: images,
            shippingAddress: shipping,
        });

        await storeData.save();
        res.status(200).json({
            status: '200',
            message: 'Success'
        })
    } catch (error) {
        console.error('Error saving log to MongoDB:', error)
        res.status(500).json({ status: 'error', message: 'Server Error' })
    }
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