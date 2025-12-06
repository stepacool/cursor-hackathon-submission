from typing import Literal, Optional, Union, Any, List
from pydantic import BaseModel, Field, ConfigDict
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
    BOT = "bot"
    TOOL_CALLS = "tool_calls"
    TOOL_CALL_RESULT = "tool_call_result"


class PhoneCallControlRequest(str, Enum):
    FORWARD = "forward"
    HANG_UP = "hang-up"


class DestinationType(str, Enum):
    NUMBER = "number"
    SIP = "sip"
    ASSISTANT = "assistant"


# Common Objects
class MonitorObject(BaseModel):
    listen_url: Optional[str] = Field(None, alias="listenUrl")
    control_url: Optional[str] = Field(None, alias="controlUrl")
    model_config = ConfigDict(populate_by_name=True)


class TransportObject(BaseModel):
    conversation_type: Optional[str] = Field(None, alias="conversationType")
    provider: Optional[str] = None
    call_sid: Optional[str] = Field(None, alias="callSid")
    account_sid: Optional[str] = Field(None, alias="accountSid")
    model_config = ConfigDict(populate_by_name=True)


class ModelObject(BaseModel):
    model: Optional[str] = None
    tools: Optional[List[dict]] = None
    messages: Optional[List[dict]] = None
    provider: Optional[str] = None
    temperature: Optional[float] = None
    model_config = ConfigDict(populate_by_name=True)


class VoiceObject(BaseModel):
    model: Optional[str] = None
    speed: Optional[float] = None
    style: Optional[float] = None
    voice_id: Optional[str] = Field(None, alias="voiceId")
    language: Optional[str] = None
    provider: Optional[str] = None
    stability: Optional[float] = None
    similarity_boost: Optional[float] = Field(None, alias="similarityBoost")
    model_config = ConfigDict(populate_by_name=True)


class ServerObject(BaseModel):
    url: Optional[str] = None
    model_config = ConfigDict(populate_by_name=True)


class TranscriberObject(BaseModel):
    model: Optional[str] = None
    language: Optional[str] = None
    provider: Optional[str] = None
    model_config = ConfigDict(populate_by_name=True)


class AssistantObject(BaseModel):
    name: Optional[str] = None
    model: Optional[ModelObject] = None
    voice: Optional[VoiceObject] = None
    server: Optional[ServerObject] = None
    transcriber: Optional[TranscriberObject] = None
    first_message: Optional[str] = Field(None, alias="firstMessage")
    server_messages: Optional[List[str]] = Field(None, alias="serverMessages")
    background_sound: Optional[str] = Field(None, alias="backgroundSound")
    recording_enabled: Optional[bool] = Field(None, alias="recordingEnabled")
    interruptions_enabled: Optional[bool] = Field(None, alias="interruptionsEnabled")
    end_call_function_enabled: Optional[bool] = Field(None, alias="endCallFunctionEnabled")
    model_config = ConfigDict(populate_by_name=True)


class CustomerObject(BaseModel):
    name: Optional[str] = None
    number: Optional[str] = None
    model_config = ConfigDict(populate_by_name=True)


class PhoneNumberObject(BaseModel):
    id: Optional[str] = None
    org_id: Optional[str] = Field(None, alias="orgId")
    number: Optional[str] = None
    created_at: Optional[str] = Field(None, alias="createdAt")
    updated_at: Optional[str] = Field(None, alias="updatedAt")
    twilio_account_sid: Optional[str] = Field(None, alias="twilioAccountSid")
    twilio_auth_token: Optional[str] = Field(None, alias="twilioAuthToken")
    name: Optional[str] = None
    provider: Optional[str] = None
    status: Optional[str] = None
    model_config = ConfigDict(populate_by_name=True)


