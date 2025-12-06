export interface Transaction {
  // Transaction fields
  id: number;
  reference: string;
  from_account_id: number | null;
  to_account_id: number | null;
  amount: string; // decimal comes as string from MySQL
  type: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description: string | null;
  call_id: number | null;
  created_at: string; // datetime comes as string from MySQL
  completed_at: string | null;
  updated_at: string | null;

  // Joined fields from bank_accounts
  from_account_number: string | null;
  from_user_id: string | null;
  to_account_number: string | null;
  to_user_id: string | null;
}

export interface TransactionsResponse {
  success: boolean;
  data?: Transaction[];
  error?: string;
}

export interface CreateTransactionRequest {
  fromAccountId: number;
  toAccountNumber: string;
  amount: number;
  recipientName?: string;
  note?: string;
}

export interface CreateTransactionResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    transaction: Transaction;
    balances?: {
      fromAccount: {
        id: number;
        balance: string;
      };
      toAccount: {
        id: number;
        balance: string;
      };
    };
  };
}
