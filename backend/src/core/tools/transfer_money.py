from datetime import datetime
from decimal import Decimal

from entrypoints.api.serializers import (
    TransferMoneyOwnAccountsToolCallParameters,
    TransferMoneyToUserToolCallParameters,
    ConfirmTransferOTPToolCallParameters,
)
from infrastructure.models import AccountStatus, TransactionStatus, TransactionType
from infrastructure.repositories import (
    create_otp,
    create_transaction,
    get_account_by_title_and_user,
    get_default_account_for_user,
    get_transaction_by_id,
    get_user_by_phone_number,
    transfer_money_between_accounts,
    update_account_balance,
    update_transaction_status,
    verify_and_use_otp,
)


async def transfer_money_between_own_accounts(
    call_id: int,
    user_id: str,
    tool_parameters: TransferMoneyOwnAccountsToolCallParameters,
) -> str:
    """Transfer money between own accounts"""
    from_account = await get_account_by_title_and_user(
        tool_parameters.from_account_title, user_id
    )
    to_account = await get_account_by_title_and_user(
        tool_parameters.to_account_title, user_id
    )

    if not from_account:
        return f"Account '{tool_parameters.from_account_title}' not found"

    if not to_account:
        return f"Account '{tool_parameters.to_account_title}' not found"

    if from_account.status != AccountStatus.ACTIVE:
        return f"Account '{tool_parameters.from_account_title}' is not active"

    if to_account.status != AccountStatus.ACTIVE:
        return f"Account '{tool_parameters.to_account_title}' is not active"

    amount = Decimal(str(tool_parameters.amount))
    if from_account.balance < amount:
        return f"Insufficient balance. Available: {from_account.balance}"

    transaction = await transfer_money_between_accounts(
        from_account.id,
        to_account.id,
        amount,
        call_id=call_id,
    )

    if not transaction:
        return "Failed to transfer money"

    return f"Successfully transferred {tool_parameters.amount} from {tool_parameters.from_account_title} to {tool_parameters.to_account_title}"


async def transfer_money_to_user(
    call_id: int,
    user_id: str,
    tool_parameters: TransferMoneyToUserToolCallParameters,
) -> str:
    """Transfer money to another user by name or phone number"""
    from_account = await get_account_by_title_and_user(
        tool_parameters.from_account_title, user_id
    )

    if not from_account:
        return f"Account '{tool_parameters.from_account_title}' not found"

    if from_account.status != AccountStatus.ACTIVE:
        return f"Account '{tool_parameters.from_account_title}' is not active"

    amount = Decimal(str(tool_parameters.amount))
    if from_account.balance < amount:
        return f"Insufficient balance. Available: {from_account.balance}"

    # Try to find recipient by phone number
    recipient_identifier = tool_parameters.recipient_identifier
    recipient_user_id = await get_user_by_phone_number(recipient_identifier)

    if not recipient_user_id:
        return f"Recipient '{recipient_identifier}' not found"

    # Get recipient's default account
    recipient_account = await get_default_account_for_user(recipient_user_id)

    if not recipient_account:
        return f"Recipient '{recipient_identifier}' has no active account"

    transaction = await transfer_money_between_accounts(
        from_account.id,
        recipient_account.id,
        amount,
        call_id=call_id,
    )

    if not transaction:
        return "Failed to transfer money"

    return (
        f"Successfully transferred {tool_parameters.amount} to {recipient_identifier}"
    )


async def request_transfer_own_accounts(
    call_id: int,
    user_id: str,
    tool_parameters: TransferMoneyOwnAccountsToolCallParameters,
) -> str:
    """Request a transfer between own accounts - creates pending transaction and OTP"""
    from_account = await get_account_by_title_and_user(
        tool_parameters.from_account_title, user_id
    )
    to_account = await get_account_by_title_and_user(
        tool_parameters.to_account_title, user_id
    )

    if not from_account:
        return f"Account '{tool_parameters.from_account_title}' not found"

    if not to_account:
        return f"Account '{tool_parameters.to_account_title}' not found"

    if from_account.status != AccountStatus.ACTIVE:
        return f"Account '{tool_parameters.from_account_title}' is not active"

    if to_account.status != AccountStatus.ACTIVE:
        return f"Account '{tool_parameters.to_account_title}' is not active"

    amount = Decimal(str(tool_parameters.amount))
    if from_account.balance < amount:
        return f"Insufficient balance. Available: {from_account.balance}"

    # Create pending transaction
    reference = f"TRANSFER-{from_account.account_number}-{to_account.account_number}-{amount}-{datetime.utcnow().timestamp()}"
    transaction = await create_transaction(
        reference=reference,
        amount=amount,
        transaction_type=TransactionType.TRANSFER,
        from_account_id=from_account.id,
        to_account_id=to_account.id,
        description=f"Pending transfer from {tool_parameters.from_account_title} to {tool_parameters.to_account_title}",
        call_id=call_id,
    )

    if not transaction:
        return "Failed to create transfer request"

    # Create OTP for this transaction
    otp = await create_otp(user_id=user_id, transaction_id=transaction.id)

    return (
        f"Transaction ready: Transfer {tool_parameters.amount} from {tool_parameters.from_account_title} "
        f"to {tool_parameters.to_account_title}. An OTP has been generated. "
        f"Your OTP is {otp.token}. Please provide this OTP to confirm the transaction."
    )


