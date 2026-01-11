#include <Wire.h>
#include <U8g2lib.h>
#include <SPI.h>
#include <WiFiClient.h> 
#include <ESP8266WiFi.h>
#include <SoftwareSerial.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <Adafruit_Fingerprint.h>
#include <EEPROM.h>


#define Finger_Rx D5
#define Finger_Tx D4
#define SCREEN_WIDTH 128 
#define SCREEN_HEIGHT 64 
#define OLED_RESET     0 
#define BUZZER_PIN D8

// Definition For EEPROM
#define EEPROM_SIZE 192   // Enough for SSID + Password + url
#define SSID_ADDR 0       // Start address for SSID
#define PASS_ADDR 64      // Start address for Password
#define URL_ADDR 128      // Start address for Base URL
#define MAX_LEN 64        // Maximum length for each field

// Definition For push Btn
#define BTN_PIN D6
#define AP_HOLD_TIME 3000   // 3 seconds
unsigned long lastPressTime = 0;
const unsigned long debounceDelay = 200;
unsigned long btnPressStart = 0;
bool apForced = false;

U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/U8X8_PIN_NONE, /* clock=*/D1, /* data=*/D2);
SoftwareSerial mySerial(Finger_Rx, Finger_Tx);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);  
ESP8266WebServer server(80);


char ssid[MAX_LEN];      // buffer for SSID from EEPROM
char password[MAX_LEN];  // buffer for password from EEPROM
char url[MAX_LEN];   // buffer for base URL from EEPROM
String link;             // can still use String for full GET path


String postData; 
int FingerID = 0;     
uint8_t id;

// wifi connection
unsigned long lastWifiCheck = 0;
unsigned long lastDeleteCheck = 0;
const unsigned long WIFI_CHECK_INTERVAL = 10000; // 10 seconds
const unsigned long DELETE_CHECK_INTERVAL = 15000; // 8 sec
bool lastWifiState = false;
bool apModeActive = false;


// Save SSID, Password, and Base URL to EEPROM
void saveWiFiAndURL(const char* ssid, const char* password, const char* url) {
  EEPROM.begin(EEPROM_SIZE);

  for (int i = 0; i < MAX_LEN; i++) {
    EEPROM.write(SSID_ADDR + i, ssid[i]);
    EEPROM.write(PASS_ADDR + i, password[i]);
    EEPROM.write(URL_ADDR + i, url[i]);
    
    // Stop early if null character
    if (ssid[i] == '\0' && password[i] == '\0' && url[i] == '\0') break;
  }

  EEPROM.commit();
  EEPROM.end();
}

// Read SSID, Password, and Base URL from EEPROM
void readWiFiAndURL() {
  EEPROM.begin(EEPROM_SIZE);

  for (int i = 0; i < MAX_LEN; i++) {
    ssid[i]     = EEPROM.read(SSID_ADDR + i);
    password[i] = EEPROM.read(PASS_ADDR + i);
    url[i]  = EEPROM.read(URL_ADDR + i);
  }

  // Safety: ensure null-termination
  ssid[MAX_LEN - 1]     = '\0';
  password[MAX_LEN - 1] = '\0';
  url[MAX_LEN - 1]  = '\0';

  // Build full endpoint
  link = String(url) + "/biometricattendance/getdata.php";

  EEPROM.end();
}


void startAPMode() {
  apModeActive = true;
  WiFi.mode(WIFI_AP);
  WiFi.softAP("BARSA Attend", "BARSA-setup");
  IPAddress apIP = WiFi.softAPIP();
  String apInfo = "SSID: BARSA Attend\nIP: " + apIP.toString();

  // Display on OLED using your helper
  displayMessageCenter("AP MODE ACTIVE", apInfo.c_str());
  
  server.on("/", HTTP_GET, []() {
    server.send(200, "text/html",
      "<h2>BARSA Attend Setup</h2>"
      "<form action='/save' method='POST'>"

      "SSID:<br>"
      "<input name='s' value='" + String(ssid) + "'><br>"

      "Password:<br>"
      "<input name='p' type='password' value='" + String(password) + "'><br>"

      "Base URL:<br>"
      "<input name='u' value='" + String(url) + "'><br><br>"

      "<button>Save</button>"
      "</form>"
    );
  });


  server.on("/save", HTTP_POST, []() {
    String s = server.arg("s");
    String p = server.arg("p");
    String u = server.arg("u");

    s.toCharArray(ssid, MAX_LEN);
    p.toCharArray(password, MAX_LEN);
    u.toCharArray(url, MAX_LEN);

    saveWiFiAndURL(ssid, password, url);

    server.send(200, "text/html", "Saved! Rebooting...");
    delay(1000);
    ESP.restart();
  });

  server.begin();
}


