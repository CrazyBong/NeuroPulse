import requests
import json
import time

BASE_URL = "http://127.0.0.1:5000"


def print_response(resp):
    print("\nStatus:", resp.status_code)
    try:
        print(json.dumps(resp.json(), indent=4))
    except:
        print(resp.text)
    print("\n" + "-"*60)


# ✅ 1. Test /api/health
def test_health():
    print("Testing /api/health ...")
    resp = requests.get(f"{BASE_URL}/api/health")
    print_response(resp)


# ✅ 2. Test /api/emotions
def test_emotions():
    print("Testing /api/emotions ...")
    resp = requests.get(f"{BASE_URL}/api/emotions")
    print_response(resp)


# ✅ 3. Test /api/upload-and-predict (send a WAV file)
def test_upload_and_predict(audio_path="test.wav"):
    print("Testing /api/upload-and-predict ...")
    
    try:
        with open(audio_path, "rb") as f:
            files = {"audio": (audio_path, f, "audio/wav")}
            resp = requests.post(f"{BASE_URL}/api/upload-and-predict", files=files)
            print_response(resp)
    except FileNotFoundError:
        print("⚠ test.wav not found! Place a WAV file in the same folder.")


# ✅ 4. Test /api/predict-from-data
def test_predict_from_data(audio_path="test.wav"):
    print("Testing /api/predict-from-data ...")

    try:
        with open(audio_path, "rb") as f:
            files = {"audio": (audio_path, f, "audio/wav")}
            resp = requests.post(f"{BASE_URL}/api/predict-from-data", files=files)
            print_response(resp)
    except FileNotFoundError:
        print("⚠ test.wav not found! Place a WAV file in the same folder.")


# ✅ 5. Test mic record API (backend records audio)
def test_record_and_predict(duration=3):
    print(f"Testing /api/record-and-predict ({duration}s record)...")
    payload = {"duration": duration}
    resp = requests.post(f"{BASE_URL}/api/record-and-predict", json=payload)
    print_response(resp)


# ✅ 6. Test available audio devices
def test_devices():
    print("Testing /api/available-devices ...")
    resp = requests.get(f"{BASE_URL}/api/available-devices")
    print_response(resp)


if __name__ == "__main__":
    print("===== AUDIO API TEST SCRIPT =====")

    test_health()
    test_emotions()
    test_devices()

    # Test with existing audio file
    test_upload_and_predict("test.wav")
    test_predict_from_data("test.wav")

    # Backend mic-record test
    test_record_and_predict(3)
