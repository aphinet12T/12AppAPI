const mongoose = require('mongoose')

const convertSchema = mongoose.Schema({
    factor: { type: String },
    description: { type: String },
})

const unitListSchema = mongoose.Schema({
    id: { type: String },
    unitName: { type: String },
    priceSale: { type: String },
    priceRefund: { type: String },
    priceChange: { type: String },
    convert: convertSchema,
})

const productSchema = mongoose.Schema(
    {
        id: { type: String, require: true },
        name: { type: String, require: true },
        group: { type: String },
        brand: { type: String, require: true },
        size: { type: String, require: true },
        flavour: { type: String, require: true },
        type: { type: String, require: true },
        statusSale: { type: String, require: true },
        statusWithdraw: { type: String, require: true },
        statusRefund: { type: String, require: true },
        grossWeight: { type: String, require: true },
        netWeight: { type: String, require: true },
        unitList: [unitListSchema],
        createdDate: { type: Date, default: Date.now },
        updatedDate: { type: Date, default: Date.now },
    })

const Store = mongoose.model('Store', storeSchema)

module.exports = { Store, TypeStore }