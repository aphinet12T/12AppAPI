const axios = require('axios')
const { Product } = require('../../models/cash/product')

exports.getProduct = async (req, res) => {
    try {
        const { type, group, size, brand } = req.query

        if (!type && !group && !size && !brand) {
            return res.status(400).json({ status: 400, message: 'area and period are required!' })
        }
        let query = { area, period }
        const response = await Product.find(query, { _id: 0, __v: 0 })
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

exports.addFromERP = async (req, res) => {
    try {
        const response = await axios.get('http://58.181.206.159:9814/ca_api/ca_product.php')
        if (!response.data || !Array.isArray(response.data)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid response data from external API',
            })
        }

        for (const listProduct of response.data) {
            const productId = listProduct.id

            const existingProduct = await Product.findOne({ id: productId })
            if (existingProduct) {
                console.log(`Product ID ${productId} already exists. Skipping.`)
                continue
            }

            const itemConvertResponse = await axios.post(
                'http://192.168.2.97:8383/M3API/ItemManage/Item/getItemConvertItemcode',
                { itcode: productId }
            )

            const unitData = itemConvertResponse.data
            const listUnit = listProduct.unitList.map((unit) => {
                const matchingUnit = unitData[0]?.type.find((u) => u.unit === unit.unit)
                return {
                    id: unit.id,
                    name: unit.name,
                    factor: matchingUnit ? matchingUnit.factor : 1,
                    price: {
                        sale: unit.pricePerUnitSale,
                        priceRefund: unit.pricePerUnitRefund,
                    },
                }
            })

            const newProduct = new Product({
                id: listProduct.id,
                name: listProduct.name,
                group: listProduct.group,
                brand: listProduct.brand,
                size: listProduct.size,
                flavour: listProduct.flavour,
                type: listProduct.type,
                weightGross: listProduct.weightGross,
                weightNet: listProduct.weightNet,
                statusSale: listProduct.statusSale,
                statusRefund: listProduct.statusRefund,
                statusWithdraw: listProduct.statusWithdraw,
                listUnit: listUnit,
            })
            await newProduct.save()
        }
        res.status(200).json({
            status: 200,
            message: 'Products added successfully',
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            status: 500,
            message: e.message,
        })
    }
}