import sys
import os

# Add root to path so src.server can be found
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from src.server import app
    print("✅ Neural Engine Loaded Successfully.")
except Exception as e:
    print(f"❌ CRITICAL FATAL LOAD ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    raise e

# Vercel expects 'app' to be available at the module level