class CallObject(BaseModel):
    """Represents a call object with common metadata"""
    id: Optional[str] = None
    org_id: Optional[str] = Field(None, alias="orgId")
    created_at: Optional[str] = Field(None, alias="createdAt")
    updated_at: Optional[str] = Field(None, alias="updatedAt")
    type: Optional[str] = None
    cost: Optional[float] = None
    monitor: Optional[MonitorObject] = None
    transport: Optional[TransportObject] = None
    phone_call_provider: Optional[str] = Field(None, alias="phoneCallProvider")
    phone_call_provider_id: Optional[str] = Field(None, alias="phoneCallProviderId")
    phone_call_transport: Optional[str] = Field(None, alias="phoneCallTransport")
    status: Optional[str] = None
    assistant: Optional[AssistantObject] = None
    phone_number_id: Optional[str] = Field(None, alias="phoneNumberId")
    customer: Optional[CustomerObject] = None
    model_config = ConfigDict(populate_by_name=True)


class ChatObject(BaseModel):
    """Represents a chat object"""
    id: Optional[str] = None
    model_config = ConfigDict(populate_by_name=True)


class SessionObject(BaseModel):
    """Represents a session object"""
    id: Optional[str] = None
    model_config = ConfigDict(populate_by_name=True)


class RecordingObject(BaseModel):
    """Recording metadata with URLs"""
    url: Optional[str] = None
    duration_seconds: Optional[float] = Field(None, alias="durationSeconds")
    stereo_url: Optional[str] = Field(None, alias="stereoUrl")
    mono: Optional[dict] = None
    model_config = ConfigDict(populate_by_name=True)


class MessageObject(BaseModel):
    """Conversation message"""
    role: str
    message: Optional[str] = None
    content: Optional[str] = None
    time: Optional[float] = None
    end_time: Optional[float] = Field(None, alias="endTime")
    seconds_from_start: Optional[float] = Field(None, alias="secondsFromStart")
    duration: Optional[float] = None
    source: Optional[str] = None
    metadata: Optional[dict] = None
    tool_calls: Optional[List[dict]] = Field(None, alias="toolCalls")
    tool_call_id: Optional[str] = Field(None, alias="toolCallId")
    result: Optional[str] = None
    name: Optional[str] = None
    model_config = ConfigDict(populate_by_name=True)


class ArtifactObject(BaseModel):
    """End of call artifacts"""
    recording: Optional[RecordingObject] = None
    transcript: Optional[str] = None
    messages: Optional[List[MessageObject]] = None
    messages_openai_formatted: Optional[List[dict]] = Field(None, alias="messagesOpenAIFormatted")
    recording_url: Optional[str] = Field(None, alias="recordingUrl")
    stereo_recording_url: Optional[str] = Field(None, alias="stereoRecordingUrl")
    log_url: Optional[str] = Field(None, alias="logUrl")
    nodes: Optional[List[Any]] = None
    variables: Optional[dict] = None
    variable_values: Optional[dict] = Field(None, alias="variableValues")
    performance_metrics: Optional[dict] = Field(None, alias="performanceMetrics")
    scorecards: Optional[dict] = None
    transfers: Optional[List[Any]] = None
    model_config = ConfigDict(populate_by_name=True)


class NumberDestination(BaseModel):
    """Phone number transfer destination"""
    type: Literal["number"] = "number"
    number: str
    caller_id: Optional[str] = Field(None, alias="callerId")
    extension: Optional[str] = None
    message: Optional[str] = None
    model_config = ConfigDict(populate_by_name=True)


class SipDestination(BaseModel):
    """SIP transfer destination"""
    type: Literal["sip"] = "sip"
    sip_uri: str = Field(..., alias="sipUri")
    sip_headers: Optional[dict[str, str]] = Field(None, alias="sipHeaders")
    message: Optional[str] = None
    model_config = ConfigDict(populate_by_name=True)


class AssistantDestination(BaseModel):
    """Assistant transfer destination"""
    type: Literal["assistant"] = "assistant"
    assistant_id: str = Field(..., alias="assistantId")
    message: Optional[str] = None
    model_config = ConfigDict(populate_by_name=True)


Destination = Union[NumberDestination, SipDestination, AssistantDestination]


