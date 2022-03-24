const HID = require('node-hid');
const {Thing} = require("webthing");

const devicePath = '/dev/hidraw1';
const readCommand = [0x01, 0x80, 0x33, 0x01, 0x00, 0x00, 0x00, 0x00];
// [1, 128, 51, 1, 0, 0, 0, 0]

const sensor = new Thing('urn:dev:ops:temper1',
    'Temperature Sensor',
    ['MultiLevelSensor'],
    'A web connected temperature sensor');

readTemperature = (callback) => {

    let device = new HID.HID(devicePath);
    device.write(readCommand);
    device.read((err, res) => {
        device.close();
        if (err) {
            callback.call(NaN, NaN);
        } else {
            callback.call(toDegreeCelsius(res[2], res[3]));
        }
    });
}

toDegreeCelsius = (hiByte, loByte) => {

    let sign = hiByte & (1 << 7);
    let temp = ((hiByte & 0x7F) << 8) | loByte;

    if (sign) temp = -temp;

    // Calculate it
    return temp * 125.0 / 32000.0;
}

readTemperature((temp) => {

    console.log('temperature:', temp);
});
