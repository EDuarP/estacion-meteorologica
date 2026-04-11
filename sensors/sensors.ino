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

// Variables globales
long lastSecond;
byte seconds;
byte seconds_2m;
byte minutes;
byte minutes_10m;

long lastWindCheck = 0;
volatile long lastWindIRQ = 0;
volatile byte windClicks = 0;

byte windspdavg[120];

#define WIND_DIR_AVG_SIZE 120
int winddiravg[WIND_DIR_AVG_SIZE];
float windgust_10m[10];
int windgustdirection_10m[10];
volatile float rainHour[60];

// Variables meteorológicas
int winddir = 0;
float windspeedmph = 0;
float windgustmph = 0;
int windgustdir = 0;
float windspdmph_avg2m = 0;
int winddir_avg2m = 0;
float windgustmph_10m = 0;
int windgustdir_10m = 0;
float humidity = 0;
float tempf = 0;
float tempc = 0;
float rainin = 0;
volatile float dailyrainin = 0;
float pressure = 0;
float batt_lvl = 11.8;
float light_lvl = 455;

// Lluvia
volatile unsigned long raintime, rainlast, raininterval, rain;

// Interrupción lluvia
void rainIRQ()
{
  raintime = millis();
  raininterval = raintime - rainlast;

  if (raininterval > 10)
  {
    dailyrainin += 0.011;   // pulgadas por tip
    rainHour[minutes] += 0.011;
    rainlast = raintime;
  }
}

// Interrupción viento
void wspeedIRQ()
{
  if (millis() - lastWindIRQ > 10)
  {
    lastWindIRQ = millis();
    windClicks++;
  }
}

void setup()
{
  Serial.begin(115200);

  pinMode(STAT1, OUTPUT);
  pinMode(STAT2, OUTPUT);

  pinMode(WSPEED, INPUT_PULLUP);
  pinMode(RAIN, INPUT_PULLUP);

  pinMode(REFERENCE_3V3, INPUT);
  pinMode(LIGHT, INPUT);

  myPressure.begin();
  myPressure.setModeBarometer();
  myPressure.setOversampleRate(7);
  myPressure.enableEventFlags();

  myHumidity.begin();

  seconds = 0;
  seconds_2m = 0;
  minutes = 0;
  minutes_10m = 0;
  lastSecond = millis();
  lastWindCheck = millis();

  attachInterrupt(digitalPinToInterrupt(RAIN), rainIRQ, FALLING);
  attachInterrupt(digitalPinToInterrupt(WSPEED), wspeedIRQ, FALLING);

  interrupts();

  Serial.println("{\"status\":\"weather_shield_online\"}");
}

void loop()
{
  if (millis() - lastSecond >= 1000)
  {
    digitalWrite(STAT1, HIGH);
    lastSecond += 1000;

    if (++seconds_2m > 119) seconds_2m = 0;

    float currentSpeed = get_wind_speed();
    windspeedmph = currentSpeed;

    int currentDirection = get_wind_direction();
    windspdavg[seconds_2m] = (int)currentSpeed;
    winddiravg[seconds_2m] = currentDirection;

    if (currentSpeed > windgust_10m[minutes_10m])
    {
      windgust_10m[minutes_10m] = currentSpeed;
      windgustdirection_10m[minutes_10m] = currentDirection;
    }

    if (currentSpeed > windgustmph)
    {
      windgustmph = currentSpeed;
      windgustdir = currentDirection;
    }

    if (++seconds > 59)
    {
      seconds = 0;

      if (++minutes > 59) minutes = 0;
      if (++minutes_10m > 9) minutes_10m = 0;

      rainHour[minutes] = 0;
      windgust_10m[minutes_10m] = 0;
    }

    printWeatherJSON();

    digitalWrite(STAT1, LOW);
  }

  delay(50);
}

