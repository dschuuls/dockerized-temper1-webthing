const HID = require('node-hid');

const readCommand = [0x01, 0x80, 0x33, 0x01, 0x00, 0x00, 0x00, 0x00];

exports.getDevices = () => {
    const devices = HID.devices();
    let seen = {};
    let list = [];
    devices.forEach((item) => {
        if ( // item.product.match("TEMPer1V1") && // match any TEMPer products by vendorId
            item['vendorId'] === 3141 &&
            item['interface'] === 1 &&
            !seen[item.path]
        ) {
            list.push(item.path);
            seen[item.path] = true;
        }
    });
    return list;
}

exports.readTemperature = (path, callback, converter) => {
    if (!converter) converter=exports.toDegreeCelsius;
    let device = new HID.HID(path);
    device.write(readCommand);
    device.read((err, response) => {
        device.close();
        if (err) {
            callback.call(this, err, null);
        } else {
            callback.call(this, null, converter(response[2], response[3]), converter(response[4], response[5]));
        }
    });
}

exports.toDegreeCelsius = (hiByte, loByte) => {
    if (hiByte === 255 && loByte === 255) {
        return NaN;
    }
    if ((hiByte & 128) === 128) {
        return -((256-hiByte) + (1 + ~(loByte >> 4)) / 16.0);
    }
    return hiByte + ((loByte >> 4) / 16.0);
}