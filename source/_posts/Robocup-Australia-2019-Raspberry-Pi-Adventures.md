---
title: Robocup Australia 2019 - Raspberry Pi Adventures
date: 2018-11-01 18:38:10
#tags:
---

# Please Note This Post/Project is Incomplete And Will Be Updated Until I Finish The Project Around Mid 2019

I am embarking on the project of building a robot for the [Australian RoboCup Junior](https://www.robocupjunior.org.au/rescue) 2019 Open Rescue division. This is a project I have been interested in doing and playing around with over the last 2 years. I want to do it because of the problems I have encountered with the Mindstorms EV3 robotics platform. This blog post is going to be my documentation as I do the project. It will contain information about how the robot works and how I went about building it.

#### Handy Terminology:
A Tile is a square board which contains a challenge the robot must complete, these can be in different orders. They can be seen in the image [here](https://www.robocupjunior.org.au/sites/default/files/pictures/tn_14.jpg).
The Can is the object that must be "saved" from the chemical spill (A Green tile) because I am in the Open division I must pick up the can and put it on a block. It can be silver or black. Black cans do not award points for putting them on the block so they should be avoided to save time (although not a requirement).
The block is an orange block of wood that sits in the chemical spill. It is where the can must be put.

#### Cost/Parts:
...

## The Objectives Of The Robot
* Follow A Black Line And Be Able To Detect Color
* Drive-Up Hills
* Grab A Can And Be Able To Lift It Onto A Block
* Avoid Obstacles On The Course
* Drive Over Small Debris
* Be Quick To Program
* Have A Rigid Design
* Easy Battery Swapping

## The Minimum Required Hardware
* 2 Drive Motors
* 2 Claw Motors (Likely Servo's) - One For Lifting Up And Down And One Of Grabbing The Can
* 3 Color Sensors - 2 For Sensing The Line And Colors On The Tiles, 1 For Sensing The Color Of The Block or Can
* 1 Ultrasonic Sensor - Detect Object And The Can/Block

# The Software
Before I start building the robot I need to set up the software on the Raspberry Pi. I need to chose how I am going to program the robot and if there are any software problems I need to try and overcome while building the hardware of the robot.
### Operating System
I have decided on using [RealtimePi](https://github.com/guysoft/RealtimePi)...


### Programming Language
Currently, Go Lang But It Is Too Difficult So Probably Python Because Of The Easy Support For The Raspberry Pi Hardware.

Before I even start with the motors and sensors of the robot I need an easy way to program the robot. This need to be fast and easy because during a compete

### Operating Without Wireless
During the event, I must assume there is going to be no wireless connectivity (Bluetooth or WiFi) even though there may be. In past events I have been to the organisers have enacted a WiFi ban (because they needed it for scoring) and usually, the Bluetooth range is so full of robots that it causes the software crashes (The EV3 Platform). The solution to this with the Raspberry Pi is to use an Ethernet cable along with a USB to Ethernet adapter on my laptop.

# The Hardware
My plan for building the robot is to build a PCB (a hand soldered perfboard) that will contain all of the circuitry and a 3D Printed or CNC body. The PCB will contain required to handle the motor and sensors, This is a lot better than using a breadboard because connections could come loose and also it has a much neater look. The PCB will have headers/screw terminals on it which will allow the sensors/motors to be removed if needed and the PCB will contain all the components required to make the sensor/motor work so I will just need cables that directly connect the sensors/motors.

### Sensor Control
The logical first step for me was to try and get the hardware working because I begin designing a full robot chassis. The first sensor I started with was the Ultrasonic sensor, I chose to start here because from experience this was something I struggled with

### Motor Control



### Power?


### Robot Chassis
