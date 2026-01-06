from datetime import datetime
from decimal import Decimal
from enum import Enum as PyEnum
from typing import Optional, List

from sqlalchemy import String, BigInteger, Numeric, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from infrastructure.db import CustomBase


# Enums
class AccountStatus(PyEnum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    CLOSED = "CLOSED"


class CallStatus(PyEnum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class TransactionType(PyEnum):
    TRANSFER = "TRANSFER"
    DEPOSIT = "DEPOSIT"
    WITHDRAWAL = "WITHDRAWAL"


class TransactionStatus(PyEnum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class BillType(PyEnum):
    ELECTRICITY = "ELECTRICITY"
    WATER = "WATER"
    GAS = "GAS"
    INTERNET = "INTERNET"
    TV = "TV"
    PHONE = "PHONE"
    PARKING = "PARKING"
    OTHER = "OTHER"


class BillStatus(PyEnum):
    PENDING = "PENDING"
    PAID = "PAID"
    OVERDUE = "OVERDUE"


class ToolType(PyEnum):
    TRANSFER_MONEY_OWN_ACCOUNTS = "transfer_money_own_accounts"
    TRANSFER_MONEY_TO_USER = "transfer_money_to_user"
    PAY_BILL = "pay_bill"
    LIST_BILLS = "list_bills"
    LIST_ACCOUNTS = "list_accounts"
    OPEN_ACCOUNT = "open_account"
    CLOSE_ACCOUNT = "close_account"
    FREEZE_ACCOUNT = "freeze_account"
    UNFREEZE_ACCOUNT = "unfreeze_account"
    CHECK_BALANCE = "check_balance"
    GET_HISTORY = "get_history"


# Models
class BankAccount(CustomBase):
    __tablename__ = "bank_accounts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    account_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    user_id: Mapped[str] = mapped_column(String(255), index=True)

    balance: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=Decimal("0.00"))
    status: Mapped[AccountStatus] = mapped_column(default=AccountStatus.ACTIVE)

    title: Mapped[str] = mapped_column(String(255))

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    outgoing_transactions: Mapped[List["Transaction"]] = relationship(
        foreign_keys="Transaction.from_account_id", back_populates="from_account"
    )
    incoming_transactions: Mapped[List["Transaction"]] = relationship(
        foreign_keys="Transaction.to_account_id", back_populates="to_account"
    )

    __table_args__ = (Index("ix_account_user_status", "user_id", "status"),)


class Transaction(CustomBase):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    reference: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    from_account_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("bank_accounts.id"), nullable=True, index=True
    )
    to_account_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("bank_accounts.id"), nullable=True, index=True
    )

    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2))

    type: Mapped[TransactionType] = mapped_column()
    status: Mapped[TransactionStatus] = mapped_column(default=TransactionStatus.PENDING)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    call_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("calls.id"), nullable=True, index=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    from_account: Mapped[Optional["BankAccount"]] = relationship(
        foreign_keys=[from_account_id], back_populates="outgoing_transactions"
    )
    to_account: Mapped[Optional["BankAccount"]] = relationship(
        foreign_keys=[to_account_id], back_populates="incoming_transactions"
    )
    call: Mapped[Optional["Call"]] = relationship(back_populates="transactions")

    __table_args__ = (
        Index("ix_transaction_from_created", "from_account_id", "created_at"),
        Index("ix_transaction_to_created", "to_account_id", "created_at"),
        Index("ix_transaction_status", "status"),
    )


class Bill(CustomBase):
    __tablename__ = "bills"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), index=True)
    type: Mapped[BillType] = mapped_column()
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    due_date: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[BillStatus] = mapped_column(default=BillStatus.PENDING)

    # Payment tracking
    paid_from_account_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("bank_accounts.id"), nullable=True, index=True
    )
    transaction_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("transactions.id"), nullable=True, index=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    paid_from_account: Mapped[Optional["BankAccount"]] = relationship(
        foreign_keys=[paid_from_account_id]
    )

    __table_args__ = (Index("ix_bill_user_status", "user_id", "status"),)


class Call(CustomBase):
    __tablename__ = "calls"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), index=True)

    phone_number: Mapped[str] = mapped_column(String(255))

    scheduled_at: Mapped[datetime] = mapped_column(DateTime)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    status: Mapped[CallStatus] = mapped_column(default=CallStatus.SCHEDULED)
    call_sid: Mapped[Optional[str]] = mapped_column(
        String(255), unique=True, nullable=True
    )
    duration_seconds: Mapped[Optional[int]] = mapped_column(nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    language: Mapped[str] = mapped_column(String(255))
    customer_name: Mapped[str] = mapped_column(String(255))

    # Relationships
    transcriptions: Mapped[List["CallTranscription"]] = relationship(
        back_populates="call", cascade="all, delete-orphan"
    )
    transactions: Mapped[List["Transaction"]] = relationship(back_populates="call")

    __table_args__ = (Index("ix_call_user_scheduled", "user_id", "scheduled_at"),)


class CallTranscription(CustomBase):
    __tablename__ = "call_transcriptions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    call_id: Mapped[int] = mapped_column(
        ForeignKey("calls.id", ondelete="CASCADE"), index=True
    )

    sequence: Mapped[int] = mapped_column()
    speaker: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    text: Mapped[str] = mapped_column(Text)
    confidence: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4), nullable=True)

    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    offset_ms: Mapped[Optional[int]] = mapped_column(
        nullable=True
    )  # Milliseconds from call start

    # Relationships
    call: Mapped["Call"] = relationship(back_populates="transcriptions")

    __table_args__ = (Index("ix_transcription_call_seq", "call_id", "sequence"),)
