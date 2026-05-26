// Load biến môi trường
require('dotenv').config();

// Import thư viện
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const { spawn } = require('child_process');

// Import cấu hình
const configViewEngine = require('./src/config/viewEngine');
const connection = require('./src/config/database');
const Product = require('./src/models/product');
const User = require('./src/models/user');
const { syncAutoConfirmOrders } = require('./src/services/orderService');

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

const runSeedScript = () => new Promise((resolve, reject) => {
    const seedScript = path.join(__dirname, 'src', 'seed.js');
    const child = spawn(process.execPath, [seedScript], {
        cwd: __dirname,
        stdio: 'inherit'
    });

    child.on('error', reject);
    child.on('exit', (code) => {
        if (code === 0) {
            resolve();
        } else {
            reject(new Error(`Seed script exited with code ${code}`));
        }
    });
});

const ensureDemoUser = async () => {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
        return;
    }

    const hashedPassword = await bcrypt.hash('123456', 10);
    await User.create({
        name: 'Demo User',
        email: 'demo@luxury.local',
        password: hashedPassword,
        role: 'user',
        isVerified: true
    });

    console.log('Created demo user: demo@luxury.local / 123456');
};

const bootstrap = async () => {
    await connection();

    await syncAutoConfirmOrders();
    setInterval(() => {
        syncAutoConfirmOrders().catch((error) => {
            console.error('Failed to sync order statuses:', error);
        });
    }, 5 * 60 * 1000);

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
        console.log('No products found, running seed script...');
        await runSeedScript();
    }

    await ensureDemoUser();

    app.listen(port, () => {
        console.log(`Backend Nodejs App listening on port ${port}`);
        console.log(`http://localhost:${port}`);
    });
};

// Khởi động server
bootstrap().catch((error) => {
    console.error('Failed to start backend:', error);
    process.exit(1);
});