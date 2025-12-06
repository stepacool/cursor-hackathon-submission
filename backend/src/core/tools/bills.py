from decimal import Decimal
from datetime import datetime

from entrypoints.api.serializers import PayBillToolCallParameters
from infrastructure.models import AccountStatus, BillType, BillStatus, TransactionType
from infrastructure.repositories import (
    get_account_by_title_and_user,
    get_outstanding_bills,
    get_outstanding_bill_by_type,
    pay_bill,
    create_transaction,
    update_account_balance,
)


async def list_outstanding_bills(
    user_id: str,
) -> str:
    """List all outstanding bills for the user"""
    bills = await get_outstanding_bills(user_id)

    if not bills:
        return "You have no outstanding bills."

    bill_list = []
    for bill in bills:
        status_text = "overdue" if bill.status == BillStatus.OVERDUE else "pending"
        description = f" - {bill.description}" if bill.description else ""
        due_date_str = bill.due_date.strftime("%Y-%m-%d")
        bill_list.append(
            f"- {bill.type.value.capitalize()}{description}: {bill.amount} (due: {due_date_str}, {status_text})"
        )

    header = f"You have {len(bills)} outstanding bill(s):\n"
    return header + "\n".join(bill_list)


async def pay_outstanding_bill(
    call_id: int,
    user_id: str,
    tool_parameters: PayBillToolCallParameters,
) -> str:
    """Pay an outstanding bill of a specific type"""
    # Validate bill type
    try:
        bill_type = BillType(tool_parameters.bill_type.lower())
    except ValueError:
        valid_types = ", ".join([t.value for t in BillType])
        return f"Invalid bill type '{tool_parameters.bill_type}'. Valid types are: {valid_types}"

    # Get the user's account
    from_account = await get_account_by_title_and_user(
        tool_parameters.from_account_title, user_id
    )

    if not from_account:
        return f"Account '{tool_parameters.from_account_title}' not found"

    if from_account.status != AccountStatus.ACTIVE:
        return f"Account '{tool_parameters.from_account_title}' is not active"

    # Find the outstanding bill
    bill = await get_outstanding_bill_by_type(user_id, bill_type)

    if not bill:
        return f"No outstanding {bill_type.value} bill found"

    # Check sufficient balance
    if from_account.balance < bill.amount:
        return f"Insufficient balance. Bill amount: {bill.amount}, Available: {from_account.balance}"

    # Deduct from account
    new_balance = from_account.balance - bill.amount
    await update_account_balance(from_account.id, new_balance)

    # Create transaction record
    transaction = await create_transaction(
        reference=f"BILL-{bill_type.value.upper()}-{bill.id}-{datetime.utcnow().timestamp()}",
        amount=bill.amount,
        transaction_type=TransactionType.WITHDRAWAL,
        from_account_id=from_account.id,
        to_account_id=None,
        description=f"Payment for {bill_type.value} bill",
        call_id=call_id,
    )

    # Mark bill as paid
    await pay_bill(bill.id, from_account.id, transaction.id)

    return f"Successfully paid {bill_type.value} bill of {bill.amount} from {tool_parameters.from_account_title}"
