const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const cron = require('node-cron')
const https = require('https')
require('dotenv').config()

const app = express()
const events = require('events');
events.EventEmitter.defaultMaxListeners = 20;

//RATE LIMITING MIDDLEWARE
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 150,
    message: 'Too many requests from this IP, please try again after 10 minutes',
    statusCode: 429,
});

app.use(limiter)

mongoose.connect(process.env.MONGO_DB_URI).then(() => console.log('connected to database...')).catch(error => console.error(error.message))
app.use(cookieParser())
const origin = () => {
    if (process.env.IS_PRODUCTION == 'false') return 'http://localhost:3000'
    return 'https://macboystore.netlify.app'
}
app.use(cors({
    origin: origin(),
    credentials: true
}))

// HITTING THE URI AFTER EVERY 14 MINUTES TO KEEP THE SERVER ACTIVE

const PING_URL = 'https://e-commerce-server-mrow.onrender.com'

if (process.env.IS_PRODUCTION === 'true') {
    cron.schedule('*/14 * * * *', () => {
        https.get(PING_URL, (res) => {
            console.log(`pinged server: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error('Ping error:', err.message);
        });
    })
}
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/users', require('./routes/users.js'))
app.use('/products', require('./routes/products.js'))
app.get('/', (req, res) => {
    res.send('this is the homepage!')
})

const port = process.env.PORT || 5000
app.listen(5000, () => console.log('app started at port %s', port))