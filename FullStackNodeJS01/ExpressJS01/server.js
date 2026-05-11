// Load biến môi trường
require('dotenv').config();

// Import thư viện
const express = require('express');
const cors = require('cors');

// Import cấu hình
const configViewEngine = require('./src/config/viewEngine');
const connection = require('./src/config/database');

// Import routes
const apiRoutes = require('./src/routes/api');

// Khởi tạo app
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());                    // Cho phép cross-origin
app.use(express.json());            // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body

// Cấu hình view engine
configViewEngine(app);

// Khai báo routes
app.use('/api', apiRoutes);

// Route mặc định cho web
app.get('/', (req, res) => {
    res.render('index.ejs');
});

// Khởi động server
app.listen(port, async () => {
    // Kết nối database
    await connection();
    
    console.log(`Backend Nodejs App listening on port ${port}`);
    console.log(`http://localhost:${port}`);
});