const mongoose = require('mongoose')

const ListOrderSchema = new mongoose.Schema({
    number: { type: Number, required: true },
    orderId: { type: String, required: true },
    status: { type: String, default: '' },
    statusText: { type: String, default: '' },
    date: { type: Date, required: true },
})

const ListStoreSchema = new mongoose.Schema({
    storeInfo: { type: String, ref: 'Store', required: true },
    latitude: { type: String, required: true, default: '0.00' },
    longtitude: { type: String, required: true, default: '0.00' },
    note: { type: String, default: '' },
    status: { type: String, default: '1' },
    statusText: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    listOrder: [ListOrderSchema]
})

const RouteSchema = new mongoose.Schema({
    id: { type: String, required: true, index: true },
    period: { type: String, required: true, index: true },
    area: { type: String, required: true },
    day: { type: String, required: true },
    listStore: [ListStoreSchema],
})

RouteSchema.virtual('storeAll').get(function () {
    return this.listStore.length
})
RouteSchema.virtual('storeBuy').get(function () {
    return this.listStore.filter((store) => store.status === '2').length
})
RouteSchema.virtual('storeNotBuy').get(function () {
    return this.listStore.filter((store) => store.status === '3').length
})
RouteSchema.virtual('storeCheckin').get(function () {
    return this.listStore.filter((store) => store.status === '1').length
})
RouteSchema.set('toJSON', { virtuals: true });
RouteSchema.set('toObject', { virtuals: true });

const Route = mongoose.model('Route', RouteSchema)

module.exports = { Route }