# OTA Update System Architecture
- **ECU_01 (Telematics Unit)**: Connects to the primary 5G cellular network to receive encrypted OTA packages.
- **ECU_02 (Central Gateway)**: Validates digital signatures of the OTA firmware packages and safely routes them to target ECUs during vehicle stationary states.
- **Bus_A (CAN-FD)**: High-speed internal bus connecting the Gateway to the Powertrain and Infotainment systems.
- **Data_A (OTA Firmware Image)**: The binary payload intended to flash ECU_03, signed by the OEM.
