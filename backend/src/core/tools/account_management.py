from decimal import Decimal

from entrypoints.api.serializers import (
    OpenAccountToolCallParameters,
    CloseAccountToolCallParameters,
    FreezeAccountToolCallParameters,
    UnfreezeAccountToolCallParameters,
)
from infrastructure.models import AccountStatus
from infrastructure.repositories import (
    create_account,
    close_account,
    update_account_status,
    get_account_by_title_and_user,
    get_accounts_by_user,
    generate_account_number,
    transfer_money_between_accounts,
)


async def open_account(
    call_id: int,
    user_id: str,
    tool_parameters: OpenAccountToolCallParameters,
) -> str:
    """Open a new bank account"""
    # Check if account with same title already exists
    existing_account = await get_account_by_title_and_user(
        tool_parameters.account_title, user_id
    )

    if existing_account:
        return f"An account with the name '{tool_parameters.account_title}' already exists"

    # Generate unique account number
    account_number = await generate_account_number()

    # Create the account
    account = await create_account(
        account_number=account_number,
        user_id=user_id,
        title=tool_parameters.account_title,
        initial_balance=Decimal("0.00"),
    )

    return f"Successfully opened account '{tool_parameters.account_title}' with account number {account_number}"


async def close_account_tool(
    call_id: int,
    user_id: str,
    tool_parameters: CloseAccountToolCallParameters,
) -> str:
    """Close a bank account"""
    # Find the account to close
    account = await get_account_by_title_and_user(
        tool_parameters.account_title, user_id
    )

    if not account:
        return f"Account '{tool_parameters.account_title}' not found"

    if account.status == AccountStatus.CLOSED:
        return f"Account '{tool_parameters.account_title}' is already closed"

    # Check if there's a balance that needs to be transferred
    transfer_to_account = None
    if account.balance > 0:
        if not tool_parameters.transfer_to_account_title:
            return f"Account has a balance of {account.balance}. Please specify an account to transfer the remaining funds to."

        transfer_to_account = await get_account_by_title_and_user(
            tool_parameters.transfer_to_account_title, user_id
        )

        if not transfer_to_account:
            return f"Transfer destination account '{tool_parameters.transfer_to_account_title}' not found"

        if transfer_to_account.status != AccountStatus.ACTIVE:
            return f"Transfer destination account '{tool_parameters.transfer_to_account_title}' is not active"

        if transfer_to_account.id == account.id:
            return "Cannot transfer funds to the same account being closed"

        # Transfer the remaining balance
        await transfer_money_between_accounts(
            account.id,
            transfer_to_account.id,
            account.balance,
            call_id=call_id,
        )

    # Close the account
    transfer_to_id = transfer_to_account.id if transfer_to_account else None
    closed_account = await close_account(account.id, transfer_to_id)

    if not closed_account:
        return "Failed to close the account"

    if transfer_to_account:
        return f"Successfully closed account '{tool_parameters.account_title}' and transferred {account.balance} to '{tool_parameters.transfer_to_account_title}'"
    else:
        return f"Successfully closed account '{tool_parameters.account_title}'"


async def freeze_account(
    call_id: int,
    user_id: str,
    tool_parameters: FreezeAccountToolCallParameters,
) -> str:
    """Freeze a bank account"""
    account = await get_account_by_title_and_user(
        tool_parameters.account_title, user_id
    )

    if not account:
        return f"Account '{tool_parameters.account_title}' not found"

    if account.status == AccountStatus.CLOSED:
        return f"Cannot freeze a closed account"

    if account.status == AccountStatus.SUSPENDED:
        return f"Account '{tool_parameters.account_title}' is already frozen"

    updated_account = await update_account_status(account.id, AccountStatus.SUSPENDED)

    if not updated_account:
        return "Failed to freeze the account"

    return f"Successfully froze account '{tool_parameters.account_title}'"


async def unfreeze_account(
    call_id: int,
    user_id: str,
    tool_parameters: UnfreezeAccountToolCallParameters,
) -> str:
    """Unfreeze a bank account"""
    account = await get_account_by_title_and_user(
        tool_parameters.account_title, user_id
    )

    if not account:
        return f"Account '{tool_parameters.account_title}' not found"

    if account.status == AccountStatus.CLOSED:
        return f"Cannot unfreeze a closed account"

    if account.status == AccountStatus.ACTIVE:
        return f"Account '{tool_parameters.account_title}' is not frozen"

    updated_account = await update_account_status(account.id, AccountStatus.ACTIVE)

    if not updated_account:
        return "Failed to unfreeze the account"

    return f"Successfully unfroze account '{tool_parameters.account_title}'"


