#include "leds.h"

#define LEDS_AMOUNT    16
#define LEDS_GLOW_TIME 1000

int recVal = -1;
String val = "";
Led* ledsArray[LEDS_AMOUNT];
char* ledsCharArray[LEDS_AMOUNT];
unsigned long prevTime = millis();

void setup() 
{
  Serial.begin(9600);

  // LED pins start at 2 and end at 13
  for (int i = 0, j = 2; i < LEDS_AMOUNT; i++) {
    Serial.print("i: ");
    Serial.println(i);
    Serial.print("pin: ");
    Serial.println(j);
    
    ledsArray[i] = new Led(j);
    j++;
  }
}

void loop() 
{ 
  while (Serial.available()) {
    // need a delay or else characters will get split before they can be added
    delay(5);
    
    char c = Serial.read();
    val += c;
  }

  // don't do anything with an empty string
  // it will turn into a 0, which is the first pin, and turn it on
  if (val != "") {
    recVal = val.toInt();
    val = ""; 
  }

  // turn on LED
  if (recVal >= 0 && recVal < LEDS_AMOUNT ) {
    Led* l = ledsArray[recVal];

    l->turnOn();
  }

  for (int i = 0; i < LEDS_AMOUNT; i++) {  
    Led* l = ledsArray[i];
    
    if (!l->_isOn)
      continue;
        
    unsigned long curTime = millis();
    unsigned long diff = curTime - l->_timer;

    // set glow strength
    if (l->getPin() > 13) {
      l->setGlowStr(255);

      // turn off LED after some time
      if (diff > LEDS_GLOW_TIME) {
        l->turnOff();
      }
    } else {
      if (curTime - l->_glowPrevTime > 10) {
        int str;
          
        if (!l->_hasReachedMaxGlow) {
          str = l->_glowStr + 5;
          
          if (str >= 255) {
            str = 255;
            l->_hasReachedMaxGlow = true;
          }
        } else {
          str = l->_glowStr - 5;
          
          if (str < 0) {
            str = 0;
            l->turnOff();
          }
        }

        l->setGlowStr(str);
        l->_glowPrevTime = curTime;
      }
    }
  } 

  // reset
  recVal = -1;
}

