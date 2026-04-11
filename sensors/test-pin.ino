const byte WSPEED = 3;
volatile unsigned long windClicks = 0;
volatile unsigned long lastWindIRQ = 0;

void wspeedIRQ() {
  if (millis() - lastWindIRQ > 10) {
    lastWindIRQ = millis();
    windClicks++;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(WSPEED, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(WSPEED), wspeedIRQ, FALLING);
}

void loop() {
  static unsigned long lastPrint = 0;

  if (millis() - lastPrint >= 1000) {
    lastPrint = millis();

    noInterrupts();
    unsigned long clicks = windClicks;
    windClicks = 0;
    interrupts();

    Serial.print("clicks_1s=");
    Serial.println(clicks);
  }
}
