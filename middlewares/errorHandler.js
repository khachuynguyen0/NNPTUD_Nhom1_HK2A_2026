// Middleware xu ly loi toan cuc
const errorHandler = (err, req, res, next) => {
    console.error('[ErrorHandler]', err.stack || err.message);

    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Loi may chu noi bo',
    });
};

module.exports = errorHandler;
