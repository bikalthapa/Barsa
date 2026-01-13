#include <AFMotor.h>
#include <Servo.h>


#define TRIG_PIN A0
#define ECHO_PIN A1

#define ANGLE_SERVO_PIN   9
#define TRIGGER_SERVO_PIN 10

/* ---------- TRIGGER SETTINGS ---------- */
#define TRIGGER_SAFE_POS  90
#define TRIGGER_FIRE_POS1  0
#define TRIGGER_FIRE_POS2  180
#define TRIGGER_DELAY_MS 400

// Track projectile launches
int projectileCount = 0;      // How many projectiles launched
const int MAX_PROJECTILES = 2; // Maximum projectiles available
float distanceCM = -1;   // global or class member variable
unsigned long pingStart = 0;
bool pingSent = false;

/* ---------- PHYSICS ---------- */
#define MUZZLE_VELOCITY  5.0
#define GRAVITY         9.81
#define CM_TO_METER     0.01

#define SERVO_MIN_ANGLE  0
#define SERVO_MAX_ANGLE  90


/* ===================================================== */

class SmartRobot {
    private:
  AF_DCMotor m1, m2, m3, m4;
  Servo angleServo, triggerServo;

  void setSpeed(int s) {
    m1.setSpeed(s); m2.setSpeed(s);
    m3.setSpeed(s); m4.setSpeed(s);
  }
  public:
    SmartRobot()
      : m1(1, MOTOR12_1KHZ), m2(2, MOTOR12_1KHZ),
        m3(3, MOTOR34_1KHZ), m4(4, MOTOR34_1KHZ) {}

    void begin() {
      Serial.begin(9600);

      Serial.println("Robot Online");
      Serial.println("Waiting for Bluetooth commands...");

      pinMode(TRIG_PIN, OUTPUT);
      pinMode(ECHO_PIN, INPUT);

      angleServo.attach(ANGLE_SERVO_PIN);
      triggerServo.attach(TRIGGER_SERVO_PIN);
      triggerServo.write(TRIGGER_SAFE_POS);
    }

    float getDistanceCM() {
      digitalWrite(TRIG_PIN, LOW);
      delayMicroseconds(2);
      digitalWrite(TRIG_PIN, HIGH);
      delayMicroseconds(10);
      digitalWrite(TRIG_PIN, LOW);

      unsigned long start = micros();

      // Wait for echo HIGH (max 3ms)
      while (digitalRead(ECHO_PIN) == LOW) {
        if (micros() - start > 3000) return -1;
      }

      unsigned long echoStart = micros();

      // Wait for echo LOW (max 25ms)
      while (digitalRead(ECHO_PIN) == HIGH) {
        if (micros() - echoStart > 25000) return -1;
      }

      unsigned long duration = micros() - echoStart;

      return duration * 0.034 / 2.0;
    }


    void move(uint8_t dir, int speed) {
      setSpeed(speed);
      m1.run(dir);
      m2.run(dir);
      m3.run(dir);
      m4.run(dir);
    }

    void stop() {
      m1.run(RELEASE);
      m2.run(RELEASE);
      m3.run(RELEASE);
      m4.run(RELEASE);
    }

    void turnLeft(int speed) {
      setSpeed(speed);
      m1.run(BACKWARD);
      m2.run(BACKWARD);
      m3.run(FORWARD);
      m4.run(FORWARD);
    }

    void turnRight(int speed) {
      setSpeed(speed);
      m1.run(FORWARD);
      m2.run(FORWARD);
      m3.run(BACKWARD);
      m4.run(BACKWARD);
    }

    void setLaunchAngle(float angle) {
      angle = constrain(angle, SERVO_MIN_ANGLE, SERVO_MAX_ANGLE);
      angleServo.write(angle);
    }



    void fire() {
        if (projectileCount >= MAX_PROJECTILES) {
            projectileCount = 0;
        }

        Serial.print("FIRE TRIGGERED - Projectile ");
        Serial.println(projectileCount + 1);

        int startPos = TRIGGER_SAFE_POS;
        int firePos;

        // Choose which fire position based on projectileCount
        if (projectileCount == 0) firePos = TRIGGER_FIRE_POS1;
        else firePos = TRIGGER_FIRE_POS2;

        // Smooth move from safe -> firePos
        for (int pos = startPos; pos <= firePos; pos++) {
            triggerServo.write(pos);
            delay(5); // adjust for speed
        }

        // Short pause to release projectile
        delay(100);

        // Return smoothly to safe position
        for (int pos = firePos; pos >= startPos; pos--) {
            triggerServo.write(pos);
            delay(5);
        }

        // Increment the projectile counter
        projectileCount++;

        Serial.println("FIRE COMPLETE");
    }


    float calculateAngle(float distanceCM) {
      float R = distanceCM * CM_TO_METER;
      float val = (R * GRAVITY) / (MUZZLE_VELOCITY * MUZZLE_VELOCITY);
      val = constrain(val, 0, 1);
      float theta = asin(val) / 2.0;
      return theta * 180.0 / PI;
    }
};

/* ===================================================== */

SmartRobot robot;

void setup() {
  robot.begin();
}

void loop() {
  if (Serial.available()) {
    char cmd = Serial.read();

    // 🔍 Show what Bluetooth sent
    Serial.print("Received: ");
    Serial.println(cmd);

    if (cmd == 'F') { Serial.println("Move Forward"); robot.move(FORWARD, 180); }
    if (cmd == 'B') { Serial.println("Move Backward"); robot.move(BACKWARD, 180); }
    if (cmd == 'L') { Serial.println("Turn Left"); robot.turnLeft(180); }
    if (cmd == 'R') { Serial.println("Turn Right"); robot.turnRight(180); }
    if (cmd == 'S') { Serial.println("Stop"); robot.stop(); }

    if (cmd == 'A') {
      robot.stop();
      Serial.println("Auto Aim Requested");
      float d = robot.getDistanceCM();
      float angle = robot.calculateAngle(d);
      robot.setLaunchAngle(angle);

      Serial.print("Distance: ");
      Serial.print(d);
      Serial.print(" cm  Angle: ");
      Serial.println(angle);

      Serial.print("Distance=");
      Serial.print(d);
      Serial.print("cm Angle=");
      Serial.println(angle);
    }

    if (cmd == 'X') robot.fire();
  }
}
