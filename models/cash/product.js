const mongoose = require('mongoose')

const price = mongoose.Schema({
    sale: { type: String },
    priceRefund: { type: String },
})

const listUnit = mongoose.Schema({
    id: { type: String },
    name: { type: String },
    factor: { type: String },
    price: price,
})

const productSchema = mongoose.Schema(
    {
        id: { type: String, require: true },
        name: { type: String, require: true },
        group: { type: String, require: true },
        brand: { type: String, require: true },
        size: { type: String, require: true },
        flavour: { type: String, require: true },
        type: { type: String, require: true },
        weightGross: { type: String, require: true },
        weightNet: { type: String, require: true },
        status: { type: String, require: true },
        statusSale: { type: String, require: true },
        statusWithdraw: { type: String, require: true },
        statusRefund: { type: String, require: true },
        listUnit: [listUnit],
        createdDate: { type: Date, default: Date.now },
        updatedDate: { type: Date, default: Date.now },
    })

const Product = mongoose.model('Product', productSchema)

module.exports = { Product }