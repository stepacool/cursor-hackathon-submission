from entrypoints.api.serializers import TransferMoneyOwnAccountsToolCallParameters
from infrastructure.repositories import (
    get_account_by_title,
    transfer_money_between_accounts,
)


async def transfer_money_between_own_accounts(
    call_id: int,
    tool_invocation_id: int,
    user_id: str,
    tool_parameters: TransferMoneyOwnAccountsToolCallParameters,
) -> str:
    """Transfer money between own accounts"""
    from_account = await get_account_by_title(tool_parameters.from_account_title)
    to_account = await get_account_by_title(tool_parameters.to_account_title)

    if not from_account:
        return "From account not found"

    if not to_account:
        return "To account not found"

    if from_account.user_id != user_id:
        return "From account does not belong to the user"

    if from_account.balance < tool_parameters.amount:
        return "Insufficient balance"

    transaction = await transfer_money_between_accounts(
        from_account.id,
        to_account.id,
        tool_parameters.amount,
        call_id=call_id,
        tool_invocation_id=tool_invocation_id,
    )

    if not transaction:
        return "Failed to transfer money"

    return "Money transferred successfully"
