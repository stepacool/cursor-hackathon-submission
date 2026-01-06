export interface BankAccount {
  // Database fields
  id: number;
  account_number: string;
  user_id: string;
  title: string;
  balance: string; // decimal comes as string from PostgreSQL
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  created_at: string; // datetime comes as string from PostgreSQL
  updated_at: string;
  closed_at: string | null;
}

export interface BankAccountsResponse {
  success: boolean;
  data?: BankAccount | BankAccount[];
  error?: string;
  message?: string;
}

export interface CreateAccountRequest {
  title: string;
  initialBalance?: number;
}

export interface UpdateAccountRequest {
  action: 'freeze' | 'unfreeze' | 'close';
}

