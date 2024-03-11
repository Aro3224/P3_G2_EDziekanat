import RPi.GPIO as GPIO
import time
import pyrebase
import datetime

GPIO.setmode(GPIO.BCM)

rows = [1, 12, 20]
columns = [2, 21]

config = {
  "apiKey": "bqegmh6YVP3xzSHN6Z9DTaPoEfuZkKF6fWxwMagd",
  "authDomain": "e-dziekanat-4e60f.firebaseapp.com",
  "databaseURL": "https://e-dziekanat-4e60f-default-rtdb.europe-west1.firebasedatabase.app",
  "storageBucket": "e-dziekanat-4e60f.appspot.com"
}

firebase = pyrebase.initialize_app(config)
db = firebase.database()

for row in rows:
    GPIO.setup(row, GPIO.OUT)
    GPIO.output(row, GPIO.HIGH)
for col in columns:
    GPIO.setup(col, GPIO.IN, pull_up_down=GPIO.PUD_UP)

try:
    while True:
        for i, row in enumerate(rows):
            GPIO.output(row, GPIO.LOW)
            for col in columns:
                if GPIO.input(col) == GPIO.LOW:
                    print(f"Button pressed: Row {i+1}, Column {columns.index(col)+1}")
                    date = str(datetime.datetime.now())
                    data = {
                            "Data": date,
                            "ID" : f"{i+1},{columns.index(col)+1}"
                              }
                    db.child("pressed_btns").set(data)

                    time.sleep(2)
            GPIO.output(row, GPIO.HIGH)

        time.sleep(0.1)

except KeyboardInterrupt:
    GPIO.cleanup()
