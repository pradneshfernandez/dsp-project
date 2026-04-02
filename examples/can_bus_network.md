# In-Vehicle Local CAN Bus Network
- **ECU_Engine (ECM)**: Controls fuel injection, braking, and steering inputs. Connects to the primary Powertrain CAN.
- **ECU_Infotainment**: Manages center console display, Bluetooth pairings, and routing. Bridged to CAN via Gateway.
- **Bus_Powertrain (CAN-FD)**: Unencrypted, high-speed Control Area Network.
- **Data_Torque_Cmd**: Core speed and torque messages exchanged between the Advanced Driver Assistance System (ADAS) and the ECM without native authentication bounds.
