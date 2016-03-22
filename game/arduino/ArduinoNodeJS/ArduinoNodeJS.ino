#include "leds.h"

int recVal = -1;
String val = "";
const int LEDS_AMOUNT = 13;
Led* ledsArray[LEDS_AMOUNT];

void setup() 
{
  Serial.begin(9600);

  // LED pins start at 2 and end at 13
  for (int i = 0, j = 2; i <= 12; i++) {
    ledsArray[i] = new Led(j);
    j++;
  }
}

void loop() 
{ 
  while (Serial.available()) {
    // need a delay or else characters will get split before they can be added
    delay(10);
    
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
  if (recVal >= 0 && recVal <= 13) {
    Led* l = ledsArray[recVal];

    l->turnOn();
  }

  for (int i = 0; i <= LEDS_AMOUNT; i++) {  
    Led* l = ledsArray[i];
    
    if (!l->_isOn)
      continue;
        
    unsigned long curTime = millis();
    unsigned long diff = curTime - l->_timer;
    
    // turn off LED after some time
    if (diff > 2000) {
      l->turnOff();
    }
  } 

  // reset
  recVal = -1;
}

