import os
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
load_dotenv()

keys_str = os.getenv("GEMINI_API_KEYS", os.getenv("GEMINI_API_KEY", ""))
GEMINI_API_KEYS = [k.strip() for k in keys_str.split(",") if k.strip()]

logger = logging.getLogger(__name__)

# Preferred model stack for 2026-Ready Production (Gemini 2.5 Flagship)
MODELS = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"]
_current_model_index = 0
_key_index = 0

def get_llm(temperature: float = 0.2):
    """
    Returns the configured Gemini LLM. 
    Prioritizes the 2026 Gemini 2.5 Flash model and uses round-robin API key rotation 
    with native LangChain fallbacks to avoid rate limits (429).
    """
    global _current_model_index, _key_index
    model_name = MODELS[_current_model_index]
    
    logger.info(f"Engaging 2026 Neural Engine | Model: {model_name}")
    
    if not GEMINI_API_KEYS:
        return ChatGoogleGenerativeAI(model=model_name, temperature=temperature, max_retries=1)

    # Shift keys array to start sequentially at the current round-robin index
    shifted_keys = GEMINI_API_KEYS[_key_index:] + GEMINI_API_KEYS[:_key_index]
    _key_index = (_key_index + 1) % len(GEMINI_API_KEYS)
    
    llms = [
        ChatGoogleGenerativeAI(
            model=model_name,
            temperature=temperature,
            google_api_key=key,
            max_retries=1
        )
        for key in shifted_keys
    ]
    
    if len(llms) > 1:
        return llms[0].with_fallbacks(llms[1:])
    return llms[0]

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
