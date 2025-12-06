from typing import Literal, Optional, Union, Any
from pydantic import BaseModel, Field
from enum import Enum


# Enums
class StatusType(str, Enum):
    SCHEDULED = "scheduled"
    QUEUED = "queued"
    RINGING = "ringing"
    IN_PROGRESS = "in-progress"
    FORWARDING = "forwarding"
    ENDED = "ended"


class TranscriptType(str, Enum):
    PARTIAL = "partial"
    FINAL = "final"


class SpeechStatus(str, Enum):
    STARTED = "started"
    STOPPED = "stopped"


class Role(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class PhoneCallControlRequest(str, Enum):
    FORWARD = "forward"
    HANG_UP = "hang-up"


class DestinationType(str, Enum):
    NUMBER = "number"
    SIP = "sip"
    ASSISTANT = "assistant"


# Common Objects
class CallObject(BaseModel):
    """Represents a call object with common metadata"""

    id: Optional[str] = None
    phone_number: Optional[str] = Field(None, alias="phoneNumber")
    customer_id: Optional[str] = Field(None, alias="customerId")
    # Add other call fields as needed
    model_config = {"populate_by_name": True}


class ChatObject(BaseModel):
    """Represents a chat object"""

    id: Optional[str] = None
    # Add other chat fields as needed


class SessionObject(BaseModel):
    """Represents a session object"""

    id: Optional[str] = None
    # Add other session fields as needed


class RecordingObject(BaseModel):
    """Recording metadata with URLs"""

    url: Optional[str] = None
    duration_seconds: Optional[float] = Field(None, alias="durationSeconds")
    model_config = {"populate_by_name": True}


class MessageObject(BaseModel):
    """Conversation message"""

    role: str
    message: str


class ArtifactObject(BaseModel):
    """End of call artifacts"""

    recording: Optional[RecordingObject] = None
    transcript: Optional[str] = None
    messages: Optional[list[MessageObject]] = None


class NumberDestination(BaseModel):
    """Phone number transfer destination"""

    type: Literal["number"] = "number"
    number: str
    caller_id: Optional[str] = Field(None, alias="callerId")
    extension: Optional[str] = None
    message: Optional[str] = None
    model_config = {"populate_by_name": True}


class SipDestination(BaseModel):
    """SIP transfer destination"""

    type: Literal["sip"] = "sip"
    sip_uri: str = Field(..., alias="sipUri")
    sip_headers: Optional[dict[str, str]] = Field(None, alias="sipHeaders")
    message: Optional[str] = None
    model_config = {"populate_by_name": True}


class AssistantDestination(BaseModel):
    """Assistant transfer destination"""

    type: Literal["assistant"] = "assistant"
    assistant_id: str = Field(..., alias="assistantId")
    message: Optional[str] = None
    model_config = {"populate_by_name": True}


Destination = Union[NumberDestination, SipDestination, AssistantDestination]


class ToolCallObject(BaseModel):
    """Tool call details"""

    id: str
    name: str
    parameters: dict[str, Any]


class ToolWithToolCall(BaseModel):
    """Tool with associated tool call"""

    name: str
    tool_call: ToolCallObject = Field(..., alias="toolCall")
    model_config = {"populate_by_name": True}


class DocumentObject(BaseModel):
    """Knowledge base document"""

    content: str
    similarity: Optional[float] = None
    uuid: Optional[str] = None


# Event Messages
class ToolCallsMessage(BaseModel):
    """Function/Tool calling event"""

    type: Literal["tool-calls"] = "tool-calls"
    call: CallObject
    tool_with_tool_call_list: list[ToolWithToolCall] = Field(
        ..., alias="toolWithToolCallList"
    )
    tool_call_list: list[ToolCallObject] = Field(..., alias="toolCallList")
    model_config = {"populate_by_name": True}


class AssistantRequestMessage(BaseModel):
    """Request for assistant configuration"""

    type: Literal["assistant-request"] = "assistant-request"
    call: CallObject


class StatusUpdateMessage(BaseModel):
    """Call status update"""

    type: Literal["status-update"] = "status-update"
    call: CallObject
    status: StatusType


class EndOfCallReportMessage(BaseModel):
    """End of call report with artifacts"""

    type: Literal["end-of-call-report"] = "end-of-call-report"
    ended_reason: str = Field(..., alias="endedReason")
    call: CallObject
    artifact: Optional[ArtifactObject] = None
    model_config = {"populate_by_name": True}


class HangMessage(BaseModel):
    """Hang notification when assistant fails to reply"""

    type: Literal["hang"] = "hang"
    call: CallObject


class ConversationUpdateMessage(BaseModel):
    """Conversation history update"""

    type: Literal["conversation-update"] = "conversation-update"
    messages: list[dict[str, Any]]
    messages_openai_formatted: list[dict[str, Any]] = Field(
        ..., alias="messagesOpenAIFormatted"
    )
    model_config = {"populate_by_name": True}


class TranscriptMessage(BaseModel):
    """Transcript event (partial or final)"""

    type: Union[Literal["transcript"]]  # Can be "transcript[transcriptType=\"final\"]"
    role: Role
    transcript_type: TranscriptType = Field(..., alias="transcriptType")
    transcript: str
    is_filtered: bool = Field(..., alias="isFiltered")
    detected_threats: list[str] = Field(..., alias="detectedThreats")
    original_transcript: str = Field(..., alias="originalTranscript")
    model_config = {"populate_by_name": True}


class SpeechUpdateMessage(BaseModel):
    """Speech status update"""

    type: Literal["speech-update"] = "speech-update"
    status: SpeechStatus
    role: Role
    turn: int


class ModelOutputMessage(BaseModel):
    """Model generation output"""

    type: Literal["model-output"] = "model-output"
    output: dict[str, Any]


class TransferDestinationRequestMessage(BaseModel):
    """Request for transfer destination"""

    type: Literal["transfer-destination-request"] = "transfer-destination-request"
    call: CallObject


class TransferUpdateMessage(BaseModel):
    """Transfer occurrence notification"""

    type: Literal["transfer-update"] = "transfer-update"
    destination: dict[str, Any]  # Can be assistant, number, or sip destination


class UserInterruptedMessage(BaseModel):
    """User interrupted assistant"""

    type: Literal["user-interrupted"] = "user-interrupted"


class LanguageChangeDetectedMessage(BaseModel):
    """Language change detected by transcriber"""

    type: Literal["language-change-detected"] = "language-change-detected"
    language: str


class PhoneCallControlMessage(BaseModel):
    """Phone call control delegation"""

    type: Literal["phone-call-control"] = "phone-call-control"
    request: PhoneCallControlRequest
    destination: Optional[dict[str, Any]] = None


class KnowledgeBaseRequestMessage(BaseModel):
    """Custom knowledge base request"""

    type: Literal["knowledge-base-request"] = "knowledge-base-request"
    messages: list[dict[str, Any]]
    messages_openai_formatted: list[dict[str, Any]] = Field(
        ..., alias="messagesOpenAIFormatted"
    )
    model_config = {"populate_by_name": True}


class VoiceInputMessage(BaseModel):
    """Voice input from custom provider"""

    type: Literal["voice-input"] = "voice-input"
    input: str


class VoiceRequestMessage(BaseModel):
    """Voice synthesis request"""

    type: Literal["voice-request"] = "voice-request"
    text: str
    sample_rate: int = Field(..., alias="sampleRate")
    model_config = {"populate_by_name": True}


class CallEndpointingRequestMessage(BaseModel):
    """Custom endpointing request"""

    type: Literal["call.endpointing.request"] = "call.endpointing.request"
    messages_openai_formatted: list[dict[str, Any]] = Field(
        ..., alias="messagesOpenAIFormatted"
    )
    model_config = {"populate_by_name": True}


class ChatCreatedMessage(BaseModel):
    """Chat created event"""

    type: Literal["chat.created"] = "chat.created"
    chat: ChatObject


class ChatDeletedMessage(BaseModel):
    """Chat deleted event"""

    type: Literal["chat.deleted"] = "chat.deleted"
    chat: ChatObject


class SessionCreatedMessage(BaseModel):
    """Session created event"""

    type: Literal["session.created"] = "session.created"
    session: SessionObject


class SessionUpdatedMessage(BaseModel):
    """Session updated event"""

    type: Literal["session.updated"] = "session.updated"
    session: SessionObject


class SessionDeletedMessage(BaseModel):
    """Session deleted event"""

    type: Literal["session.deleted"] = "session.deleted"
    session: SessionObject


# Union of all message types
ServerMessage = Union[
    ToolCallsMessage,
    AssistantRequestMessage,
    StatusUpdateMessage,
    EndOfCallReportMessage,
    HangMessage,
    ConversationUpdateMessage,
    TranscriptMessage,
    SpeechUpdateMessage,
    ModelOutputMessage,
    TransferDestinationRequestMessage,
    TransferUpdateMessage,
    UserInterruptedMessage,
    LanguageChangeDetectedMessage,
    PhoneCallControlMessage,
    KnowledgeBaseRequestMessage,
    VoiceInputMessage,
    VoiceRequestMessage,
    CallEndpointingRequestMessage,
    ChatCreatedMessage,
    ChatDeletedMessage,
    SessionCreatedMessage,
    SessionUpdatedMessage,
    SessionDeletedMessage,
]


# Main webhook payload
class ServerWebhookPayload(BaseModel):
    """Main webhook payload sent to server URL"""

    message: ServerMessage = Field(..., discriminator="type")


# Response Models
class ToolCallResult(BaseModel):
    """Tool call execution result"""

    name: str
    tool_call_id: str = Field(..., alias="toolCallId")
    result: str
    model_config = {"populate_by_name": True}


class ToolCallsResponse(BaseModel):
    """Response to tool-calls webhook"""

    results: list[ToolCallResult]


class AssistantRequestIdResponse(BaseModel):
    """Response with existing assistant ID"""

    assistant_id: str = Field(..., alias="assistantId")
    model_config = {"populate_by_name": True}


class AssistantConfig(BaseModel):
    """Transient assistant configuration"""

    first_message: Optional[str] = Field(None, alias="firstMessage")
    model: dict[str, Any]
    model_config = {"populate_by_name": True}


class AssistantRequestConfigResponse(BaseModel):
    """Response with new assistant config"""

    assistant: AssistantConfig


class AssistantRequestTransferResponse(BaseModel):
    """Response to transfer immediately"""

    destination: Destination


class AssistantRequestErrorResponse(BaseModel):
    """Error response to assistant request"""

    error: str


AssistantRequestResponse = Union[
    AssistantRequestIdResponse,
    AssistantRequestConfigResponse,
    AssistantRequestTransferResponse,
    AssistantRequestErrorResponse,
]


class TransferDestinationResponse(BaseModel):
    """Response to transfer-destination-request"""

    destination: Destination
    message: Optional[dict[str, Any]] = None


class KnowledgeBaseResponse(BaseModel):
    """Response to knowledge-base-request"""

    documents: list[DocumentObject]
    message: Optional[str] = None


class EndpointingResponse(BaseModel):
    """Response to endpointing request"""

    timeout_seconds: float = Field(..., alias="timeoutSeconds")
    model_config = {"populate_by_name": True}


# Tool Calls
class TransferMoneyToolCallParameters(BaseModel):
    """Tool call to transfer money"""

    from_account_label: str = Field(..., alias="fromAccountLabel")
    to_account_label: str = Field(..., alias="toAccountLabel")
    amount: float = Field(..., alias="amount")
    model_config = {"populate_by_name": True}
