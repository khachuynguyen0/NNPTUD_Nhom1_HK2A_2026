// Ket noi MongoDB Atlas bang Mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    await mongoose.connect(uri);

    console.log('>>> Ket noi MongoDB Atlas thanh cong!');
  } catch (error) {
    console.error('>>> Loi ket noi MongoDB:', error.message);
    process.exit(1); // Dung server neu khong ket noi duoc DB
  }
};

module.exports = connectDB;
