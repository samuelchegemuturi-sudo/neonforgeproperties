export type TenantInvoice = {
  id: string;
  company_id: string;
  property_id: string;
  unit_id: string | null;
  lease_id: string;
  tenant_id: string;
  amount: number;
  description: string;
  due_date: string;
  status: 'unpaid' | 'partial' | 'paid' | 'void';
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  company_id: string;
  property_id: string | null;
  invoice_id: string | null;
  lease_id: string | null;
  tenant_id: string | null;
  amount: number;
  type: string;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string | null;
  description: string | null;
  transaction_date: string;
  created_at: string;
};

export type Commission = {
  id: string;
  company_id: string;
  property_id: string;
  transaction_id: string;
  amount: number;
  description: string | null;
  status: 'pending' | 'paid';
  created_at: string;
};

export type Disbursement = {
  id: string;
  company_id: string;
  property_id: string;
  amount: number;
  description: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_at: string | null;
  created_at: string;
};
