#!/usr/bin/python

from Emakefun_MotorHAT import Emakefun_MotorHAT, Emakefun_Servo
import time
mh = Emakefun_MotorHAT(addr=0x60)

myServo = mh.getServo(1)

# Set servo angle (0-180 degrees) - servo will move to specified angles with 2-second gaps
speed = 9  # Speed of movement (1-10, higher is faster)

angles = [0, 15, 30, 45, 90, 120, 150, 180]
for angle in angles:
    myServo.writeServoWithSpeed(angle, speed)
    print(f"Servo moved to {angle} degrees")
    time.sleep(2)

print("Servo sequence completed")
