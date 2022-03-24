const HID = require('node-hid');

const {
    Property,
    SingleThing,
    Thing,
    Value,
    WebThingServer,
} = require('webthing');

const devicePath = '/dev/hidraw1';
const readCommand = [0x01, 0x80, 0x33, 0x01, 0x00, 0x00, 0x00, 0x00];

class TemperatureSensor extends Thing {
    constructor() {
        super(
            'urn:dev:ops:temper1',
            'Temperature Sensor',
            ['MultiLevelSensor'],
            'A web connected temperature sensor'
        );

        this.level = new Value(0.0);

        this.addProperty(
            new Property(this, 'level', this.level, {
                '@type': 'LevelProperty',
                title: 'Temperature',
                type: 'number',
                description: 'The current temperature in °C',
                minimum: 273.15 * -1,
                maximum: 273.15,
                unit: 'degrees',
                readOnly: true,
            })
        );

        // Poll the sensor reading every 30 seconds
        setInterval(() => {
            // Update the underlying value, which in turn notifies all listeners
            this.readTemperature();

        }, 30 * 1000);

        this.readTemperature = () => {

            let device = new HID.HID(devicePath);
            device.write(readCommand);
            device.read((err, res) => {
                device.close();
                if (!err) {
                    const temp = this.toDegreeCelsius(res[2], res[3]);
                    console.log('setting new temperature:', temp);
                    this.level.notifyOfExternalUpdate(temp);
                } else {
                    console.log('err');
                }
            });
        }

        this.toDegreeCelsius = (hiByte, loByte) => {

            let sign = hiByte & (1 << 7);
            let temp = ((hiByte & 0x7F) << 8) | loByte;
            if (sign) temp = -temp;
            let retVal = temp * 125.0 / 32000.0;
            console.log(retVal);
            return retVal;
        }
    }
}

function runServer() {

    const sensor = new TemperatureSensor();
    const server = new WebThingServer(
        new SingleThing(sensor),
        8888
    );

    process.on('SIGINT', () => {
        server
            .stop()
            .then(() => process.exit())
            .catch(() => process.exit());
    });

    server.start().catch(console.error);
}

runServer();