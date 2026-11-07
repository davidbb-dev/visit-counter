const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const app = require('../app');

test('GET / returns expected response', async () => {
    const server = app.listen(0, '127.0.0.1');

    try {
        await new Promise((resolve) => {
            server.once('listening', resolve);
        });

        const port = server.address().port;
        const response = await fetch(`http://127.0.0.1:${port}/`);
        const body = await response.json();

        assert.equal(response.status, 200);
        assert.equal(body.message, 'Hello DevOps');
        assert.equal(body.host, os.hostname());
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
});