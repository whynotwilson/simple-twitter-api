const express = require('express')
const helpers = require('./_helpers');

const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const app = express()
const port = process.env.port || 3000

app.use(methodOverride('_method'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app
require('./routes')(app)
