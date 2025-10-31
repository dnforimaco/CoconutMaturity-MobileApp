from flask import Flask, jsonify, request
from Emakefun_MotorHAT import Emakefun_MotorHAT, Emakefun_DCMotor, Emakefun_Servo
import time
import atexit
import threading
import os
import numpy as np
import librosa
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import Layer
import tensorflow.keras.backend as K
import sounddevice as sd
import soundfile as sf

def find_microphone_device():
    devices = sd.query_devices()
    for i, device in enumerate(devices):
        if device['max_input_channels'] > 0 and 'USB' in device['name'] and 'Microphone' in device['name']:
            return i
    return None

app = Flask(__name__)

# Initialize motor HAT
mh = Emakefun_MotorHAT(addr=0x60)

# Get motors for vertical movement
motors = [mh.getMotor(i) for i in range(1, 4)]
# Get base motor for rotation
base_motor = mh.getMotor(4)

# Get servos
base_servo = mh.getServo(1)  # Base Rotation
arm_servo = mh.getServo(2)   # Arm Rotation
top_servo = mh.getServo(3)   # Top Rotation
tap_servo = mh.getServo(4)   # Auto Tap
platform_servo = mh.getServo(5)  # Platform Rotation (Motor 5)

# Set default speed
MOTOR_SPEED = 150

# Auto tap state
auto_tap_active = False
tap_thread = None

# Recording state
recording_active = False
recording_thread = None
recorded_files = []
SAMPLING_RATE = 44100
RECORD_DURATION = 5  # seconds per recording
MODEL_PATH = 'ConvLSTM.h5'

# --- Custom Attention Layer ---
class Attention(Layer):
    def __init__(self, **kwargs):
        super(Attention, self).__init__(**kwargs)

    def build(self, input_shape):
        self.W = self.add_weight(shape=(input_shape[-1], 1),
                                 initializer='glorot_uniform',
                                 trainable=True, name='W')
        super(Attention, self).build(input_shape)

    def call(self, inputs):
        score = K.dot(inputs, self.W)
        alpha = K.softmax(K.squeeze(score, axis=-1))
        alpha_repeated = K.expand_dims(alpha)
        weighted_input = inputs * alpha_repeated
        context_vector = K.sum(weighted_input, axis=1)
        return context_vector

    def get_config(self):
        return super(Attention, self).get_config()

# --- Processing Functions ---
def load_and_preprocess_taps(file_list, sr):
    min_len = 44100
    signals = []
    for f in file_list:
        if not os.path.exists(f):
            return None
        y, s_r = librosa.load(f, sr=sr)
        if len(y) > min_len:
            y = y[:min_len]
        elif len(y) < min_len:
            pad_width = min_len - len(y)
            y = np.pad(y, (0, pad_width), mode='constant')
        signals.append(y.astype(np.float32))
    if not signals:
        return None
    combined_signal = np.sum(signals, axis=0)
    normalized_combined_signal = librosa.util.normalize(combined_signal)
    return normalized_combined_signal

def extract_and_format_features(signal, n_mfcc, max_len, sr):
    mfccs = librosa.feature.mfcc(y=signal, sr=sr, n_mfcc=n_mfcc)
    if mfccs.shape[1] > max_len:
        mfccs = mfccs[:, :max_len]
    elif mfccs.shape[1] < max_len:
        pad_width = max_len - mfccs.shape[1]
        mfccs = np.pad(mfccs, pad_width=((0, 0), (0, pad_width)), mode='constant')
    mfccs_transposed = mfccs.T
    X_final = np.expand_dims(mfccs_transposed, axis=0)
    return X_final

def predict_maturity(X_final):
    try:
        if not os.path.exists(MODEL_PATH):
            return None, f"Model file not found at {MODEL_PATH}"
        model = load_model(MODEL_PATH, custom_objects={'Attention': Attention})
        probabilities = model.predict(X_final)
        if probabilities is None or len(probabilities) == 0:
            return None, "Model prediction returned no results"
        predicted_index = np.argmax(probabilities[0])
        TARGET_NAMES = {0: 'Premature', 1: 'Mature', 2: 'Overmature'}
        predicted_label = TARGET_NAMES.get(predicted_index, "Unknown")
        confidence = probabilities[0][predicted_index] * 100
        return predicted_label, confidence
    except Exception as e:
        return None, f"Error in model prediction: {str(e)}"

