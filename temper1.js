const HID = require('node-hid');

const devicePath = '/dev/hidraw1';
const readCommand = [0x01, 0x80, 0x33, 0x01, 0x00, 0x00, 0x00, 0x00];

exports.readTemperature = (callback) => {

    let device = new HID.HID(devicePath);
    device.write(readCommand);
    device.read((err, res) => {
        device.close();
        if (err) {
            callback.call(NaN, NaN);
        } else {
            callback.call(converter(response[2], response[3]), converter(response[4], response[5]));
        }
    });
}

toDegreeCelsius = (hiByte, loByte) => {
    if (hiByte === 255 && loByte === 255) {
        return NaN;
    }
    if ((hiByte & 128) === 128) {
        return -((256-hiByte) + (1 + ~(loByte >> 4)) / 16.0);
    }
    return hiByte + ((loByte >> 4) / 16.0);
}
