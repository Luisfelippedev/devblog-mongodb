const Redis = require('ioredis')
const {createClient} = require('redis')

const redis = createClient(
    {url: "redis://localhost:6379",
    },
    console.log("Redis conectado!")
);


module.exports = redis