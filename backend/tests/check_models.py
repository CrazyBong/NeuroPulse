"""
Check if all models can be imported and loaded
"""

import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def test_audio_model_import():
    """Test if audio model can be imported"""
    try:
        print("Testing audio model import...")
        import audio_model
        print("✅ Audio model imported successfully")
        return True
    except Exception as e:
        print(f"❌ Audio model import failed: {e}")
        return False

def test_text_model_import():
    """Test if text model can be imported"""
    try:
        print("Testing text model import...")
        import text_model
        print("✅ Text model imported successfully")
        return True
    except Exception as e:
        print(f"❌ Text model import failed: {e}")
        return False

def test_face_model_import():
    """Test if face model can be imported"""
    try:
        print("Testing face model import...")
        import face_model
        print("✅ Face model imported successfully")
        return True
    except Exception as e:
        print(f"❌ Face model import failed: {e}")
        return False

def main():
    print("🔍 Checking model imports...\n")
    
    results = []
    results.append(test_audio_model_import())
    print()
    results.append(test_text_model_import())
    print()
    results.append(test_face_model_import())
    
    print("\n" + "="*50)
    if all(results):
        print("🎉 All models can be imported successfully!")
        print("You can now run the backend services.")
    else:
        print("⚠️  Some models failed to import.")
        print("Check the error messages above for details.")
    print("="*50)

if __name__ == "__main__":
    main()