class FunctionCallObject(BaseModel):
    """Function call details inside tool call"""
    name: str
    arguments: Union[dict[str, Any], str]  # Can be dict or JSON string
    model_config = ConfigDict(populate_by_name=True)


class ToolCallObject(BaseModel):
    """Tool call details"""
    id: str
    type: Optional[str] = "function"
    function: FunctionCallObject
    model_config = ConfigDict(populate_by_name=True)


class ToolDefinitionObject(BaseModel):
    """Tool definition"""
    type: Optional[str] = None
    function: Optional[dict] = None
    messages: Optional[List[Any]] = None
    tool_call: Optional[ToolCallObject] = Field(None, alias="toolCall")
    model_config = ConfigDict(populate_by_name=True)


class ToolWithToolCall(BaseModel):
    """Tool with associated tool call"""
    type: Optional[str] = None
    function: Optional[dict] = None
    messages: Optional[List[Any]] = None
    tool_call: ToolCallObject = Field(..., alias="toolCall")
    model_config = ConfigDict(populate_by_name=True)


class DocumentObject(BaseModel):
    """Knowledge base document"""
    content: str
    similarity: Optional[float] = None
    uuid: Optional[str] = None
    model_config = ConfigDict(populate_by_name=True)


# Event Messages
class ToolCallsMessage(BaseModel):
    """Function/Tool calling event"""
    type: Literal["tool-calls"] = "tool-calls"
    timestamp: Optional[int] = None
    tool_calls: Optional[List[ToolCallObject]] = Field(None, alias="toolCalls")
    tool_call_list: Optional[List[ToolCallObject]] = Field(None, alias="toolCallList")
    tool_with_tool_call_list: Optional[List[ToolWithToolCall]] = Field(None, alias="toolWithToolCallList")
    artifact: Optional[ArtifactObject] = None
    call: Optional[CallObject] = None
    phone_number: Optional[PhoneNumberObject] = Field(None, alias="phoneNumber")
    customer: Optional[CustomerObject] = None
    assistant: Optional[AssistantObject] = None
    model_config = ConfigDict(populate_by_name=True)


class AssistantRequestMessage(BaseModel):
    """Request for assistant configuration"""
    type: Literal["assistant-request"] = "assistant-request"
    call: CallObject
    model_config = ConfigDict(populate_by_name=True)


class StatusUpdateMessage(BaseModel):
    """Call status update"""
    type: Literal["status-update"] = "status-update"
    call: CallObject
    status: StatusType
    model_config = ConfigDict(populate_by_name=True)


class AnalysisObject(BaseModel):
    """Call analysis"""
    summary: Optional[str] = None
    success_evaluation: Optional[str] = Field(None, alias="successEvaluation")
    model_config = ConfigDict(populate_by_name=True)


class CostBreakdownObject(BaseModel):
    """Cost breakdown details"""
    stt: Optional[float] = None
    llm: Optional[float] = None
    tts: Optional[float] = None
    vapi: Optional[float] = None
    chat: Optional[float] = None
    transport: Optional[float] = None
    total: Optional[float] = None
    llm_prompt_tokens: Optional[int] = Field(None, alias="llmPromptTokens")
    llm_completion_tokens: Optional[int] = Field(None, alias="llmCompletionTokens")
    llm_cached_prompt_tokens: Optional[int] = Field(None, alias="llmCachedPromptTokens")
    tts_characters: Optional[int] = Field(None, alias="ttsCharacters")
    voicemail_detection_cost: Optional[float] = Field(None, alias="voicemailDetectionCost")
    knowledge_base_cost: Optional[float] = Field(None, alias="knowledgeBaseCost")
    analysis_cost_breakdown: Optional[dict] = Field(None, alias="analysisCostBreakdown")
    model_config = ConfigDict(populate_by_name=True)


