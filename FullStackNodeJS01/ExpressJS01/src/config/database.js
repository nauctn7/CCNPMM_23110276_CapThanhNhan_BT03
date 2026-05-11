// Load biến môi trường từ file .env
require('dotenv').config();

const mongoose = require('mongoose');

// Định nghĩa các trạng thái kết nối
const dbstate = [
    { value: 0, label: "Disconnected" },    // Ngắt kết nối
    { value: 1, label: "Connected" },       // Đã kết nối
    { value: 2, label: "Connecting" },      // Đang kết nối
    { value: 3, label: "Disconnecting" }    // Đang ngắt kết nối
];

const connection = async () => {
    try {
        // Kết nối đến MongoDB
        await mongoose.connect(process.env.MONGO_DB_URL);
        
        // Lấy trạng thái kết nối
        const state = Number(mongoose.connection.readyState);
        
        // Hiển thị trạng thái
        console.log(dbstate.find(f => f.value === state).label, "to database");
    } catch (error) {
        console.log("Database connection error:", error);
    }
}

module.exports = connection;