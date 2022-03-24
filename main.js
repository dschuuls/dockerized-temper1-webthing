const HID = require('node-hid');

const devicePath = '/dev/hidraw1';
const readCommand = [0x01, 0x80, 0x33, 0x01, 0x00, 0x00, 0x00, 0x00];
// [1, 128, 51, 1, 0, 0, 0, 0]

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

readTemperature((int, ext) => {
  console.log('temperature int:', int);
  console.log('temperature ext:', ext);
});
