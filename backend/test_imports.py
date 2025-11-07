try:
    import audio_model
    print("Audio model OK")
except Exception as e:
    print("Audio model error:", str(e))

try:
    import text_model
    print("Text model OK")
except Exception as e:
    print("Text model error:", str(e))

try:
    import face_model
    print("Face model OK")
except Exception as e:
    print("Face model error:", str(e))