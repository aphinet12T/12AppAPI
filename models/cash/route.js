const mongoose = require('mongoose')

const ListStoreSchema = new mongoose.Schema({
    storeInfo: StoreInfoSchema,
    latitude: { type: String, required: true },
    longtitude: { type: String, required: true },
    note: { type: String, default: '' },
    status: { type: String, default: '1' },
    statusText: { type: String, default: '' },
    date: { type: Date },
    listOrder: [ListOrderSchema]
})

const StoreInfoSchema = new mongoose.Schema({
    storeId: { type: String, required: true },
    storeName: { type: String, default: '' },
    storeAddress: { type: String, default: '' },
    storeType: { type: String, default: '' },
})

const ListOrderSchema = new mongoose.Schema({
    number: { type: Number, required: true },
    orderId: { type: String, required: true },
    status: { type: String, default: '' },
    statusText: { type: String, default: '' },
    date: { type: Date, required: true },
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