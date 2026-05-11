const path = require('path');
const express = require('express');

const configViewEngine = (app) => {
    // Cấu hình thư mục chứa views
    app.set('views', path.join('./src', 'views'));
    
    // Cấu hình template engine là EJS
    app.set('view engine', 'ejs');
    
    // Cấu hình thư mục chứa file tĩnh (CSS, JS, images)
    app.use(express.static(path.join('./src', 'public')));
}

module.exports = configViewEngine;