#ifndef leds_h
#define leds_h

#include "Arduino.h"

class Led
{
  public:
    Led(int pin);
    void turnOn();
    void turnOff();
    int _pin;
    bool _isOn;
    unsigned long _timer;
};

Led::Led(int pin)
{
  pinMode(pin, OUTPUT);
  digitalWrite(pin, LOW);
  
  _pin = pin;
  _isOn = false;
  _timer = millis();
}

void Led::turnOn() {
  digitalWrite(_pin, HIGH);
  _timer = millis();
  _isOn = true;
}

void Led::turnOff() {
  digitalWrite(_pin, LOW);
  _isOn = false;
}

#endif
