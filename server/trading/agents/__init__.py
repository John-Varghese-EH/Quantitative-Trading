# QuantAdv - Quantitative Trading Platform
# Copyright (C) 2026 John Varghese (J0X)
# AGPL-3.0 License

"""
Multi-Agent Financial AI Council Module.
Orchestrates Technical, Fundamental, Sentiment, Adversarial Red-Team, and Risk Manager agents.
Supports Local LLMs (Ollama/vLLM), Google Gemini, and offline deterministic quant analytics.
"""

from .council import AICouncil, get_ai_council

__all__ = ["AICouncil", "get_ai_council"]
