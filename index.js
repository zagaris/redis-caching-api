const axios = require('axios');
const Redis = require('ioredis');

require('dotenv').config();


const redis = new Redis({
    'port': 6379,
    'host': '127.0.0.1'
});

const cityEndpoint = (city) => {
    return `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.API_KEY}`
}

const getWeather = async (city) => {
    try {

      let cacheEntry = await redis.get(`weather:${city}`);

      if (cacheEntry) {
        cacheEntry = JSON.parse(cacheEntry);

        return {...cacheEntry, 'source' : 'cache' };
      }

      let response = await axios.get(cityEndpoint(city));
      redis.set(`weather:${city}`, JSON.stringify(response.data));
      return {...response.data, 'source' : 'API' };
    } catch (error) {
      console.error(error)
    }
  }


(async () => {
    const t0 = new Date().getTime();
    let weather = await getWeather('athens')
    const t1 = new Date().getTime();
    weather.responseTime = `${t1-t0}ms`;
    console.log(weather);
    process.exit();
  })()

