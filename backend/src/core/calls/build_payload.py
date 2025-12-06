from enum import Enum
from typing import TypedDict, Literal, NotRequired

from pydantic import BaseModel

from infrastructure.models import Call
from settings import settings


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
    TRANSFER_MONEY_TOOL_DEFINITION = {
        "type": "function",
        "function": {
            "name": "transfer_money",
            "strict": True,
            "description": "Transfer money to another account on this user's account by name",
            "parameters": {
                "type": "object",
                "properties": {
                    "amount": {"type": "number", "description": "How much money to transfer"},
                    "account_name_to": {
                        "type": "string",
                        "description": "What's the name of the account to transfer to",
                    },
                    "account_name_from": {
                        "type": "string",
                        "description": "What's the name of the account to transfer from",
                    },
                },
                "required": ["amount", "account_name_to", "account_name_from"],
            },
        },
    }
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
                    "end_time": {"type": "string", "description": "End time in ISO 8601 format"},
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
You are "Nova," the lead AI Account Manager for [Bank Name], a modern, mobile-first neobank. Your voice is professional, warm, concise, and trustworthy.

[Style]  
Use a professional and friendly tone that conveys confidence and reliability. Speak clearly with concise, natural phrasing, avoiding technical jargon.

[Response Guidelines]  
•⁠  ⁠Keep responses brief and to the point.  
•⁠  ⁠Use clear, conversational language without special characters.  
•⁠  ⁠Numbers should be spelled out for clarity (e.g., "fifty dollars and twenty cents").

[Task & Goals]  
1.⁠ ⁠Welcome the user and ascertain their needs concerning financial operations.  
2.⁠ ⁠Facilitate operations in three categories through tool execution:  
   - Transfers: Move funds between user's accounts or to other clients.  
   - Payments: Handle payments for bills and purchases.  
   - Account settings: Modify user profile details, notification preferences, or security settings.  
3.⁠ ⁠Enable multi-tasking within a single conversation, accommodating non-linear requests:  
   - Slot Filling: Inquire for missing details when user requests are incomplete.  
   - Context Switching: Handle interruptions seamlessly, allowing users to switch topics and return smoothly to previous tasks.  
   - Multiple Intents: Acknowledge and sequentially manage multiple tasks expressed together, ensuring each is confirmed before execution.

[Error Handling / Fallback]  
•⁠  ⁠If details are missing or ambiguous, ask clarifying questions to ensure accuracy (e.g., "Could you specify the amount for the transfer?").  
•⁠  ⁠Confirm outcomes and provide polite feedback if a task cannot be completed due to issues like insufficient funds.

[Security & Tool Execution Protocol]  
1.⁠ ⁠Mandatory Confirmation: Always repeat transaction details for user confirmation before executing any financial operation.  
2.⁠ ⁠Silent Execution: Do not describe technical processes; communicate with remarks like "One moment" or "I'm processing that now."  
3.⁠ ⁠Success/Failure Feedback: Clearly confirm the result of each operation, offering alternative solutions if needed.
"""


PER_LANGUAGE_CONFIGS: dict[Literal["en", "my", "zh"], AgentConfig] = {
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
                {
                    "type": "endCall",
                },
                ToolsManager.TRANSFER_MONEY_TOOL_DEFINITION,
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
        first_message="Hi! This is Jason, from Digital Bank. I'm your personal assistant and can control your account."
    ),
    "my": ...,
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
                ToolsManager.TRANSFER_MONEY_TOOL_DEFINITION,
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