bool buttonPressed() {
  if (digitalRead(BTN) == LOW) {
    if (millis() - lastPressTime > debounceDelay) {
      lastPressTime = millis();
      return true;
    }
  }
  return false;
}
bool checkAPButton() {
  if (digitalRead(BTN_PIN) == LOW) {
    if (btnPressStart == 0) btnPressStart = millis();
    if (millis() - btnPressStart >= AP_HOLD_TIME) {
      return true;
    }
  } else {
    btnPressStart = 0;
  }
  return false;
}


void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BTN_PIN, INPUT_PULLUP);
  Serial.begin(115200);
  
  u8g2.begin();
  u8g2.clearBuffer();
  u8g2.sendBuffer();

  setIntro();

  /* ---- Allow button to force AP during intro (5s window) ---- */
  unsigned long introStart = millis();
  while (millis() - introStart < 5000) {   // intro time
    if (checkAPButton()) {
      apForced = true;
      break;
    }
    delay(10);
  }

  readWiFiAndURL();

  if (apForced || !connectToWiFi()) {
    startAPMode();      // Manual or auto AP mode
  }

  /* ---------- Fingerprint ---------- */
  finger.begin(57600);
  Serial.println("\n\nAdafruit finger detect test");

  if (finger.verifyPassword()) {
    Serial.println("Found fingerprint sensor!");
    displayMessageCenter("Sensor Status", "Found");
  } else {
    Serial.println("Did not find fingerprint sensor :(");
    displayMessageCenter("Sensor Status", "Not Found");
    while (1) { delay(1); }
  }

  finger.getTemplateCount();
  Serial.print("Sensor contains ");
  Serial.print(finger.templateCount);
  Serial.println(" templates");
  Serial.println("Waiting for valid finger...");
}


void displayMessageCenter(const char* heading, const char* description) {
  const int16_t maxWidth = 128; // Width of the display
  const int16_t lineHeight = 12; 

  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB08_tr);

  // Use default heading if none is provided
  if (heading == nullptr || strlen(heading) == 0) {
    heading = "-------";
  }

  // Display the heading
  int16_t headingWidth = u8g2.getStrWidth(heading);
  int16_t headingXPos = (maxWidth - headingWidth) / 2; // Center the heading
  u8g2.drawStr(headingXPos, lineHeight, heading);

  // Display the description
  char buffer[128]; // Temporary buffer to hold the line
  int yPos = 2 * lineHeight; // Start below the heading
  int bufIdx = 0; 

  for (const char* p = description; *p; p++) {
    buffer[bufIdx++] = *p;
    buffer[bufIdx] = '\0'; // Null-terminate the buffer

    if (u8g2.getStrWidth(buffer) > maxWidth) {
      // Scroll the text if it exceeds the screen width
      for (int i = 0; i < bufIdx; i++) {
        u8g2.clearBuffer();
        u8g2.setFont(u8g2_font_ncenB08_tr);
        u8g2.drawStr(headingXPos, lineHeight, heading);
        u8g2.drawStr(0, yPos, buffer + i);
        u8g2.sendBuffer();
        delay(100); // Adjust the delay for scrolling speed
      }
      bufIdx = 0;
    }
  }

  // Draw any remaining text if it fits within the screen width
  if (bufIdx > 0) {
    buffer[bufIdx] = '\0'; // Null-terminate the buffer
    int16_t textWidth = u8g2.getStrWidth(buffer);
    if (textWidth <= maxWidth) {
      int16_t xPos = (maxWidth - textWidth) / 2; // Center the current line
      u8g2.drawStr(xPos, yPos, buffer);
    } else {
      // Scroll the remaining text if it exceeds the screen width
      for (int i = 0; i < bufIdx; i++) {
        u8g2.clearBuffer();
        u8g2.setFont(u8g2_font_ncenB08_tr);
        u8g2.drawStr(headingXPos, lineHeight, heading);
        u8g2.drawStr(0, yPos, buffer + i);
        u8g2.sendBuffer();
        delay(100); // Adjust the delay for scrolling speed
      }
    }
  }

  u8g2.sendBuffer();
}



