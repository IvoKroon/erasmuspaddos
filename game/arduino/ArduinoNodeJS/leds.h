#ifndef leds_h
#define leds_h

#include "Arduino.h"

class Led
{
  public:
    Led(int pin);
    void turnOn();
    void turnOff();
    void setGlowStr(int str);
    int getPin();
    bool _isOn;
    unsigned long _timer;
    int _glowStr;
    bool _hasReachedMaxGlow = false;
    unsigned long _glowPrevTime;

  private:
    int _pin;
};

Led::Led(int pin)
{
  pinMode(pin, OUTPUT);
  digitalWrite(pin, LOW);
  
  _pin = pin;
  _isOn = false;
  _timer = millis();
  _glowStr = 0;
}

int Led::getPin() {
  return _pin;
}

void Led::setGlowStr(int str) 
{
  _glowStr = str;
  analogWrite(_pin, _glowStr);
}

void Led::turnOn() 
{
  analogWrite(_pin, 1);
    
  _timer = millis();
  _hasReachedMaxGlow = false;
  _isOn = true;
}

void Led::turnOff() 
{
  analogWrite(_pin, 0);
  _glowStr = 0;
  _hasReachedMaxGlow = false;
  _isOn = false;
}

#endif
