#!/bin/bash
echo "Setting up Research-Grade TARA Framework environment..."

# Check Python version (requires 3.9+)
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
if [ "$(printf '%s\n' "3.9" "$python_version" | sort -V | head -n1)" != "3.9" ]; then
    echo "Error: Python 3.9 or higher is required. Found Python $python_version."
    exit 1
fi

if [ ! -d "tara_env" ]; then
    python3 -m venv tara_env
fi

source tara_env/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "Environment setup complete."
echo "Please copy .env.example to .env and add your OpenAI API Key."
echo "To run the app: source tara_env/bin/activate && streamlit run app.py"
