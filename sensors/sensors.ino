#include <Wire.h>
#include "SparkFunMPL3115A2.h"
#include "SparkFunHTU21D.h"

MPL3115A2 myPressure;
HTU21D myHumidity;

// Pines
const byte WSPEED = 3;
const byte RAIN = 2;
const byte STAT1 = 7;
const byte STAT2 = 8;

const byte REFERENCE_3V3 = A3;
const byte LIGHT = A1;
const byte BATT = A2;
const byte WDIR = A0;

// Tiempo
unsigned long lastSampleMs = 0;

// Contadores por interrupción
volatile unsigned long windClicks = 0;
volatile unsigned long lastWindIRQ = 0;

volatile unsigned long rainTipsWindow = 0;
volatile unsigned long totalRainTips = 0;
volatile unsigned long lastRainIRQ = 0;

// Variables leídas
float humidity = 0;
float tempf = 0;
float tempc = 0;
float pressure = 0;
float batt_lvl = 0;
float light_lvl = 0;
int winddir = 0;

// Constantes del sensor
const float WIND_MPH_PER_HZ = 1.492;   // clicks/s -> mph
const float MPH_TO_KPH = 1.60934;
const float RAIN_IN_PER_TIP = 0.011;
const float IN_TO_MM = 25.4;

// Interrupción lluvia
void rainIRQ() {
  unsigned long now = millis();
  if (now - lastRainIRQ > 10) {
    lastRainIRQ = now;
    rainTipsWindow++;
    totalRainTips++;
  }
}

// Interrupción viento
void wspeedIRQ() {
  unsigned long now = millis();
  if (now - lastWindIRQ > 10) {
    lastWindIRQ = now;
    windClicks++;
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(STAT1, OUTPUT);
  pinMode(STAT2, OUTPUT);

  pinMode(WSPEED, INPUT_PULLUP);
  pinMode(RAIN, INPUT_PULLUP);

  pinMode(REFERENCE_3V3, INPUT);
  pinMode(LIGHT, INPUT);
  pinMode(WDIR, INPUT);

  myPressure.begin();
  myPressure.setModeBarometer();
  myPressure.setOversampleRate(7);
  myPressure.enableEventFlags();

  myHumidity.begin();

  attachInterrupt(digitalPinToInterrupt(RAIN), rainIRQ, FALLING);
  attachInterrupt(digitalPinToInterrupt(WSPEED), wspeedIRQ, FALLING);

  lastSampleMs = millis();

  Serial.println("{\"status\":\"weather_shield_online\"}");
}

void loop() {
  if (millis() - lastSampleMs >= 1000) {
    digitalWrite(STAT1, HIGH);

    unsigned long now = millis();
    unsigned long elapsedMs = now - lastSampleMs;
    lastSampleMs = now;

    // Captura atómica
    noInterrupts();
    unsigned long clicks = windClicks;
    unsigned long rainTips = rainTipsWindow;
    unsigned long totalTips = totalRainTips;
    windClicks = 0;
    rainTipsWindow = 0;
    interrupts();

    readSensors();
    printWeatherJSON(clicks, rainTips, totalTips, elapsedMs);

    digitalWrite(STAT1, LOW);
  }

  delay(20);
}

void readSensors() {
  humidity = myHumidity.readHumidity();
  tempf = myPressure.readTempF();
  tempc = (tempf - 32.0) * 5.0 / 9.0;
  pressure = myPressure.readPressure();
  light_lvl = get_light_level();
  batt_lvl = get_battery_level();
  winddir = get_wind_direction();
}

float get_light_level() {
  float operatingVoltage = analogRead(REFERENCE_3V3);
  float lightSensor = analogRead(LIGHT);

  if (operatingVoltage <= 0) return -1;

  operatingVoltage = 3.3 / operatingVoltage;
  lightSensor = operatingVoltage * lightSensor;
  return lightSensor;
}

float get_battery_level() {
  float operatingVoltage = analogRead(REFERENCE_3V3);
  float rawVoltage = analogRead(BATT);

  if (operatingVoltage <= 0) return -1;

  operatingVoltage = 3.30 / operatingVoltage;
  rawVoltage = operatingVoltage * rawVoltage;
  rawVoltage *= 4.90;
  return rawVoltage;
}

int get_wind_direction() {
  unsigned int adc = analogRead(WDIR);

  if (adc < 380) return 113;
  if (adc < 393) return 68;
  if (adc < 414) return 90;
  if (adc < 456) return 158;
  if (adc < 508) return 135;
  if (adc < 551) return 203;
  if (adc < 615) return 180;
  if (adc < 680) return 23;
  if (adc < 746) return 45;
  if (adc < 801) return 248;
  if (adc < 833) return 225;
  if (adc < 878) return 338;
  if (adc < 913) return 0;
  if (adc < 940) return 293;
  if (adc < 967) return 315;
  if (adc < 990) return 270;

  return -1;
}

void printWeatherJSON(unsigned long clicks, unsigned long rainTips, unsigned long totalTips, unsigned long elapsedMs) {
  float elapsed_s = elapsedMs / 1000.0;

  // Velocidad del viento
  float clicks_per_sec = 0.0;
  float wind_mph = 0.0;
  float wind_kph = 0.0;

  if (elapsed_s > 0.0) {
    clicks_per_sec = clicks / elapsed_s;
    wind_mph = clicks_per_sec * WIND_MPH_PER_HZ;
    wind_kph = wind_mph * MPH_TO_KPH;
  }

  // Lluvia
  float rain_mm_window = rainTips * RAIN_IN_PER_TIP * IN_TO_MM;
  float rain_mm_h = 0.0;
  if (elapsed_s > 0.0) {
    rain_mm_h = rain_mm_window * (3600.0 / elapsed_s);
  }

  float total_rain_mm = totalTips * RAIN_IN_PER_TIP * IN_TO_MM;

  int winddir_adc = analogRead(WDIR);

  Serial.print("{");
  Serial.print("\"winddir_deg\":"); Serial.print(winddir); Serial.print(",");
  Serial.print("\"winddir_adc\":"); Serial.print(winddir_adc); Serial.print(",");
  Serial.print("\"wind_clicks\":"); Serial.print(clicks); Serial.print(",");
  Serial.print("\"wind_kph\":"); Serial.print(wind_kph, 3); Serial.print(",");
  Serial.print("\"sample_ms\":"); Serial.print(elapsedMs); Serial.print(",");
  Serial.print("\"rain_tips\":"); Serial.print(rainTips); Serial.print(",");
  Serial.print("\"rain_mm_h\":"); Serial.print(rain_mm_h, 3); Serial.print(",");
  Serial.print("\"rain_total_mm\":"); Serial.print(total_rain_mm, 3); Serial.print(",");
  Serial.print("\"humidity_rh\":"); Serial.print(humidity, 2); Serial.print(",");
  Serial.print("\"temp_c\":"); Serial.print(tempc, 2); Serial.print(",");
  Serial.print("\"pressure_pa\":"); Serial.print(pressure, 2); Serial.print(",");
  Serial.print("\"battery_v\":"); Serial.print(batt_lvl, 2); Serial.print(",");
  Serial.print("\"light_v\":"); Serial.print(light_lvl, 2); Serial.print(",");
  Serial.print("\"millis\":"); Serial.print(millis());
  Serial.println("}");
}