void setIntro() {
  displayMessageCenter("Tech BARSA", "Presents");
  delay(2000);
  displayMessageCenter("BARSA", "Attend");
  playSoundNotes();
  delay(2000);
}






void loop() {

  // ---- If AP mode is active, ONLY handle setup ----
  if (apModeActive) {
    server.handleClient();   // REQUIRED
    return;                  // Stop rest of logic
  }

  // ---- WiFi check every 10 seconds ----
  if (millis() - lastWifiCheck >= WIFI_CHECK_INTERVAL) {
    lastWifiCheck = millis();

    bool wifiConnected = (WiFi.status() == WL_CONNECTED);

    if (wifiConnected != lastWifiState) {
      lastWifiState = wifiConnected;

      if (!wifiConnected) {
        playErrorSound();

        if (!connectToWiFi()) {
          startAPMode();
          apModeActive = true;
          return;
        }
      } else {
        playSuccessSound();
      }
    }
  }

  // ---- Fingerprint scanning ----
  FingerID = getFingerprintID();

  if (FingerID > 0) {
    displayMessageCenter("FingerPrint Status", "Valid");
    SendFingerprintID(FingerID);
    playSuccessSound();
    delay(1000);

  } else if (FingerID == 0) {
    displayMessageCenter("FingerPrint Status", "Scanning...");

  } else if (FingerID == -1) {
    displayMessageCenter("FingerPrint Status", "Invalid");
    playErrorSound();
    delay(1000);

  } else if (FingerID == -2) {
    displayMessageCenter("FingerPrint Status", "Error");
    delay(1000);
  }

  // ---- ADD Fingerprint only when button is pressed ----
  if (buttonPressed()) {
    displayMessageCenter("Checking For", "Fingerprint Enroll");
    playSuccessSound();
    ChecktoAddID();
  }


  // ---- Delete ID check ----
  if (millis() - lastDeleteCheck >= DELETE_CHECK_INTERVAL) {
    lastDeleteCheck = millis();
    ChecktoDeleteID();
  }
}



void DisplayFingerprintID() {
  if (FingerID > 0) {
    displayMessageCenter("FingerPrint Status", "Valid");
    SendFingerprintID(FingerID);
  }
  else if (FingerID == 0) {
    displayMessageCenter("FingerPrint Status", "Scanning...");
  }
  else if (FingerID == -1) {
    displayMessageCenter("FingerPrint Status", "Invalid");
  }
  else if (FingerID == -2) {
    displayMessageCenter("FingerPrint Status", "Error");
  }
}




void SendFingerprintID(int finger) {
  WiFiClient client;
  HTTPClient http;
  String postData = "FingerID=" + String(finger);
  http.begin(client, link);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");

  int httpCode = http.POST(postData);   // Send the request
  String payload = http.getString();    // Get the response payload

  Serial.println(httpCode);   // Print HTTP return code
  Serial.println(payload);    // Print request response payload
  Serial.println(postData);   // Post Data
  Serial.println(finger);     // Print fingerprint ID

  if (payload.substring(0, 5) == "login") {
    String user_name = payload.substring(5);
    displayMessageCenter("Welcome", user_name.c_str());
  } else if (payload.substring(0, 6) == "logout") {
    String user_name = payload.substring(6);
    displayMessageCenter("Good Bye", user_name.c_str());
  }
  delay(1000);

  postData = "";
  http.end();  // Close connection
}


