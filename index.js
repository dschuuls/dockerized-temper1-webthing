const temper1 = require('./temper1');

const temperature = temper1.readTemperature(callback);

function callback(int, ext) {
  console.log('temperature int:', int);
  console.log('temperature ext:', ext);
}
