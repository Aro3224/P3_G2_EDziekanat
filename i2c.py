# SPDX-FileCopyrightText: Copyright (c) 2020 ladyada for Adafruit Industries
#
# SPDX-License-Identifier: MIT

import board
import digitalio
import adafruit_aw9523
import time

i2c = board.I2C()  # uses board.SCL and board.SDA
# i2c = board.STEMMA_I2C()  # For using the built-in STEMMA QT connector on a microcontroller
aw = adafruit_aw9523.AW9523(i2c)

button_pins = [aw.get_pin(i) for i in range(1, 4)]

for pin in button_pins:
    pin.direction = digitalio.Direction.INPUT

counter = 0
while True:
    for i, pin in enumerate(button_pins):
        if not pin.value:
            print(f"Przycisk {i+1} zostal nacisniety")
            counter=counter+1
            print(counter )
    time.sleep(0.2)
