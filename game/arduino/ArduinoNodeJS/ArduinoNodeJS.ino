// LED vars 
const int ledPin = 13;

// LED read vars
String inputString = "";

void setup() {
  // initialize serial:
  Serial.begin(9600);
  
  // init LEDS
  pinMode(ledPin,OUTPUT);
  digitalWrite(ledPin, LOW);

  Serial.print("a");
}

void loop() {
  // Recieve data from Node and write it to a String
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    inputString += inChar;
  }
  
  // Toggle LEDs
  if(!Serial.available()) {
    // convert String to int. 
    int recievedVal = stringToInt();

    Serial.print(recievedVal);
  
    if(recievedVal > 0) {
      digitalWrite(recievedVal, HIGH);
      Serial.print("fefef");
    }
  }
 
  delay(50);
}

int stringToInt()
{
    char charHolder[inputString.length()+1];
    inputString.toCharArray(charHolder,inputString.length()+1);
    inputString = "";
    int _recievedVal = atoi(charHolder);
    return _recievedVal;
}