class EndOfCallReportMessage(BaseModel):
    """End of call report with artifacts"""
    type: Literal["end-of-call-report"] = "end-of-call-report"
    timestamp: Optional[int] = None
    analysis: Optional[AnalysisObject] = None
    artifact: Optional[ArtifactObject] = None
    started_at: Optional[str] = Field(None, alias="startedAt")
    ended_at: Optional[str] = Field(None, alias="endedAt")
    ended_reason: Optional[str] = Field(None, alias="endedReason")
    cost: Optional[float] = None
    cost_breakdown: Optional[CostBreakdownObject] = Field(None, alias="costBreakdown")
    costs: Optional[List[dict]] = None
    duration_ms: Optional[int] = Field(None, alias="durationMs")
    duration_seconds: Optional[float] = Field(None, alias="durationSeconds")
    duration_minutes: Optional[float] = Field(None, alias="durationMinutes")
    summary: Optional[str] = None
    transcript: Optional[str] = None
    messages: Optional[List[MessageObject]] = None
    recording_url: Optional[str] = Field(None, alias="recordingUrl")
    stereo_recording_url: Optional[str] = Field(None, alias="stereoRecordingUrl")
    call: Optional[CallObject] = None
    phone_number: Optional[PhoneNumberObject] = Field(None, alias="phoneNumber")
    customer: Optional[CustomerObject] = None
    assistant: Optional[AssistantObject] = None
    model_config = ConfigDict(populate_by_name=True)


class HangMessage(BaseModel):
    """Hang notification when assistant fails to reply"""
    type: Literal["hang"] = "hang"
    call: CallObject
    model_config = ConfigDict(populate_by_name=True)


class ConversationUpdateMessage(BaseModel):
    """Conversation history update"""
    type: Literal["conversation-update"] = "conversation-update"
    messages: List[dict[str, Any]]
    messages_openai_formatted: List[dict[str, Any]] = Field(..., alias="messagesOpenAIFormatted")
    model_config = ConfigDict(populate_by_name=True)


class TranscriptMessage(BaseModel):
    """Transcript event (partial or final)"""
    type: Union[Literal["transcript"]]
    role: Role
    transcript_type: TranscriptType = Field(..., alias="transcriptType")
    transcript: str
    is_filtered: bool = Field(..., alias="isFiltered")
    detected_threats: List[str] = Field(..., alias="detectedThreats")
    original_transcript: str = Field(..., alias="originalTranscript")
    model_config = ConfigDict(populate_by_name=True)


class SpeechUpdateMessage(BaseModel):
    """Speech status update"""
    type: Literal["speech-update"] = "speech-update"
    status: SpeechStatus
    role: Role
    turn: int
    model_config = ConfigDict(populate_by_name=True)


class ModelOutputMessage(BaseModel):
    """Model generation output"""
    type: Literal["model-output"] = "model-output"
    output: dict[str, Any]
    model_config = ConfigDict(populate_by_name=True)


class TransferDestinationRequestMessage(BaseModel):
    """Request for transfer destination"""
    type: Literal["transfer-destination-request"] = "transfer-destination-request"
    call: CallObject
    model_config = ConfigDict(populate_by_name=True)


class TransferUpdateMessage(BaseModel):
    """Transfer occurrence notification"""
    type: Literal["transfer-update"] = "transfer-update"
    destination: dict[str, Any]
    model_config = ConfigDict(populate_by_name=True)


class UserInterruptedMessage(BaseModel):
    """User interrupted assistant"""
    type: Literal["user-interrupted"] = "user-interrupted"
    model_config = ConfigDict(populate_by_name=True)


class LanguageChangeDetectedMessage(BaseModel):
    """Language change detected by transcriber"""
    type: Literal["language-change-detected"] = "language-change-detected"
    language: str
    model_config = ConfigDict(populate_by_name=True)


class PhoneCallControlMessage(BaseModel):
    """Phone call control delegation"""
    type: Literal["phone-call-control"] = "phone-call-control"
    request: PhoneCallControlRequest
    destination: Optional[dict[str, Any]] = None
    model_config = ConfigDict(populate_by_name=True)


