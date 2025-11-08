import os
from dotenv import load_dotenv

# Try to load .env from backend/gateway directory
env_path = os.path.join("backend", "gateway", ".env")
if os.path.exists(env_path):
    print(f"✅ Loading .env from {env_path}")
    load_dotenv(env_path)
else:
    print("⚠️  .env file not found, loading from current directory")
    load_dotenv()

# Check if OPENAI_API_KEY is loaded
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    print("✅ OPENAI_API_KEY loaded successfully")
    print(f"Key starts with: {api_key[:8]}..." if len(api_key) > 8 else "Key is too short")
else:
    print("⚠️  OPENAI_API_KEY not found in environment")
    print("Current working directory:", os.getcwd())
    print("Files in current directory:", os.listdir("."))
    
    # Check if .env file exists in backend/gateway
    env_path = os.path.join("backend", "gateway", ".env")
    if os.path.exists(env_path):
        print(f"✅ .env file found at {env_path}")
        with open(env_path, 'r') as f:
            content = f.read()
            print(f".env content: {content}")
    else:
        print(f"❌ .env file not found at {env_path}")