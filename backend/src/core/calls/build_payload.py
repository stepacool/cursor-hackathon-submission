from enum import Enum
from typing import TypedDict, Literal, NotRequired

from pydantic import BaseModel

from settings import settings
from infrastructure.models import Call, ToolType


class SupportedLanguage(Enum):
    """Supported languages with their codes"""

    ENGLISH = "en"
    MALAY = "ms"
    FRENCH = "fr"
    SPANISH = "es"
    GERMAN = "de"
    MANDARIN = "zh"
    ARABIC = "ar"
    PORTUGUESE = "pt"
    INDONESIAN = "id"
    THAI = "th"


class ToolsManager:
    # Transfer Tools
    TRANSFER_MONEY_OWN_ACCOUNTS_TOOL_DEFINITION = {
        "type": "function",
        "function": {
            "name": ToolType.TRANSFER_MONEY_OWN_ACCOUNTS.value,
            "strict": True,
            "description": "Transfer money between the user's own accounts by account name/label",
            "parameters": {
                "type": "object",
                "properties": {
                    "amount": {
                        "type": "number",
                        "description": "How much money to transfer",
                    },
                    "account_name_to": {
                        "type": "string",
                        "description": "The name/label of the account to transfer to",
                    },
                    "account_name_from": {
                        "type": "string",
                        "description": "The name/label of the account to transfer from",
                    },
                },
                "required": ["amount", "account_name_to", "account_name_from"],
                "additionalProperties": False,
            },
        },
    }

    TRANSFER_MONEY_TO_USER_TOOL_DEFINITION = {
        "type": "function",
        "function": {
            "name": ToolType.TRANSFER_MONEY_TO_USER.value,
            "strict": True,
            "description": "Transfer money to another user by their name or phone number",
            "parameters": {
                "type": "object",
                "properties": {
                    "amount": {
                        "type": "number",
                        "description": "How much money to transfer",
                    },
                    "account_name_from": {
                        "type": "string",
                        "description": "The name/label of your account to transfer from",
                    },
                    "recipient_phone_number": {
                        "type": "string",
                        "description": "The phone number of the user to transfer to",
                    },
                },
                "required": ["amount", "account_name_from", "recipient_phone_number"],
                "additionalProperties": False,
            },
        },
    }

    # Payment/Bill Tools
    PAY_BILL_TOOL_DEFINITION = {
        "type": "function",
        "function": {
            "name": ToolType.PAY_BILL.value,
            "strict": True,
            "description": "Pay an outstanding bill (electricity, water, gas, internet, phone, parking, etc.)",
            "parameters": {
                "type": "object",
                "properties": {
                    "bill_type": {
                        "type": "string",
                        "enum": [
                            "electricity",
                            "water",
                            "gas",
                            "internet",
                            "tv",
                            "phone",
                            "parking",
                            "other",
                        ],
                        "description": "The type of bill to pay",
                    },
                    "account_name_from": {
                        "type": "string",
                        "description": "The name/label of the account to pay from",
                    },
                },
                "required": ["bill_type", "account_name_from"],
                "additionalProperties": False,
            },
        },
    }

    LIST_BILLS_TOOL_DEFINITION = {
        "type": "function",
        "function": {
            "name": ToolType.LIST_BILLS.value,
            "strict": True,
            "description": "List all outstanding bills for the user",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
                "additionalProperties": False,
            },
        },
    }

    LIST_ACCOUNTS_TOOL_DEFINITION = {
        "type": "function",
        "function": {
            "name": ToolType.LIST_ACCOUNTS.value,
            "strict": True,
            "description": "List all bank accounts for the user with their titles, account numbers, balances, and status",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
                "additionalProperties": False,
            },
        },
    }

    # Account Management Tools
    OPEN_ACCOUNT_TOOL_DEFINITION = {
        "type": "function",
        "function": {
            "name": ToolType.OPEN_ACCOUNT.value,
            "strict": True,
            "description": "Open a new bank account with a specified name/label",
            "parameters": {
                "type": "object",
                "properties": {
                    "account_title": {
                        "type": "string",
                        "description": "The name/label for the new account (e.g., 'Savings', 'Travel Fund')",
                    },
                },
                "required": ["account_title"],
                "additionalProperties": False,
            },
        },
    }

    CLOSE_ACCOUNT_TOOL_DEFINITION = {
        "type": "function",
        "function": {
            "name": ToolType.CLOSE_ACCOUNT.value,
            "strict": True,
            "description": "Close an existing bank account. If the account has a balance, specify where to transfer the remaining funds.",
            "parameters": {
                "type": "object",
                "properties": {
                    "account_title": {
                        "type": "string",
                        "description": "The name/label of the account to close",
                    },
                    "transfer_to_account": {
                        "type": "string",
                        "description": "The name/label of the account to transfer remaining funds to (required if balance is non-zero)",
                    },
                },
                "required": ["account_title"],
                "additionalProperties": False,
            },
        },
    }

    FREEZE_ACCOUNT_TOOL_DEFINITION = {
        "type": "function",
        "function": {
            "name": ToolType.FREEZE_ACCOUNT.value,
            "strict": True,
            "description": "Freeze/suspend a bank account to prevent any transactions",
            "parameters": {
                "type": "object",
                "properties": {
                    "account_title": {
                        "type": "string",
                        "description": "The name/label of the account to freeze",
                    },
                },
                "required": ["account_title"],
                "additionalProperties": False,
            },
        },
    }

    UNFREEZE_ACCOUNT_TOOL_DEFINITION = {
        "type": "function",
        "function": {
            "name": ToolType.UNFREEZE_ACCOUNT.value,
            "strict": True,
            "description": "Unfreeze/reactivate a previously frozen bank account",
            "parameters": {
                "type": "object",
                "properties": {
                    "account_title": {
                        "type": "string",
                        "description": "The name/label of the account to unfreeze",
                    },
                },
                "required": ["account_title"],
                "additionalProperties": False,
            },
        },
    }

    # Calendar Tool (kept for reference)
    CALENDAR_CREATE_APPOINTMENT_TOOL_DEFINITION = {
        "type": "function",
        "function": {
            "name": "create_calendar_event",
            "strict": True,
            "description": "Schedule an appointment in the company's calendar.",
            "parameters": {
                "type": "object",
                "properties": {
                    "summary": {"type": "string", "description": "Title of the event"},
                    "start_time": {
                        "type": "string",
                        "description": "Start time in ISO 8601 format, e.g. 2025-12-10T09:00:00",
                    },
                    "end_time": {
                        "type": "string",
                        "description": "End time in ISO 8601 format",
                    },
                    "timezone": {
                        "type": "string",
                        "default": "UTC",
                        "description": "IANA timezone, e.g. America/New_York",
                    },
                },
                "required": ["summary", "start_time", "end_time"],
            },
        },
    }

    @classmethod
    def get_all_banking_tools(cls) -> list:
        """Return all banking-related tool definitions"""
        return [
            cls.TRANSFER_MONEY_OWN_ACCOUNTS_TOOL_DEFINITION,
            cls.TRANSFER_MONEY_TO_USER_TOOL_DEFINITION,
            cls.PAY_BILL_TOOL_DEFINITION,
            cls.LIST_BILLS_TOOL_DEFINITION,
            cls.LIST_ACCOUNTS_TOOL_DEFINITION,
            cls.OPEN_ACCOUNT_TOOL_DEFINITION,
            cls.CLOSE_ACCOUNT_TOOL_DEFINITION,
            cls.FREEZE_ACCOUNT_TOOL_DEFINITION,
            cls.UNFREEZE_ACCOUNT_TOOL_DEFINITION,
        ]


