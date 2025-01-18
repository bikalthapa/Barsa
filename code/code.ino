#include <Wire.h>
#include <U8g2lib.h>

// Initialize the OLED display (SSD1306, 128x64 resolution)
U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/U8X8_PIN_NONE, /* clock=*/D1, /* data=*/D2);

void setup() {
  u8g2.begin();  // Initialize the display
}
void displayMessage(const char* message) {
  u8g2.clearBuffer();          // Clear the screen buffer
  u8g2.setFont(u8g2_font_ncenB08_tr);  // Set the font
  u8g2.drawStr(0, 10, message);  // Draw the message at a specified position
  u8g2.sendBuffer();            // Push the buffer to the screen
}

void loop() {
  for(int i = 0; i<=10; i++){
    displayMessage("Count "+i);
    delay(1000);
  }
  delay(1000);
}
