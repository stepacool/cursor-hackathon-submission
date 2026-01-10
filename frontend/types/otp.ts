export interface OTP {
  id: number;
  user_id: string;
  token: string;
  transaction_id: number | null;
  status: 'PENDING' | 'USED' | 'EXPIRED';
  expires_at: string;
  created_at: string;
  updated_at: string;
  used_at: string | null;
  // Transaction details (joined)
  transaction_amount?: string;
  transaction_description?: string;
  transaction_status?: string;
  from_account_title?: string;
  to_account_title?: string;
}

export interface OTPsResponse {
  success: boolean;
  data?: OTP[];
  error?: string;
}