class VoiceConfig(TypedDict, total=False):
    provider: str
    model: str
    voiceId: str
    language: str
    stability: float
    style: float
    similarityBoost: float
    speed: float


class TranscriberConfig(TypedDict, total=False):
    provider: str
    model: str
    language: str


class ModelMessage(TypedDict):
    role: Literal["system", "user", "assistant"]
    content: str


class FunctionParameter(TypedDict):
    type: str
    properties: dict[str, dict]
    required: NotRequired[list[str]]


class FunctionDefinition(TypedDict):
    name: str
    strict: bool
    description: str
    parameters: FunctionParameter


class FunctionTool(TypedDict, total=False):
    type: Literal["function"]
    async_: bool
    function: FunctionDefinition


class ModelConfig(TypedDict, total=False):
    provider: str
    model: str
    temperature: float
    messages: list[ModelMessage]
    functions: list[FunctionDefinition]
    tools: list[FunctionTool | dict]


class VapiAssistantConfig(TypedDict, total=False):
    name: str
    model: ModelConfig
    voice: VoiceConfig
    transcriber: TranscriberConfig
    backgroundSound: str
    firstMessage: str
    recordingEnabled: bool
    interruptionsEnabled: bool
    server: dict

    endCallFunctionEnabled: bool
    endCallPhrases: list[str]
    serverMessages: list[str]


