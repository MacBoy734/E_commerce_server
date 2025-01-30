const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const app = express()
const events = require('events');
events.EventEmitter.defaultMaxListeners = 20; // Set to a higher number

mongoose.connect(process.env.MONGO_DB_URI).then(() => console.log('connected to database...')).catch(error => console.error(error.message))
app.use(cookieParser())
const  origin = () => {
    if(process.env.IS_PRODUCTION == 'false') return 'http://localhost:3000'
    return  'https://macboy.netlify.app' 
}
app.use(cors({
    origin: origin(),
    credentials: true
})) 
app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) 
app.use('/users', require('./routes/users.js'))
app.use('/products', require('./routes/products.js'))
app.get('/', (req, res) => {
    res.send('this is the homepage!')
})

const port = process.env.PORT || 5000
app.listen(5000, () => console.log('app started at port %s', port))