@app.route('/speed/<int:speed>', methods=['POST'])
def set_speed(speed):
    global MOTOR_SPEED
    try:
        if 10 <= speed <= 255:
            MOTOR_SPEED = speed
            return jsonify({'status': 'success', 'speed': MOTOR_SPEED}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Speed must be between 10 and 255'}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

def turnOffMotors():
    for motor in motors:
        motor.run(Emakefun_MotorHAT.RELEASE)

def turnOffServos():
    global auto_tap_active
    auto_tap_active = False
    # Optionally set servos to a safe position
    base_servo.writeServo(180)
    arm_servo.writeServo(90)
    top_servo.writeServo(90)
    tap_servo.writeServo(90)
    platform_servo.writeServo(90)

atexit.register(turnOffMotors)
atexit.register(turnOffServos)

@app.route('/up', methods=['POST'])
def move_up():
    try:
        for motor in motors:
            motor.setSpeed(MOTOR_SPEED)
            motor.run(Emakefun_MotorHAT.BACKWARD)  # Assuming BACKWARD moves up
        return jsonify({'status': 'success', 'action': 'move_up'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/down', methods=['POST'])
def move_down():
    try:
        for motor in motors:
            motor.setSpeed(MOTOR_SPEED)
            motor.run(Emakefun_MotorHAT.FORWARD)  # Assuming FORWARD moves down
        return jsonify({'status': 'success', 'action': 'move_down'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/stop', methods=['POST'])
def stop_motor():
    try:
        for motor in motors:
            motor.run(Emakefun_MotorHAT.RELEASE)
        return jsonify({'status': 'success', 'action': 'stop'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/status', methods=['GET'])
def get_status():
    return jsonify({'status': 'running', 'motor_speed': MOTOR_SPEED}), 200

@app.route('/base_rotation/<int:angle>', methods=['POST'])
def set_base_rotation(angle):
    try:
        if 1 <= angle <= 360:
            base_servo.writeServo(angle)
            return jsonify({'status': 'success', 'base_rotation': angle}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Angle must be between 1 and 360'}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/arm_rotation/<int:angle>', methods=['POST'])
def set_arm_rotation(angle):
    try:
        if 0 <= angle <= 180:
            arm_servo.writeServo(angle)
            top_servo.writeServo(180 - angle)  # Opposite direction
            return jsonify({'status': 'success', 'arm_rotation': angle, 'top_rotation': 180 - angle}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Angle must be between 0 and 180'}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/top_rotation/<int:angle>', methods=['POST'])
def set_top_rotation(angle):
    try:
        if 0 <= angle <= 180:
            top_servo.writeServo(angle)
            arm_servo.writeServo(180 - angle)  # Opposite direction
            return jsonify({'status': 'success', 'top_rotation': angle, 'arm_rotation': 180 - angle}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Angle must be between 0 and 180'}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/platform_rotation/<int:angle>', methods=['POST'])
def set_platform_rotation(angle):
    try:
        if 0 <= angle <= 180:
            platform_servo.writeServo(angle)
            return jsonify({'status': 'success', 'platform_rotation': angle}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Angle must be between 0 and 180'}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/auto_tap/<state>', methods=['POST'])
def toggle_auto_tap(state):
    global auto_tap_active, tap_thread
    try:
        if state == 'on':
            if not auto_tap_active:
                auto_tap_active = True
                tap_thread = threading.Thread(target=auto_tap_function)
                tap_thread.start()
                return jsonify({'status': 'success', 'auto_tap': 'on'}), 200
            else:
                return jsonify({'status': 'info', 'message': 'Auto tap already active'}), 200
        elif state == 'off':
            auto_tap_active = False
            if tap_thread:
                tap_thread.join(timeout=1)
            return jsonify({'status': 'success', 'auto_tap': 'off'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'State must be "on" or "off"'}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

def auto_tap_function():
    while auto_tap_active:
        tap_servo.writeServo(30)
        time.sleep(0.6)
        tap_servo.writeServo(180)
        time.sleep(0.6)

def record_audio(filename, duration, sr):
    device = find_microphone_device()
    if device is None:
        print("No USB microphone found. Using default device.")
        device = sd.default.device[0]  # Default input device
    try:
        recording = sd.rec(int(duration * sr), samplerate=sr, channels=1, device=device)
        sd.wait()
        sf.write(filename, recording, sr)
        return True
    except Exception as e:
        print(f"Recording error: {e}")
        return False

def recording_sequence():
    global recording_active, recorded_files
    recorded_files = []
    for i in range(3):
        filename = f'temp_recording_{i+1}.wav'
        recorded_files.append(filename)
        if not record_audio(filename, RECORD_DURATION, SAMPLING_RATE):
            recording_active = False
            return
        if i < 2:
            time.sleep(2.5)  # Pause between recordings
    recording_active = False

@app.route('/start_recording', methods=['POST'])
def start_recording():
    global recording_active, recording_thread
    if recording_active:
        return jsonify({'status': 'error', 'message': 'Recording already in progress'}), 400
    recording_active = True
    recording_thread = threading.Thread(target=recording_sequence)
    recording_thread.start()
    return jsonify({'status': 'success', 'message': 'Recording started'}), 200

@app.route('/list_devices', methods=['GET'])
def list_devices():
    devices = sd.query_devices()
    device_list = []
    for i, device in enumerate(devices):
        device_list.append({
            'index': i,
            'name': device['name'],
            'max_input_channels': device['max_input_channels'],
            'max_output_channels': device['max_output_channels']
        })
    return jsonify({'devices': device_list}), 200

@app.route('/analyze', methods=['POST'])
def analyze():
    global recorded_files
    try:
        if len(recorded_files) != 3:
            return jsonify({'status': 'error', 'message': 'Three recordings required'}), 400
        final_signal = load_and_preprocess_taps(recorded_files, SAMPLING_RATE)
        if final_signal is None:
            return jsonify({'status': 'error', 'message': 'Failed to process recordings'}), 500
        X_test_input = extract_and_format_features(final_signal, 40, 100, SAMPLING_RATE)
        result, confidence = predict_maturity(X_test_input)
        if result is None:
            return jsonify({'status': 'error', 'message': f'Prediction failed: {confidence}'}), 500
        # Clean up files
        for f in recorded_files:
            if os.path.exists(f):
                os.remove(f)
        recorded_files = []
        return jsonify({'status': 'success', 'classification': result, 'confidence': float(confidence)}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Analysis failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
