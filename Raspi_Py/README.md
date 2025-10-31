# Flask Motor Control Server

This Flask application controls all DC motors on the Raspberry Pi for the CocoKnockKnock robot.

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the server:
   ```
   python app.py
   ```

The server will start on `http://0.0.0.0:5000`.

## Endpoints

- `POST /up`: Start moving up
- `POST /down`: Start moving down
- `POST /stop`: Stop the motor
- `GET /status`: Get server status

## Integration with Mobile App

The mobile app in `screens/ControlScreen.js` calls these endpoints when the up/down buttons are pressed. Ensure the Raspberry Pi's IP is accessible from the mobile device, and update the URL in the mobile app if necessary (currently set to `192.168.1.118:5000`).

## Notes

- The motor control uses the Emakefun_MotorHAT library and controls all 4 motors simultaneously.
- Speed range: UI 10-100% maps to motor 10-255 (10% = motor 10, 100% = motor 255).
- Directions: /up uses BACKWARD, /down uses FORWARD (swapped if needed).
- If motors don't move, check wiring and try reversing directions.
- For production, consider adding authentication or CORS handling.