class AgentConfig(BaseModel):
    name: str
    model: ModelConfig
    voice: VoiceConfig
    transcriber: TranscriberConfig
    first_message: str


SYSTEM_PROMPT = """
[Identity]  
You are "Nova," the AI Relationship Manager for [Bank Name], serving both retail and commercial clients.
You function as a personal banker, commercial banker, and trusted financial advisor.
Your voice is professional, calm, confident, and relationship-driven.

[Banking Mindset]  
Think like a top-performing banker:
•Understand client goals before offering solutions
•Prioritize trust, suitability, and long-term relationship value
•Recommend products only when they clearly fit the customer’s needs

[Style]  
Use clear, conversational language that is confident but never aggressive.
Avoid technical jargon unless the customer demonstrates comfort with it.
Sound helpful, consultative, and human.

[Core Capabilities]  

1.Banking Operations  
You can assist with:
•Transfers
•Payments
•Account and security settings

Follow all security and confirmation protocols for transactional actions.

2.Product Knowledge & Learning  
You maintain structured knowledge of [Bank Name]’s offerings, including:
•Deposit accounts (savings, current, term)
•Cards and payment products
•Lending products (personal loans, SME loans, overdrafts, credit lines)
•Commercial solutions (cash management, payroll, FX, trade finance)
•Digital services and value-added tools

When new products are introduced, infer their positioning based on:
•Target customer
•Pricing
•Use case
•Risk profile

3.Needs Discovery  
Before recommending any product, you should:
•Ask concise, purposeful questions
•Identify the customer’s intent (save, spend, borrow, grow, protect, optimize)
•Detect life or business triggers (cash flow gaps, growth plans, large purchases)

Examples:
•“Are you looking to manage cash flow better, or fund growth?”
•“Is this for personal use or for your business?”

4.Intelligent Product Recommendation  
When appropriate:
•Proactively suggest relevant banking products
•Explain benefits in plain language, not features
•Clearly state why the product fits the customer’s situation
•Offer next steps without pressure

Examples:
•“Based on what you shared, a revolving credit line may give you more flexibility than a term loan.”
•“Many clients in your position use this account to separate business and personal cash flow.”

5.Sales & Conversion Support  
If the customer shows interest:
•Guide them through eligibility at a high level
•Explain required information or documents
•Offer a smooth handoff to a human banker when needed

Never hard-sell.
If a product is unsuitable, say so and explain why.

6.Multi-Intent & Context Handling  
You can:
•Handle multiple requests in one conversation
•Pause and resume tasks seamlessly
•Ask for missing details through natural slot-filling
•Confirm each action before execution

[Compliance & Risk Guardrails]  
•Do not provide financial advice that requires licensing beyond general guidance
•Do not guarantee approvals, returns, or outcomes
•Always frame recommendations as informational, not mandatory
•Defer complex or high-risk cases to a human banker

[Security & Execution Protocol]  
1.Mandatory Confirmation  
Repeat transaction details clearly before execution.

2.Silent Execution  
Do not explain backend processes.
Use phrases like “One moment” or “I’m taking care of that now.”

3.Outcome Feedback  
Confirm success or failure clearly.
If unsuccessful, explain next best options.

[Closing Behavior]  
End interactions by:
•Summarizing what was done
•Offering relevant next help
•Reinforcing availability without pressure
"""


