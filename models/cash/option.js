const mongoose = require('mongoose')

const list = mongoose.Schema({
    name: { type: String }
})

const optionSchema = mongoose.Schema(
    {
        module: { type: String, require: true },
        type: { type: String, require: true },
        description: { type: String, require: true },
        list: [list],
        created: { type: Date, default: Date.now },
        updated: { type: Date, default: Date.now },
    })

const Option = mongoose.model('Option', optionSchema)

module.exports = { Option }