//********************Get the Fingerprint ID******************
int getFingerprintID() {
  uint8_t p = finger.getImage();
  switch (p) {
    case FINGERPRINT_OK:
      displayMessageCenter("FingerPrint Status", "Image taken");
      break;
    case FINGERPRINT_NOFINGER:
      displayMessageCenter("FingerPrint Status", "Not detected");
      return 0;
    case FINGERPRINT_PACKETRECIEVEERR:
      displayMessageCenter("FingerPrint Status", "Communication error");
      return -2;
    case FINGERPRINT_IMAGEFAIL:
      displayMessageCenter("FingerPrint Status", "Imaging error");
      return -2;
    default:
      displayMessageCenter("FingerPrint Status", "Unknown error");
      return -2;
  }

  p = finger.image2Tz();
  switch (p) {
    case FINGERPRINT_OK:
      displayMessageCenter("FingerPrint Status", "Image converted");
      break;
    case FINGERPRINT_IMAGEMESS:
      displayMessageCenter("FingerPrint Status", "Image too messy");
      return -1;
    case FINGERPRINT_PACKETRECIEVEERR:
      displayMessageCenter("FingerPrint Status", "Communication error");
      return -2;
    case FINGERPRINT_FEATUREFAIL:
    case FINGERPRINT_INVALIDIMAGE:
      displayMessageCenter("FingerPrint Status", "Extraction failed");
      return -2;
    default:
      displayMessageCenter("FingerPrint Status", "Unknown error");
      return -2;
  }

  p = finger.fingerFastSearch();
  if (p == FINGERPRINT_OK) {
    displayMessageCenter("FingerPrint Status", "Matched !");
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    displayMessageCenter("FingerPrint Status", "Error");
    return -2;
  } else if (p == FINGERPRINT_NOTFOUND) {
    displayMessageCenter("FingerPrint Status", "Not matched !");
    return -1;
  } else {
    displayMessageCenter("FingerPrint Status", "Unknown error");
    return -2;
  }

  return finger.fingerID;
}


uint8_t deleteFingerprint(int id) {
  uint8_t p = finger.deleteModel(id);

  if (p == FINGERPRINT_OK) {
    displayMessageCenter("FingerPrint Status", "Deleted!");
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    displayMessageCenter("FingerPrint Status", "Communication error!");
  } else if (p == FINGERPRINT_BADLOCATION) {
    displayMessageCenter("FingerPrint Status", "Could not delete in that location!");
  } else if (p == FINGERPRINT_FLASHERR) {
    displayMessageCenter("FingerPrint Status", "Error writing to flash!");
  } else {
    displayMessageCenter("FingerPrint Status", "Unknown error");
  }

  return p;
}

uint8_t getFingerprintEnroll() {
  int p = -1;

  displayMessageCenter("FingerPrint Enroll", "Place finger");
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_NOFINGER) {
      displayMessageCenter("FingerPrint Enroll", "Scanning...");
    }
  }

  p = finger.image2Tz(1);
  if (p == FINGERPRINT_OK) {
    displayMessageCenter("FingerPrint Enroll", "Image Converted");
  } else {
    return p;
  }

  displayMessageCenter("FingerPrint Enroll", "Remove finger");
  delay(2000);

  p = 0;
  while (p != FINGERPRINT_NOFINGER) {
    p = finger.getImage();
  }

  Serial.print("ID "); Serial.println(id);
  p = -1;

  displayMessageCenter("FingerPrint Enroll", "Place finger again");

  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_NOFINGER) {
      displayMessageCenter("FingerPrint Enroll", "Scanning...");
    }
  }

  p = finger.image2Tz(2);
  if (p == FINGERPRINT_OK) {
    displayMessageCenter("FingerPrint Enroll", "Image Converted");
  } else {
    return p;
  }

  p = finger.createModel();
  if (p == FINGERPRINT_OK) {
    displayMessageCenter("FingerPrint Enroll", "Prints matched!");
  } else {
    return p;
  }

  Serial.print("ID "); Serial.println(id);
  p = finger.storeModel(id);
  if (p == FINGERPRINT_OK) {
    playSuccessSound();
    displayMessageCenter("FingerPrint Enroll", "Stored!");
    confirmAdding();
  } else {
    return p;
  }

  return p;
}



