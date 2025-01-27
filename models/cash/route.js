const mongoose = require('mongoose')

const ListOrderSchema = new mongoose.Schema({
    number: { type: Number },
    orderId: { type: String },
    status: { type: String, default: '0' },
    statusText: { type: String, default: '' },
    date: { type: Date },
})

const ListStoreSchema = new mongoose.Schema({
    storeInfo: { type: String, ref: 'Store', required: true },
    note: { type: String, default: '' },
    image: { type: String, default: '' },
    latitude: { type: String, default: '0.00' },
    longtitude: { type: String, default: '0.00' },
    status: { type: String, default: '0' },
    statusText: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    listOrder: [ListOrderSchema]
})

const RouteSchema = new mongoose.Schema({
    id: { type: String, required: true, index: true },
    period: { type: String, required: true, index: true },
    area: { type: String, required: true },
    day: { type: String, required: true },
    listStore: [ListStoreSchema]
})

RouteSchema.virtual('storeAll').get(function () {
    return this.listStore.length
})
RouteSchema.virtual('storePending').get(function () {
    return this.listStore.filter((store) => store.status === '0').length
})
RouteSchema.virtual('storeBuy').get(function () {
    return this.listStore.filter((store) => store.status === '1').length
})
RouteSchema.virtual('storeNotBuy').get(function () {
    return this.listStore.filter((store) => store.status === '2').length
})
RouteSchema.virtual('storeTotal').get(function () {
    return this.listStore.filter((store) => ['1', '2'].includes(store.status)).length
})
RouteSchema.set('toJSON', { virtuals: true })
RouteSchema.set('toObject', { virtuals: true })

const Route = mongoose.model('Route', RouteSchema)

module.exports = { Route }