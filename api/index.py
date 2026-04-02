import sys
import os

# Add root folder to sys.path for monorepo imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.server import app

# Vercel discovers the 'app' from src.server
