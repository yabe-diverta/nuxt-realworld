const fs = require('fs')
const path = require('path')

const waitMilliSecond = 0

const tasks = ['open.0', 'click.1', 'click.2', 'click.3'].map(
    (promiseFactoryName) => ({
        promiseFactoryName,
        promiseFactory: require(path.resolve(__dirname, promiseFactoryName)),
        waitMilliSecond,
    })
)

module.exports = tasks