async def request_transfer_to_user(
    call_id: int,
    user_id: str,
    tool_parameters: TransferMoneyToUserToolCallParameters,
) -> str:
    """Request a transfer to another user - creates pending transaction and OTP"""
    from_account = await get_account_by_title_and_user(
        tool_parameters.from_account_title, user_id
    )

    if not from_account:
        return f"Account '{tool_parameters.from_account_title}' not found"

    if from_account.status != AccountStatus.ACTIVE:
        return f"Account '{tool_parameters.from_account_title}' is not active"

    amount = Decimal(str(tool_parameters.amount))
    if from_account.balance < amount:
        return f"Insufficient balance. Available: {from_account.balance}"

    # Try to find recipient by phone number
    recipient_identifier = tool_parameters.recipient_identifier
    recipient_user_id = await get_user_by_phone_number(recipient_identifier)

    if not recipient_user_id:
        return f"Recipient '{recipient_identifier}' not found"

    # Get recipient's default account
    recipient_account = await get_default_account_for_user(recipient_user_id)

    if not recipient_account:
        return f"Recipient '{recipient_identifier}' has no active account"

    # Create pending transaction
    reference = f"TRANSFER-{from_account.account_number}-{recipient_account.account_number}-{amount}-{datetime.utcnow().timestamp()}"
    transaction = await create_transaction(
        reference=reference,
        amount=amount,
        transaction_type=TransactionType.TRANSFER,
        from_account_id=from_account.id,
        to_account_id=recipient_account.id,
        description=f"Pending transfer to {recipient_identifier}",
        call_id=call_id,
    )

    if not transaction:
        return "Failed to create transfer request"

    # Create OTP for this transaction
    otp = await create_otp(user_id=user_id, transaction_id=transaction.id)

    return (
        f"Transaction ready: Transfer {tool_parameters.amount} to {recipient_identifier}. "
        f"An OTP has been generated. Your OTP is {otp.token}. "
        f"Please provide this OTP to confirm the transaction."
    )


async def confirm_transfer_otp(
    call_id: int,
    user_id: str,
    tool_parameters: ConfirmTransferOTPToolCallParameters,
) -> str:
    """Confirm a pending transfer using OTP"""
    otp_token = tool_parameters.otp_token
    
    # Verify and use the OTP
    otp = await verify_and_use_otp(user_id=user_id, token=otp_token)
    
    if not otp:
        return "Invalid or expired OTP. Please request a new transfer."
    
    if not otp.transaction_id:
        return "No pending transaction found for this OTP."
    
    # Get the pending transaction
    transaction = await get_transaction_by_id(otp.transaction_id)
    
    if not transaction:
        return "Transaction not found."
    
    if transaction.status != TransactionStatus.PENDING:
        return f"Transaction is no longer pending. Current status: {transaction.status.value}"
    
    # Execute the transfer - update balances
    from_account = transaction.from_account
    to_account = transaction.to_account
    
    if not from_account or not to_account:
        await update_transaction_status(transaction.id, TransactionStatus.FAILED)
        return "Transaction accounts not found."
    
    # Re-check balance
    if from_account.balance < transaction.amount:
        await update_transaction_status(transaction.id, TransactionStatus.FAILED)
        return f"Insufficient balance. Available: {from_account.balance}"
    
    # Update balances
    new_from_balance = from_account.balance - transaction.amount
    new_to_balance = to_account.balance + transaction.amount
    
    await update_account_balance(from_account.id, new_from_balance)
    await update_account_balance(to_account.id, new_to_balance)
    
    # Mark transaction as completed
    await update_transaction_status(transaction.id, TransactionStatus.COMPLETED)
    
    return (
        f"Transaction confirmed! Successfully transferred {transaction.amount} "
        f"from {from_account.title} to {to_account.title}."
    )
