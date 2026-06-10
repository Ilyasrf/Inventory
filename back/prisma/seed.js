const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const items = [
  // ── Boards ──
  { name: 'ESP32 (Micro USB)', description: 'WiFi + Bluetooth microcontroller, great for IoT projects', category: 'Boards', totalQuantity: 11, imageUrl: '/uploads/esp32.png' },
  { name: 'ESP32-CAM', description: 'ESP32 with built-in camera module for vision projects', category: 'Boards', totalQuantity: 3, imageUrl: '/uploads/esp32_cam.png' },
  { name: 'Arduino Uno', description: 'Classic ATmega328P board, ideal for beginners', category: 'Boards', totalQuantity: 7, imageUrl: '/uploads/arduino_uno.png' },
  { name: 'Arduino Mega', description: 'More I/O pins and memory for complex projects', category: 'Boards', totalQuantity: 5, imageUrl: '/uploads/arduino_mega.png' },
  { name: 'Raspberry Pi 3', description: 'Full Linux single-board computer for AI and IoT', category: 'Boards', totalQuantity: 6, imageUrl: '/uploads/raspberry_pi.png' },

  // ── Sensors ──
  { name: 'HC-SR501 PIR Motion Sensor', description: 'Passive infrared motion detection', category: 'Sensors', totalQuantity: 5, imageUrl: '/uploads/pir_sensor.png' },
  { name: 'DHT22 (Temp/Humidity)', description: 'Digital temperature and humidity sensor', category: 'Sensors', totalQuantity: 4, imageUrl: '/uploads/dht22.png' },
  { name: 'MQ-135 Gas Sensor', description: 'Air quality sensor for CO2, NH3, benzene', category: 'Sensors', totalQuantity: 4, imageUrl: '/uploads/gas_sensor.png' },
  { name: 'IR Obstacle Avoidance Sensors', description: 'Infrared obstacle detection and avoidance for robotics', category: 'Sensors', totalQuantity: 8, imageUrl: '/uploads/ir_sensor.png' },
  { name: 'HC-SR04 Ultrasonic Distance Sensor', description: 'Measures distance using ultrasonic waves (2cm–400cm)', category: 'Sensors', totalQuantity: 9, imageUrl: '/uploads/ultrasonic.png' },
  { name: 'Sound Sensor Module KY-037', description: 'Detects sound levels with analog/digital output', category: 'Sensors', totalQuantity: 5, imageUrl: '/uploads/sound_sensor.png' },
  { name: 'ACS712 Current Sensor Module', description: 'Measures AC/DC current up to 30A', category: 'Sensors', totalQuantity: 8, imageUrl: '/uploads/acs712.png' },
  { name: 'L3G4200D 3-Axis Gyroscope', description: 'Three-axis digital gyroscope for orientation', category: 'Sensors', totalQuantity: 5, imageUrl: '/uploads/gyroscope.png' },

  // ── Modules ──
  { name: 'Channel Relay 5V', description: '5V relay module for switching high-power devices', category: 'Modules', totalQuantity: 4, imageUrl: '/uploads/modules.png' },
  { name: 'Camera Module 8MP', description: '8 megapixel camera module for Raspberry Pi', category: 'Modules', totalQuantity: 3, imageUrl: '/uploads/camera_module.png' },
  { name: 'LCD I2C Display', description: '16x2 LCD display with I2C backpack', category: 'Modules', totalQuantity: 4, imageUrl: '/uploads/modules.png' },
  { name: 'L298N Motor Driver', description: 'Dual H-bridge motor driver for DC motors', category: 'Modules', totalQuantity: 3, imageUrl: '/uploads/modules.png' },
  { name: 'RC522 RFID Module', description: 'RFID reader/writer for access control projects', category: 'Modules', totalQuantity: 1, imageUrl: '/uploads/modules.png' },

  // ── Motors ──
  { name: 'DC Motors + Wheels', description: 'DC gear motors with wheels for robot chassis', category: 'Motors', totalQuantity: 6, imageUrl: '/uploads/dc_motors.png' },
  { name: 'Micro Servo Motors', description: 'SG90 micro servos for precision movement', category: 'Motors', totalQuantity: 4, imageUrl: '/uploads/micro_servo.png' },
  { name: 'Analog Servo Motors', description: 'Standard analog servo motors for robotics', category: 'Motors', totalQuantity: 4, imageUrl: '/uploads/motors.png' },

  // ── Power ──
  { name: 'Raspberry Pi Power Supply 12.5W', description: 'Official Micro-USB 5V/2.5A power supply', category: 'Power', totalQuantity: 3, imageUrl: '/uploads/rpi_power.png' },
  { name: 'Battery Holder (18650 x2)', description: 'Holds two 18650 Li-ion batteries', category: 'Power', totalQuantity: 4, imageUrl: '/uploads/power.png' },
  { name: 'Li-ion Batteries', description: '18650 rechargeable lithium-ion cells', category: 'Power', totalQuantity: 12, imageUrl: '/uploads/power.png' },

  // ── Accessories ──
  { name: 'BreadBoard', description: '830-point solderless breadboard for prototyping', category: 'Accessories', totalQuantity: 5, imageUrl: '/uploads/breadboard.png' },
  { name: 'Black Electrical Tape', description: 'Insulation tape for wiring', category: 'Accessories', totalQuantity: 3, imageUrl: '/uploads/cables.png' },
  { name: 'USB Type-C Cable', description: 'Type-C data/power cable', category: 'Accessories', totalQuantity: 3, imageUrl: '/uploads/cables.png' },
  { name: 'Micro USB Cable', description: 'Micro-USB data/power cable', category: 'Accessories', totalQuantity: 3, imageUrl: '/uploads/cables.png' },
  { name: 'Flux', description: 'Soldering flux for clean solder joints', category: 'Accessories', totalQuantity: 1, imageUrl: '/uploads/cables.png' },
  { name: 'LED Pack (Assorted Colors)', description: '15 LEDs per color – red, green, blue, yellow, white', category: 'Accessories', totalQuantity: 75, imageUrl: '/uploads/led_pack.png' },
];

async function main() {
  const count = await prisma.item.count();
  if (count > 0) {
    console.log(`✅ Items already seeded (${count} found). Skipping seed to preserve data.`);
    return;
  }

  console.log('🌱 Seeding Makina Masters inventory...');

  for (const item of items) {
    await prisma.item.create({
      data: {
        name: item.name,
        description: item.description,
        category: item.category,
        totalQuantity: item.totalQuantity,
        availableQuantity: item.totalQuantity,
        imageUrl: item.imageUrl || null,
      },
    });
  }

  console.log(`✅ Seeded ${items.length} items`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
