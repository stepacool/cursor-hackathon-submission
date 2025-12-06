from entrypoints.api.serializers import (
    TransferMoneyToolCallParameters,
)
from infrastructure.repositories import (
    get_account_by_title,
    transfer_money_between_accounts,
)


async def transfer_money_between_own_accounts(
    call_id: int,
    tool_invocation_id: int,
    user_id: str,
    tool_parameters: TransferMoneyToolCallParameters,
) -> str:
    """Transfer money between accounts"""
    from_account_label = tool_parameters.from_account_label
    to_account_label = tool_parameters.to_account_label
    amount = tool_parameters.amount

    from_account = await get_account_by_title(from_account_label)
    to_account = await get_account_by_title(to_account_label)

    if not from_account:
        return "From account not found"

    if not to_account:
        return "To account not found"

    if from_account.user_id != user_id:
        return "From account does not belong to the user"

    if from_account.balance < amount:
        return "Insufficient balance"

    transaction = await transfer_money_between_accounts(
        from_account.id,
        to_account.id,
        amount,
        call_id=call_id,
        tool_invocation_id=tool_invocation_id,
    )

    if not transaction:
        return "Failed to transfer money"

    return "Money transferred successfully"
