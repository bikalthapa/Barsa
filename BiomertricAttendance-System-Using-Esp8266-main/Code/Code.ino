#include <Wire.h>
#include <U8g2lib.h>
#include <SPI.h>
#include <WiFiClient.h> 
#include <ESP8266WiFi.h>
#include <SoftwareSerial.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <Adafruit_Fingerprint.h>

#define Finger_Rx D5
#define Finger_Tx D4
#define SCREEN_WIDTH 128 
#define SCREEN_HEIGHT 64 
#define OLED_RESET     0 
#define BUZZER_PIN D8

U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/U8X8_PIN_NONE, /* clock=*/D1, /* data=*/D2);
SoftwareSerial mySerial(Finger_Rx, Finger_Tx);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);      
const char *ssid = "subashthapa_fltng_2";
const char *password = "@subasht40@@";

String postData; 
String link = "http://192.168.1.70/biometricattendance/getdata.php"; 
int FingerID = 0;     
uint8_t id;


void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(115200);
  
  u8g2.begin();  // Initialize the display
  
  u8g2.clearBuffer();
  u8g2.sendBuffer();
  setIntro();
  delay(2000);  // Pause for 2 seconds
  connectToWiFi();
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
  Serial.print("Sensor contains "); Serial.print(finger.templateCount); Serial.println(" templates");
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
  displayMessageCenter("Tech BARSA", "Team");
  playSoundNotes();
}






void loop() {
  // Check if there's a connection to WiFi or not
  if (WiFi.status() != WL_CONNECTED) {
    playErrorSound();
    connectToWiFi();
  } else {
    playSuccessSound();
  }

  FingerID = getFingerprintID();
  delay(50);

  if (FingerID > 0) {
    displayMessageCenter("FingerPrint Status", "Valid");
    SendFingerprintID(FingerID);
    playSuccessSound();
  } else if (FingerID == 0) {
    displayMessageCenter("FingerPrint Status", "Scanning...");
  } else if (FingerID == -1) {
    displayMessageCenter("FingerPrint Status", "Invalid");
    playErrorSound();s
  } else if (FingerID == -2) {
    displayMessageCenter("FingerPrint Status", "Error");
  }

  delay(1000);  // Add a delay to give time to see the message

  ChecktoAddID();
  ChecktoDeleteID();
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

  displayMessageCenter("FingerPrint Status", "Place finger");
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_NOFINGER) {
      displayMessageCenter("FingerPrint Status", "Scanning...");
    }
  }

  p = finger.image2Tz(1);
  if (p == FINGERPRINT_OK) {
    displayMessageCenter("FingerPrint Status", "Image Converted");
  } else {
    return p;
  }

  displayMessageCenter("FingerPrint Status", "Remove finger");
  delay(2000);

  p = 0;
  while (p != FINGERPRINT_NOFINGER) {
    p = finger.getImage();
  }

  Serial.print("ID "); Serial.println(id);
  p = -1;

  displayMessageCenter("FingerPrint Status", "Place finger again");

  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_NOFINGER) {
      displayMessageCenter("FingerPrint Status", "Scanning...");
    }
  }

  p = finger.image2Tz(2);
  if (p == FINGERPRINT_OK) {
    displayMessageCenter("FingerPrint Status", "Image Converted");
  } else {
    return p;
  }

  p = finger.createModel();
  if (p == FINGERPRINT_OK) {
    displayMessageCenter("FingerPrint Status", "Prints matched!");
  } else {
    return p;
  }

  Serial.print("ID "); Serial.println(id);
  p = finger.storeModel(id);
  if (p == FINGERPRINT_OK) {
    playSuccessSound();
    displayMessageCenter("FingerPrint Status", "Stored!");
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
    displayMessageCenter("FingerPrint Status", ("Adding new ID: " + add_id).c_str());
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

void connectToWiFi() {
  WiFi.mode(WIFI_OFF); // Prevent reconnection issue (taking too long to connect)
  delay(1000);
  WiFi.mode(WIFI_STA);
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  // Display the first part of the message
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
    Serial.println("Connected");
    displayMessageCenter("WiFi (Connected)", ssid);
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP()); // IP address assigned to your ESP
  } else {
    Serial.println("Failed to connect to WiFi");
    displayMessageCenter("WiFi (Not Connected)", ssid);
    playErrorSound();
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
  int noteDuration = 500; // Duration of each note in milliseconds

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
