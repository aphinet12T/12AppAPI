const mongoose = require('mongoose')

const price = mongoose.Schema({
    sale: { type: String },
    priceRefund: { type: String },
})

const listUnit = mongoose.Schema({
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
        unitList: [listUnit],
        createdDate: { type: Date, default: Date.now },
        updatedDate: { type: Date, default: Date.now },
    })

const Product = mongoose.model('Product', productSchema)

module.exports = { Product }