class KnowledgeBaseRequestMessage(BaseModel):
    """Custom knowledge base request"""
    type: Literal["knowledge-base-request"] = "knowledge-base-request"
    messages: List[dict[str, Any]]
    messages_openai_formatted: List[dict[str, Any]] = Field(..., alias="messagesOpenAIFormatted")
    model_config = ConfigDict(populate_by_name=True)


class VoiceInputMessage(BaseModel):
    """Voice input from custom provider"""
    type: Literal["voice-input"] = "voice-input"
    input: str
    model_config = ConfigDict(populate_by_name=True)


class VoiceRequestMessage(BaseModel):
    """Voice synthesis request"""
    type: Literal["voice-request"] = "voice-request"
    text: str
    sample_rate: int = Field(..., alias="sampleRate")
    model_config = ConfigDict(populate_by_name=True)


class CallEndpointingRequestMessage(BaseModel):
    """Custom endpointing request"""
    type: Literal["call.endpointing.request"] = "call.endpointing.request"
    messages_openai_formatted: List[dict[str, Any]] = Field(..., alias="messagesOpenAIFormatted")
    model_config = ConfigDict(populate_by_name=True)


class ChatCreatedMessage(BaseModel):
    """Chat created event"""
    type: Literal["chat.created"] = "chat.created"
    chat: ChatObject
    model_config = ConfigDict(populate_by_name=True)


class ChatDeletedMessage(BaseModel):
    """Chat deleted event"""
    type: Literal["chat.deleted"] = "chat.deleted"
    chat: ChatObject
    model_config = ConfigDict(populate_by_name=True)


class SessionCreatedMessage(BaseModel):
    """Session created event"""
    type: Literal["session.created"] = "session.created"
    session: SessionObject
    model_config = ConfigDict(populate_by_name=True)


class SessionUpdatedMessage(BaseModel):
    """Session updated event"""
    type: Literal["session.updated"] = "session.updated"
    session: SessionObject
    model_config = ConfigDict(populate_by_name=True)


class SessionDeletedMessage(BaseModel):
    """Session deleted event"""
    type: Literal["session.deleted"] = "session.deleted"
    session: SessionObject
    model_config = ConfigDict(populate_by_name=True)


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
    model_config = ConfigDict(populate_by_name=True)


# Response Models
class ToolCallResult(BaseModel):
    """Tool call execution result"""
    tool_call_id: str = Field(..., alias="toolCallId")
    result: str
    model_config = ConfigDict(populate_by_name=True)


class ToolCallsResponse(BaseModel):
    """Response to tool-calls webhook"""
    results: List[ToolCallResult]
    model_config = ConfigDict(populate_by_name=True)


class AssistantRequestIdResponse(BaseModel):
    """Response with existing assistant ID"""
    assistant_id: str = Field(..., alias="assistantId")
    model_config = ConfigDict(populate_by_name=True)


class AssistantConfig(BaseModel):
    """Transient assistant configuration"""
    first_message: Optional[str] = Field(None, alias="firstMessage")
    model: dict[str, Any]
    model_config = ConfigDict(populate_by_name=True)


class AssistantRequestConfigResponse(BaseModel):
    """Response with new assistant config"""
    assistant: AssistantConfig
    model_config = ConfigDict(populate_by_name=True)


class AssistantRequestTransferResponse(BaseModel):
    """Response to transfer immediately"""
    destination: Destination
    model_config = ConfigDict(populate_by_name=True)


class AssistantRequestErrorResponse(BaseModel):
    """Error response to assistant request"""
    error: str
    model_config = ConfigDict(populate_by_name=True)


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
    model_config = ConfigDict(populate_by_name=True)


class KnowledgeBaseResponse(BaseModel):
    """Response to knowledge-base-request"""
    documents: List[DocumentObject]
    message: Optional[str] = None
    model_config = ConfigDict(populate_by_name=True)


class EndpointingResponse(BaseModel):
    """Response to endpointing request"""
    timeout_seconds: float = Field(..., alias="timeoutSeconds")
    model_config = ConfigDict(populate_by_name=True)
