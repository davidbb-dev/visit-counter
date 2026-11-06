const express = require('express');
const os = require('node:os');

const app = express();
const port = process.env.APP_PORT;

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.json({
        message: 'Hello DevOps',
        host: os.hostname()
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});