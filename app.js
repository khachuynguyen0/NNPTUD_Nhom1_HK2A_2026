// Cau hinh ung dung Express chinh
require('dotenv').config(); // Load bien moi truong tu .env

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var connectDB = require('./config/db');

// Import routes
var indexRouter = require('./routes/index');
var categoriesRouter = require('./routes/categories');
var productsRouter = require('./routes/products');
var usersRouter = require('./routes/users');
var appointmentsRouter = require('./routes/appointments');
var authRouter = require('./routes/auth');
var paymentsRouter = require('./routes/payments');

// Import middleware xu ly loi
var errorHandler = require('./middlewares/errorHandler');

// Ket noi MongoDB Atlas (bat khi da co MONGODB_URI trong .env)
connectDB(); // Ket noi MongoDB Atlas

var app = express();

// Middleware co ban
app.use(cors());           // Cho phep Frontend goi API tu domain khac
app.use(logger('dev'));    // Log moi request ra console
app.use(express.json());   // Parse body dang JSON
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Phuc vu file tinh (HTML/CSS/JS frontend) tu thu muc public/
app.use(express.static(path.join(__dirname, 'public')));

// Dang ky cac route API
app.use('/api', indexRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/auth', authRouter);
app.use('/api/payments', paymentsRouter);

// Middleware xu ly loi (phai dat cuoi cung)
app.use(errorHandler);

module.exports = app;
