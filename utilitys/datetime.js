const moment = require('moment')

function period() {
    const date = moment().format('YYYYMM', 'th');
    return date
}

function timestamp () {
    const date = new Date()
    return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`
}

module.exports = { period, timestamp }