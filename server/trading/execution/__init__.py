# QuantAdv - Quantitative Trading Platform
# Copyright (C) 2026 John Varghese (J0X)
# AGPL-3.0 License

"""
Execution and Broker Gateway Module.
Includes Pre-Trade Legal Compliance Firewall, Paper Trading Simulator, and Multi-Broker Gateway.
"""

from .compliance import ComplianceFirewall, get_compliance_firewall
from .paper_engine import PaperTradingEngine, get_paper_engine
from .broker_gateway import BrokerGateway, get_broker_gateway

__all__ = [
    "ComplianceFirewall",
    "get_compliance_firewall",
    "PaperTradingEngine",
    "get_paper_engine",
    "BrokerGateway",
    "get_broker_gateway",
]
