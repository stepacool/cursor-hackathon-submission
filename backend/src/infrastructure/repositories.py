from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.orm import selectinload

from infrastructure.db import session_maker
from .models import (
    BankAccount,
    Bill,
    Call,
    CallTranscription,
    Transaction,
    AccountStatus,
    BillStatus,
    BillType,
    CallStatus,
    TransactionStatus,
    TransactionType,
)


# Call Repository Functions


async def get_call_by_id(call_id: int) -> Optional[Call]:
    """Get a call by ID with all relationships loaded."""
    async with session_maker() as session:
        stmt = (
            select(Call)
            .where(Call.id == call_id)
            .options(
                selectinload(Call.transcriptions),
                selectinload(Call.transactions),
            )
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()


async def get_call_by_phone_number(phone_number: str) -> Optional[Call]:
    """Get a call by phone number."""
    async with session_maker() as session:
        stmt = select(Call).where(
            Call.phone_number == phone_number,
        ).order_by(Call.created_at.desc()).limit(1)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()


async def get_scheduled_calls() -> list[Call]:
    async with session_maker() as session:
        stmt = select(Call).where(
            Call.status.in_([CallStatus.SCHEDULED, CallStatus.SCHEDULED.value])
        )
        result = await session.execute(stmt)
        return list(result.scalars().all())



async def get_calls_by_user(
    user_id: str, status: Optional[CallStatus] = None, limit: int = 50
) -> List[Call]:
    """Get calls for a user, optionally filtered by status."""
    async with session_maker() as session:
        stmt = select(Call).where(Call.user_id == user_id)

        if status:
            stmt = stmt.where(Call.status == status)

        stmt = stmt.order_by(desc(Call.scheduled_at)).limit(limit)
        result = await session.execute(stmt)
        return list(result.scalars().all())


async def create_call(
    user_id: str,
    phone_number: str,
    scheduled_at: datetime,
    language: str,
    customer_name: str,
) -> Call:
    """Create a new call."""
    async with session_maker() as session:
        call = Call(
            user_id=user_id,
            phone_number=phone_number,
            scheduled_at=scheduled_at,
            language=language,
            customer_name=customer_name,
            status=CallStatus.SCHEDULED,
        )
        session.add(call)
        await session.commit()
        await session.refresh(call)
        return call


async def update_call_status(
    call_id: int,
    status: CallStatus,
    call_sid: Optional[str] = None,
    started_at: Optional[datetime] = None,
    ended_at: Optional[datetime] = None,
    duration_seconds: Optional[int] = None,
) -> Optional[Call]:
    """Update call status and related fields."""
    async with session_maker() as session:
        call = await session.get(Call, call_id)
        if not call:
            return None

        call.status = status
        if call_sid:
            call.call_sid = call_sid
        if started_at:
            call.started_at = started_at
        if ended_at:
            call.ended_at = ended_at
        if duration_seconds is not None:
            call.duration_seconds = duration_seconds

        await session.commit()
        await session.refresh(call)
        return call


# Bank Account Repository Functions


async def get_account_by_id(account_id: int) -> Optional[BankAccount]:
    """Get a bank account by ID."""
    async with session_maker() as session:
        return await session.get(BankAccount, account_id)


async def get_account_by_title(title: str) -> Optional[BankAccount]:
    """Get a bank account by title."""
    async with session_maker() as session:
        stmt = select(BankAccount).where(BankAccount.title == title)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()


async def get_account_by_number(account_number: str) -> Optional[BankAccount]:
    """Get a bank account by account number."""
    async with session_maker() as session:
        stmt = select(BankAccount).where(BankAccount.account_number == account_number)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()


async def get_accounts_by_user(
    user_id: str, status: Optional[AccountStatus] = None
) -> List[BankAccount]:
    """Get all accounts for a user, optionally filtered by status."""
    async with session_maker() as session:
        stmt = select(BankAccount).where(BankAccount.user_id == user_id)

        if status:
            stmt = stmt.where(BankAccount.status == status)

        result = await session.execute(stmt)
        return list(result.scalars().all())


async def create_account(
    account_number: str,
    user_id: str,
    title: str,
    initial_balance: Decimal = Decimal("0.00"),
) -> BankAccount:
    """Create a new bank account."""
    async with session_maker() as session:
        account = BankAccount(
            account_number=account_number,
            user_id=user_id,
            balance=initial_balance,
            status=AccountStatus.ACTIVE,
            title=title,
        )
        session.add(account)
        await session.commit()
        await session.refresh(account)
        return account


async def update_account_balance(
    account_id: int, new_balance: Decimal
) -> Optional[BankAccount]:
    """Update account balance."""
    async with session_maker() as session:
        account = await session.get(BankAccount, account_id)
        if not account:
            return None

        account.balance = new_balance
        account.updated_at = datetime.utcnow()
        await session.commit()
        await session.refresh(account)
        return account


async def transfer_money_between_accounts(
    from_account_id: int,
    to_account_id: int,
    amount: Decimal,
    call_id: Optional[int] = None,
) -> Optional[Transaction]:
    """Transfer money between accounts."""
    async with session_maker() as session:
        from_account = await session.get(BankAccount, from_account_id)
        to_account = await session.get(BankAccount, to_account_id)

        from_account.balance -= amount
        to_account.balance += amount
        from_account.updated_at = datetime.utcnow()
        to_account.updated_at = datetime.utcnow()
        await session.commit()
        await session.refresh(from_account)
        await session.refresh(to_account)
        return await create_transaction(
            reference=f"TRANSFER-{from_account.account_number}-{to_account.account_number}-{amount}-{datetime.utcnow().timestamp()}",
            amount=amount,
            transaction_type=TransactionType.TRANSFER,
            from_account_id=from_account_id,
            to_account_id=to_account_id,
            description=f"Transfer from {from_account.account_number} to {to_account.account_number}",
            call_id=call_id,
        )


# Transaction Repository Functions


async def get_transaction_by_id(transaction_id: int) -> Optional[Transaction]:
    """Get a transaction by ID with relationships."""
    async with session_maker() as session:
        stmt = (
            select(Transaction)
            .where(Transaction.id == transaction_id)
            .options(
                selectinload(Transaction.from_account),
                selectinload(Transaction.to_account),
            )
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()


async def get_transaction_by_reference(reference: str) -> Optional[Transaction]:
    """Get a transaction by reference number."""
    async with session_maker() as session:
        stmt = select(Transaction).where(Transaction.reference == reference)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()


async def get_account_transactions(
    account_id: int, limit: int = 100, status: Optional[TransactionStatus] = None
) -> List[Transaction]:
    """Get transactions for an account (both incoming and outgoing)."""
    async with session_maker() as session:
        stmt = select(Transaction).where(
            or_(
                Transaction.from_account_id == account_id,
                Transaction.to_account_id == account_id,
            )
        )

        if status:
            stmt = stmt.where(Transaction.status == status)

        stmt = stmt.order_by(desc(Transaction.created_at)).limit(limit)
        result = await session.execute(stmt)
        return list(result.scalars().all())


async def create_transaction(
    reference: str,
    amount: Decimal,
    transaction_type: str,
    from_account_id: Optional[int] = None,
    to_account_id: Optional[int] = None,
    description: Optional[str] = None,
    call_id: Optional[int] = None,
) -> Transaction:
    """Create a new transaction."""
    async with session_maker() as session:
        transaction = Transaction(
            reference=reference,
            from_account_id=from_account_id,
            to_account_id=to_account_id,
            amount=amount,
            type=transaction_type,
            description=description,
            call_id=call_id,
            status=TransactionStatus.PENDING,
        )
        session.add(transaction)
        await session.commit()
        await session.refresh(transaction)
        return transaction


async def update_transaction_status(
    transaction_id: int,
    status: TransactionStatus,
    completed_at: Optional[datetime] = None,
) -> Optional[Transaction]:
    """Update transaction status."""
    async with session_maker() as session:
        transaction = await session.get(Transaction, transaction_id)
        if not transaction:
            return None

        transaction.status = status
        if completed_at:
            transaction.completed_at = completed_at
        elif status == TransactionStatus.COMPLETED:
            transaction.completed_at = datetime.utcnow()

        await session.commit()
        await session.refresh(transaction)
        return transaction


# Call Transcription Repository Functions


async def add_transcription(
    call_id: int,
    sequence: int,
    text: str,
    speaker: Optional[str] = None,
    confidence: Optional[Decimal] = None,
    offset_ms: Optional[int] = None,
) -> CallTranscription:
    """Add a transcription segment to a call."""
    async with session_maker() as session:
        transcription = CallTranscription(
            call_id=call_id,
            sequence=sequence,
            text=text,
            speaker=speaker,
            confidence=confidence,
            offset_ms=offset_ms,
        )
        session.add(transcription)
        await session.commit()
        await session.refresh(transcription)
        return transcription


async def get_call_transcriptions(call_id: int) -> List[CallTranscription]:
    """Get all transcription segments for a call, ordered by sequence."""
    async with session_maker() as session:
        stmt = (
            select(CallTranscription)
            .where(CallTranscription.call_id == call_id)
            .order_by(CallTranscription.sequence)
        )
        result = await session.execute(stmt)
        return list(result.scalars().all())


# Bill Repository Functions


async def get_bill_by_id(bill_id: int) -> Optional[Bill]:
    """Get a bill by ID."""
    async with session_maker() as session:
        return await session.get(Bill, bill_id)


async def get_bills_by_user(
    user_id: str,
    status: Optional[BillStatus] = None,
    bill_type: Optional[BillType] = None,
) -> List[Bill]:
    """Get all bills for a user, optionally filtered by status and type."""
    async with session_maker() as session:
        stmt = select(Bill).where(Bill.user_id == user_id)

        if status:
            stmt = stmt.where(Bill.status == status)
        if bill_type:
            stmt = stmt.where(Bill.type == bill_type)

        stmt = stmt.order_by(desc(Bill.due_date))
        result = await session.execute(stmt)
        return list(result.scalars().all())


async def get_outstanding_bills(user_id: str) -> List[Bill]:
    """Get all outstanding (pending or overdue) bills for a user."""
    async with session_maker() as session:
        stmt = (
            select(Bill)
            .where(Bill.user_id == user_id)
            .where(
                or_(
                    Bill.status == BillStatus.PENDING, Bill.status == BillStatus.OVERDUE
                )
            )
            .order_by(Bill.due_date)
        )
        result = await session.execute(stmt)
        return list(result.scalars().all())


async def get_outstanding_bill_by_type(
    user_id: str, bill_type: BillType
) -> Optional[Bill]:
    """Get an outstanding bill of a specific type for a user."""
    async with session_maker() as session:
        stmt = (
            select(Bill)
            .where(Bill.user_id == user_id)
            .where(Bill.type == bill_type)
            .where(
                or_(
                    Bill.status == BillStatus.PENDING, Bill.status == BillStatus.OVERDUE
                )
            )
            .order_by(Bill.due_date)
            .limit(1)
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()


async def create_bill(
    user_id: str,
    bill_type: BillType,
    amount: Decimal,
    due_date: datetime,
    description: Optional[str] = None,
) -> Bill:
    """Create a new bill."""
    async with session_maker() as session:
        bill = Bill(
            user_id=user_id,
            type=bill_type,
            amount=amount,
            due_date=due_date,
            description=description,
            status=BillStatus.PENDING,
        )
        session.add(bill)
        await session.commit()
        await session.refresh(bill)
        return bill


async def pay_bill(
    bill_id: int,
    from_account_id: int,
    transaction_id: int,
) -> Optional[Bill]:
    """Mark a bill as paid."""
    async with session_maker() as session:
        bill = await session.get(Bill, bill_id)
        if not bill:
            return None

        bill.status = BillStatus.PAID
        bill.paid_from_account_id = from_account_id
        bill.transaction_id = transaction_id
        bill.paid_at = datetime.utcnow()
        bill.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(bill)
        return bill


# Extended Account Management Functions


async def get_account_by_title_and_user(
    title: str, user_id: str
) -> Optional[BankAccount]:
    """Get a bank account by title for a specific user."""
    async with session_maker() as session:
        stmt = select(BankAccount).where(
            and_(BankAccount.title == title, BankAccount.user_id == user_id)
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()


async def get_user_by_phone_number(phone_number: str) -> Optional[str]:
    """Get user_id by phone number from the calls table (as a proxy for user lookup)."""
    async with session_maker() as session:
        stmt = select(Call.user_id).where(Call.phone_number == phone_number).limit(1)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()


async def get_default_account_for_user(user_id: str) -> Optional[BankAccount]:
    """Get the first active account for a user (as default account)."""
    async with session_maker() as session:
        stmt = (
            select(BankAccount)
            .where(
                and_(
                    BankAccount.user_id == user_id,
                    BankAccount.status == AccountStatus.ACTIVE,
                )
            )
            .order_by(BankAccount.created_at)
            .limit(1)
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()


async def close_account(
    account_id: int,
    transfer_to_account_id: Optional[int] = None,
) -> Optional[BankAccount]:
    """Close a bank account, optionally transferring remaining balance."""
    async with session_maker() as session:
        account = await session.get(BankAccount, account_id)
        if not account:
            return None

        # If there's a balance and a transfer account is specified
        if account.balance > 0 and transfer_to_account_id:
            transfer_account = await session.get(BankAccount, transfer_to_account_id)
            if transfer_account:
                transfer_account.balance += account.balance
                transfer_account.updated_at = datetime.utcnow()
                account.balance = Decimal("0.00")

        account.status = AccountStatus.CLOSED
        account.closed_at = datetime.utcnow()
        account.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(account)
        return account


async def update_account_status(
    account_id: int, status: AccountStatus
) -> Optional[BankAccount]:
    """Update account status (for freeze/unfreeze)."""
    async with session_maker() as session:
        account = await session.get(BankAccount, account_id)
        if not account:
            return None

        account.status = status
        account.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(account)
        return account


async def generate_account_number() -> str:
    """Generate a unique account number."""
    import random
    import string

    async with session_maker() as session:
        while True:
            # Generate a 12-digit account number
            account_number = "".join(random.choices(string.digits, k=12))
            stmt = select(BankAccount).where(
                BankAccount.account_number == account_number
            )
            result = await session.execute(stmt)
            if not result.scalar_one_or_none():
                return account_number
