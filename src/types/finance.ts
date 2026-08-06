export type TenantInvoice = {
  id: string;
  company_id: string;
  property_id: string | null;
  unit_id: string | null;
  lease_id: string | null;
  tenant_id: string | null;
  invoice_number: string | null;
  amount: number;
  tax_rate: number;
  tax_amount: number | null;
  description: string;
  notes: string | null;
  due_date: string;
  status: 'unpaid' | 'partial' | 'paid' | 'void';
  buyer_pin: string | null;
  line_items: Array<{ description: string; quantity: number; unit_price: number }>;
  payment_reference: string | null;
  paid_at: string | null;
  // DigiTax / eTIMS
  digitax_control_number: string | null;
  digitax_qr_code_url: string | null;
  digitax_invoice_number: string | null;
  digitax_fiscalized_at: string | null;
  digitax_status: 'pending' | 'submitted' | 'fiscalized' | 'failed';
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
