# Target of Evaluation: Automotive Central Gateway System

## 1. System Assets
* **Asset_01: Telematics Control Unit (TCU)** * *Description:* Handles 5G/Cellular connectivity and GPS.
    * *Interfaces:* Cellular Air Interface, Internal CAN Bus.
* **Asset_02: Central Gateway (CGW)**
    * *Description:* The firewall between external networks and vehicle control networks.
    * *Interfaces:* Ethernet (DoIP), CAN-FD, OBD-II Port.
* **Asset_03: Engine Control Module (ECM)**
    * *Description:* Controls fuel injection and torque.
    * *Interfaces:* Powertrain CAN Bus.

## 2. Communication Channels
* **Channel_A (External):** Cellular Link (TCU <-> Cloud Server).
* **Channel_B (Internal):** CAN-FD Bus (TCU <-> CGW).
* **Channel_C (Critical):** Powertrain CAN (CGW <-> ECM).

## 3. Data Objects
* **Data_01:** OTA (Over-the-Air) Firmware Updates.
* **Data_02:** Remote Unlock Commands (from Mobile App).
* **Data_03:** Real-time Engine Diagnostic Data.