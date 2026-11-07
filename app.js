const express = require('express');
const os = require('node:os');
const redis = require('redis');

const app = express();
const port = process.env.APP_PORT;

let redisClient;

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

app.get('/visits', async (req, res) => {
    if(!redisClient.isReady) {
        return res.status(503).json({error: 'Redis unavailable' });
    }

    try {
        const visits = await redisClient.incr('visits');
        res.json({ visits });
    } catch {
        res.status(503).json({ error: 'Redis unavailable' });
    }
});

app.get('/health', async (req, res) => {
    if (!redisClient.isReady) {
        return res.status(503).json({ status: 'error' });
    }

    try {
        await redisClient.ping();
        res.status(200).json({ status: 'ok' });
    } catch {
        res.status(503).json({ status: 'error' });
    }
});

if (require.main === module) {
    redisClient = redis.createClient({
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    });

    redisClient.on('error', (err) => {
        console.error('Redis error:', err.message);
    });

    redisClient.connect().catch((err) => {
        console.error('Redis connection failed:', err.message);
    });

    app.listen(port, '0.0.0.0', () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;