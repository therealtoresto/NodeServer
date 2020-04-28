'use strict';

const http = require('http');

const user = { name: 'jura', age: 22 };

const routing = {
    '/' : '<h1>welcome to homepage</h1><hr>',
    '/user': user,
    '/user/name': () => user.name.toUpperCase(),
    '/user/age': () => user.age,
    '/user/*': (client, par) => 'parameter=' + par[0],
};

const types = {
    object: JSON.stringify,
    string: s => s,
    number: n => n + '',
    undefined: () => 'not found',
    function : (fn, par, client) => fn(client, par),
};

const matching = [];
for (const key in routing) {
    if (key.includes('*')) {
        const rx = new RegExp(key.replace('*', '(.*)'));
        const route = routing[key];
        matching.push([rx, route]);
        delete routing[key];
    }
}

const router = client => {
    let par;
    let route = routing[client.req.url];
    if (!route) {
        for (let i = 0; i < matching.length; i++) {
            const rs = matching[i];
            par = client.req.url.match(rx[0]);
            if (par) {
                par.shift();
                route = rx[1];
                break;
            }
        }
    }
    const type = typeof route;
    const renderer = types[type];
    return renderer(route, par, client);
};

http.createServer((req, res) => {
    res.end(router({ res, req }) + '');
}).listen(8000);