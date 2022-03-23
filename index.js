const temper1 = require('./temper1');

const temperature = temper1.readTemperature('/dev/hidraw1');

console.log('temperature:', temperature);