void confirmAdding() {
  WiFiClient client;
  HTTPClient http; // Declare object of class HTTPClient

  // Post Data
  String postData = "confirm_id=" + String(id); // Add the Fingerprint ID to the Post array to send it

  // Post method
  http.begin(client, link); // Initiate HTTP request with your website URL or computer IP 
  http.addHeader("Content-Type", "application/x-www-form-urlencoded"); // Specify content-type header

  int httpCode = http.POST(postData); // Send the request
  String payload = http.getString(); // Get the response payload

  displayMessageCenter("FingerPrint Status", payload.c_str());
  delay(1000);

  Serial.println(payload);

  http.end(); // Close connection
}

void ChecktoAddID() {
  WiFiClient client;
  HTTPClient http;  // Declare object of class HTTPClient

  // Post Data
  String postData = "Get_Fingerid=get_id";  // Add the Fingerprint ID to the Post array to send it
  // Post method

  http.begin(client, link); // Initiate HTTP request with your website URL or computer IP 
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");  // Specify content-type header
  
  int httpCode = http.POST(postData);  // Send the request
  String payload = http.getString();  // Get the response payload

  if (payload.substring(0, 6) == "add-id") {
    String add_id = payload.substring(6);
    Serial.println(add_id);
    id = add_id.toInt();
    displayMessageCenter("FingerPrint Enroll", ("Adding new ID: " + add_id).c_str());
    delay(2000);
    getFingerprintEnroll();
  }

  http.end();  // Close connection
}

void ChecktoDeleteID() {
  WiFiClient client;
  HTTPClient http;    // Declare object of class HTTPClient
  // Post Data
  String postData = "DeleteID=check"; // Add the Fingerprint ID to the Post array to send it

  // Initialize HTTP request with your website URL or computer IP
  http.begin(client, link);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");    // Specify content-type header
  
  int httpCode = http.POST(postData);   // Send the request
  String payload = http.getString();    // Get the response payload

  if (payload.substring(0, 6) == "del-id") {
    String del_id = payload.substring(6);
    Serial.println(del_id);
    displayMessageCenter("FingerPrint Status", ("Deleting ID: " + del_id).c_str());
    deleteFingerprint(del_id.toInt());
  }

  http.end();  // Close connection
}

bool connectToWiFi() {
  WiFi.mode(WIFI_OFF);
  delay(1000);
  WiFi.mode(WIFI_STA);

  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  displayMessageCenter("WiFi (Connecting)", ssid);

  int attemptCount = 0;
  const int maxAttempts = 5;

  while (WiFi.status() != WL_CONNECTED && attemptCount < maxAttempts) {
    delay(500);
    Serial.print(".");
    beepBuzzer(500);
    attemptCount++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    playSuccessSound();
    displayMessageCenter("WiFi (Connected)", ssid);
    Serial.println("\nConnected");
    Serial.println(WiFi.localIP());
    return true;
  } else {
    playErrorSound();
    displayMessageCenter("WiFi (Not Connected)", ssid);
    Serial.println("\nFailed to connect");
    return false;
  }
}










void playSuccessSound() {
  tone(BUZZER_PIN, 1000, 200); // Note C4
  delay(200);
  tone(BUZZER_PIN, 1200, 200); // Note D4
  delay(200);
  tone(BUZZER_PIN, 1500, 200); // Note E4
  delay(200);
}

void playErrorSound() {
  tone(BUZZER_PIN, 500, 500); // Note G3
  delay(500);
  tone(BUZZER_PIN, 400, 500); // Note F3
  delay(500);
}

void playProcessingSound() {
  for (int i = 0; i < 3; i++) {
    tone(BUZZER_PIN, 800, 100); // Note A4
    delay(100);
    tone(BUZZER_PIN, 1000, 100); // Note C5
    delay(100);
  }
}
void playSoundNotes() {
    int melody[] = {262, 294, 330, 349, 392, 440, 494, 523}; // C4 to C5 notes
  
  int noteDuration = 188; // Duration of each note in milliseconds

  for (int i = 0; i < 8; i++) {
    tone(BUZZER_PIN, melody[i], noteDuration);
    delay(noteDuration * 1.30); // Wait for the note to finish
  }

  noTone(BUZZER_PIN); // Stop the buzzer
}
void beepBuzzer(int duration) {

  digitalWrite(BUZZER_PIN, HIGH); // Turn the buzzer on
  delay(duration);                // Wait for the specified duration
  digitalWrite(BUZZER_PIN, LOW);  // Turn the buzzer off
}
