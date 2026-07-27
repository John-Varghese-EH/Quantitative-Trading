# QuantAdv - Quantitative Trading Platform
# Copyright (C) 2026 John Varghese (J0X)

"""
Threat Intelligence API — Uses Gemini to provide Red Team summaries of adversarial attacks.
"""
import os
from fastapi import APIRouter, Depends, HTTPException, Body
from auth.dependencies import get_current_user
from utils.logger import logger
from google import genai

router = APIRouter()

@router.post("/analyze")
def analyze_attack(
    attack_data: dict = Body(..., example={
        "attack_type": "C&W",
        "model_type": "Random Forest",
        "parameters": {"c": 0.0001, "steps": 10},
        "success": True,
        "confidence_drop": 0.45
    }),
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a Red Team threat intelligence summary of an adversarial attack.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured for Threat Intelligence.")

    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an expert Red Team cybersecurity analyst specializing in Adversarial Machine Learning for algorithmic finance.
        Analyze the following attack that just occurred in our trading sandbox:
        
        Attack Type: {attack_data.get('attack_type')}
        Target Model: {attack_data.get('model_type')}
        Parameters Used: {attack_data.get('parameters')}
        Attack Successful: {attack_data.get('success')}
        Model Confidence Drop: {attack_data.get('confidence_drop')}
        
        Provide a concise, 2-3 paragraph natural language summary explaining:
        1. How this attack theoretically manipulates the model.
        2. The potential financial impact if this occurred in a live trading environment.
        3. One recommended MLOps defense to mitigate this specific vulnerability.
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        return {"summary": response.text}

    except Exception as e:
        logger.error(f"Gemini API error during threat intel analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate threat intelligence report.")