PER_LANGUAGE_CONFIGS: dict[Literal["en", "ms", "zh"], AgentConfig] = {
    "en": AgentConfig(
        name="Jason",
        model={
            "provider": "openai",
            "model": "gpt-4o",
            "temperature": 0.7,
            "messages": [
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
            ],
            "tools": [
                {"type": "endCall"},
                *ToolsManager.get_all_banking_tools(),
            ],
        },
        transcriber={
            "provider": "deepgram",
            "model": "nova-2",
            "language": "en",
        },
        voice={
            "provider": "11labs",
            "model": "eleven_multilingual_v2",
            "voiceId": "aSXZu6bgEOS8MXVRzjPi",
            "language": "en",
            "stability": 0.6,
            "style": 0.3,
            "similarityBoost": 0.8,
            "speed": 0.95,
        },
        first_message="Hi! This is Jason, from Banksta. I got a message that you need some banking assistance.",
    ),
    "ms": AgentConfig(
        name="Aisha",
        model={
            "provider": "openai",
            "model": "gpt-4o",
            "temperature": 0.7,
            "messages": [
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
            ],
            "tools": [
                {"type": "endCall"},
                *ToolsManager.get_all_banking_tools(),
            ],
        },
        transcriber={
            "provider": "deepgram",
            "model": "nova-2",
            "language": "en",
        },
        voice={
            "provider": "11labs",
            "model": "eleven_multilingual_v2",
            "voiceId": "UcqZLa941Kkt8ZhEEybf",
            "language": "my",
            "stability": 0.6,
            "style": 0.3,
            "similarityBoost": 0.8,
            "speed": 0.95,
        },
        first_message="Hi! This is Jason, from Banksta. I got a message that you need some banking assistance.",
    ),
    "zh": AgentConfig(
        name="Zhi Wu",
        model={
            "provider": "openai",
            "model": "gpt-4o",
            "temperature": 0.7,
            "messages": [
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
            ],
            "tools": [
                {
                    "type": "endCall",
                },
                ToolsManager.TRANSFER_MONEY_OWN_ACCOUNTS_TOOL_DEFINITION,
            ],
        },
        transcriber={
            "provider": "deepgram",
            "model": "nova-2",
            "language": "zh",
        },
        voice={
            "provider": "11labs",
            "model": "eleven_multilingual_v2",
            "voiceId": "R55vTH9XmVSyAcM6YvtV",
            "language": "zh",
            "stability": 0.6,
            "style": 0.3,
            "similarityBoost": 0.8,
            "speed": 0.95,
        },
        first_message="您好!我是数字银行的Jason。我是您的个人助理,可以帮您管理账户。"
    ),
}


async def build_call_payload(call: Call) -> VapiAssistantConfig:
    config: AgentConfig | None = PER_LANGUAGE_CONFIGS.get(call.language)
    if not config:
        raise ValueError("LANGUAGE NOT SUPPORTED")
    return {
        "name": "Jason",
        "model": config.model,
        "voice": config.voice,
        "transcriber": config.transcriber,
        "firstMessage": config.first_message,
        "backgroundSound": "office",
        "recordingEnabled": True,
        "interruptionsEnabled": True,
        "endCallFunctionEnabled": True,
        "serverMessages": [
            "tool-calls",
            "function-call",
            "end-of-call-report",
            "assistant.started",
        ],
        "server": {
            "url": f"{settings.PROJECT_URL}/webhooks",
            # "url": "https://webhook.site/c7ec072b-27fb-48be-86f9-7bb7029fde20/webhooks"
        },
    }
