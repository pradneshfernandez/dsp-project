import os
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

logger = logging.getLogger(__name__)

# Preferred model stack for 2026
MODELS = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-pro"]
_current_model_index = 0

def get_llm(temperature: float = 0.2):
    """
    Returns the configured Gemini LLM. 
    Prioritizes the 2026 Gemini 2.5 Flash model.
    """
    global _current_model_index
    model_name = MODELS[_current_model_index]
    
    logger.info(f"Engaging 2026 Neural Engine | Model: {model_name}")
    
    return ChatGoogleGenerativeAI(
        model=model_name,
        temperature=temperature,
        google_api_key=GEMINI_API_KEY,
        max_retries=1
    )

def invoke_with_fallback(chain_func, input_data):
    """
    Executes a chain function with automatic model-level fallback (2.5 -> 1.5 -> Pro).
    """
    global _current_model_index
    
    for attempt in range(len(MODELS)):
        try:
            return chain_func(input_data)
        except Exception as e:
            err_msg = str(e).lower()
            if "not_found" in err_msg or "404" in err_msg or "supported" in err_msg:
                if _current_model_index < len(MODELS) - 1:
                    logger.warning(f"Model {MODELS[_current_model_index]} unavailable. Transitioning to branch {MODELS[_current_model_index+1]}...")
                    _current_model_index += 1
                    continue
            logger.error(f"Neural Engine Critical Error: {str(e)}")
            raise e