void calcWeather()
{
  winddir = get_wind_direction();

  float temp = 0;
  for (int i = 0; i < 120; i++)
    temp += windspdavg[i];
  temp /= 120.0;
  windspdmph_avg2m = temp;

  long sum = winddiravg[0];
  int D = winddiravg[0];
  for (int i = 1; i < WIND_DIR_AVG_SIZE; i++)
  {
    int delta = winddiravg[i] - D;

    if (delta < -180) D += delta + 360;
    else if (delta > 180) D += delta - 360;
    else D += delta;

    sum += D;
  }

  winddir_avg2m = sum / WIND_DIR_AVG_SIZE;
  if (winddir_avg2m >= 360) winddir_avg2m -= 360;
  if (winddir_avg2m < 0) winddir_avg2m += 360;

  windgustmph_10m = 0;
  windgustdir_10m = 0;
  for (int i = 0; i < 10; i++)
  {
    if (windgust_10m[i] > windgustmph_10m)
    {
      windgustmph_10m = windgust_10m[i];
      windgustdir_10m = windgustdirection_10m[i];
    }
  }

  humidity = myHumidity.readHumidity();
  tempf = myPressure.readTempF();
  tempc = (tempf - 32.0) * 5.0 / 9.0;

  rainin = 0;
  for (int i = 0; i < 60; i++)
    rainin += rainHour[i];

  pressure = myPressure.readPressure();

  light_lvl = get_light_level();
  batt_lvl = get_battery_level();
}

float get_light_level()
{
  float operatingVoltage = analogRead(REFERENCE_3V3);
  float lightSensor = analogRead(LIGHT);

  operatingVoltage = 3.3 / operatingVoltage;
  lightSensor = operatingVoltage * lightSensor;

  return lightSensor;
}

float get_battery_level()
{
  float operatingVoltage = analogRead(REFERENCE_3V3);
  float rawVoltage = analogRead(BATT);

  operatingVoltage = 3.30 / operatingVoltage;
  rawVoltage = operatingVoltage * rawVoltage;
  rawVoltage *= 4.90;

  return rawVoltage;
}

float get_wind_speed()
{
  float deltaTime = millis() - lastWindCheck;
  deltaTime /= 1000.0;

  float windSpeed = (float)windClicks / deltaTime;

  windClicks = 0;
  lastWindCheck = millis();

  windSpeed *= 1.492; // mph

  return windSpeed;
}

int get_wind_direction()
{
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

void printWeatherJSON()
{
  calcWeather();

  float windspeed_kph = windspeedmph * 1.60934;
  float windavg_kph = windspdmph_avg2m * 1.60934;
  float windgust_kph = windgustmph * 1.60934;
  float windgust10m_kph = windgustmph_10m * 1.60934;
  float rain_mm_1h = rainin * 25.4;
  float rain_mm_day = dailyrainin * 25.4;

  Serial.print("{");
  Serial.print("\"winddir_deg\":"); Serial.print(winddir); Serial.print(",");
  Serial.print("\"windspeed_kph\":"); Serial.print(windspeed_kph, 2); Serial.print(",");
  Serial.print("\"windgust_kph\":"); Serial.print(windgust_kph, 2); Serial.print(",");
  Serial.print("\"windgustdir_deg\":"); Serial.print(windgustdir); Serial.print(",");
  Serial.print("\"windavg2m_kph\":"); Serial.print(windavg_kph, 2); Serial.print(",");
  Serial.print("\"winddir_avg2m_deg\":"); Serial.print(winddir_avg2m); Serial.print(",");
  Serial.print("\"windgust10m_kph\":"); Serial.print(windgust10m_kph, 2); Serial.print(",");
  Serial.print("\"windgustdir10m_deg\":"); Serial.print(windgustdir_10m); Serial.print(",");
  Serial.print("\"humidity_rh\":"); Serial.print(humidity, 2); Serial.print(",");
  Serial.print("\"temp_c\":"); Serial.print(tempc, 2); Serial.print(",");
  Serial.print("\"rain_in_1h\":"); Serial.print(rainin, 3); Serial.print(",");
  Serial.print("\"rain_mm_1h\":"); Serial.print(rain_mm_1h, 2); Serial.print(",");
  Serial.print("\"pressure_pa\":"); Serial.print(pressure, 2); Serial.print(",");
  Serial.print("\"battery_v\":"); Serial.print(batt_lvl, 2); Serial.print(",");
  Serial.print("\"light_v\":"); Serial.print(light_lvl, 2); Serial.print(",");
  Serial.print("\"millis\":"); Serial.print(millis());
  Serial.println("}");
}
