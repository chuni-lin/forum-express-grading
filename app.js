const express = require('express')
const handlebars = require('express-handlebars')
const db = require('./models')
const app = express()
const port = 3000

app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(express.urlencoded({ extended: true }))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})

require('./routes')(app)

module.exports = app