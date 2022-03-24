const HID = require('node-hid');

const {
    SingleThing,
    Property,
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
                title: 'Humidity',
                type: 'number',
                description: 'The current humidity in %',
                minimum: 0,
                maximum: 100,
                unit: 'percent',
                readOnly: true,
            })
        );

        // Poll the sensor reading every 3 seconds
        setInterval(() => {
            // Update the underlying value, which in turn notifies all listeners
            const newLevel = this.readTemperature();
            console.log('setting new temperature:', newLevel);
            this.level.notifyOfExternalUpdate(newLevel);
        }, 3000);

        this.readTemperature = () => {

            let device = new HID.HID(devicePath);
            device.write(readCommand);
            device.read((err, res) => {
                device.close();
                if (!err) return this.toDegreeCelsius(res[2], res[3]);
            });
            return NaN;
        }

        this.toDegreeCelsius = (hiByte, loByte) => {

            let sign = hiByte & (1 << 7);
            let temp = ((hiByte & 0x7F) << 8) | loByte;
            if (sign) temp = -temp;
            return temp * 125.0 / 32000.0;
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