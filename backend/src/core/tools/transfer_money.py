from decimal import Decimal

from entrypoints.api.serializers import (
    TransferMoneyOwnAccountsToolCallParameters,
    TransferMoneyToUserToolCallParameters,
)
from infrastructure.models import AccountStatus
from infrastructure.repositories import (
    get_account_by_title_and_user,
    get_default_account_for_user,
    get_user_by_phone_number,
    transfer_money_between_accounts,
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
