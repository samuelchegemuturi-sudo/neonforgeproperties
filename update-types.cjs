const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'integrations', 'supabase', 'types.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add enabled_modules to companies
content = content.replace(
  /      companies: \{\s+Row: \{\s+/,
  `      companies: {
        Row: {
          enabled_modules: string[]
`
);
content = content.replace(
  /      companies: \{[\s\S]*?Insert: \{\s+/,
  (match) => match + `          enabled_modules?: string[]\n`
);
content = content.replace(
  /      companies: \{[\s\S]*?Update: \{\s+/,
  (match) => match + `          enabled_modules?: string[]\n`
);

// 2. Add branch_id to properties
content = content.replace(
  /      properties: \{\s+Row: \{\s+/,
  `      properties: {
        Row: {
          branch_id: string | null
`
);
content = content.replace(
  /      properties: \{[\s\S]*?Insert: \{\s+/,
  (match) => match + `          branch_id?: string | null\n`
);
content = content.replace(
  /      properties: \{[\s\S]*?Update: \{\s+/,
  (match) => match + `          branch_id?: string | null\n`
);

// 3. Add plan_id and discount_percentage to platform_subscriptions
content = content.replace(
  /      platform_subscriptions: \{\s+Row: \{\s+/,
  `      platform_subscriptions: {
        Row: {
          plan_id: string | null
          discount_percentage: number | null
`
);
content = content.replace(
  /      platform_subscriptions: \{[\s\S]*?Insert: \{\s+/,
  (match) => match + `          plan_id?: string | null\n          discount_percentage?: number | null\n`
);
content = content.replace(
  /      platform_subscriptions: \{[\s\S]*?Update: \{\s+/,
  (match) => match + `          plan_id?: string | null\n          discount_percentage?: number | null\n`
);

// 4. Add branches and tenant_invoices and subscription_plans to Tables
const branchesAndInvoices = `
      branches: {
        Row: {
          id: string
          company_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      tenant_invoices: {
        Row: {
          id: string
          company_id: string
          property_id: string | null
          unit_id: string | null
          lease_id: string | null
          tenant_id: string | null
          invoice_number: string | null
          amount: number
          tax_rate: number
          tax_amount: number | null
          description: string
          notes: string | null
          due_date: string
          status: "unpaid" | "partial" | "paid" | "void"
          buyer_pin: string | null
          line_items: any[]
          payment_reference: string | null
          paid_at: string | null
          digitax_control_number: string | null
          digitax_qr_code_url: string | null
          digitax_invoice_number: string | null
          digitax_fiscalized_at: string | null
          digitax_status: "pending" | "submitted" | "fiscalized" | "failed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          property_id?: string | null
          unit_id?: string | null
          lease_id?: string | null
          tenant_id?: string | null
          invoice_number?: string | null
          amount: number
          tax_rate?: number
          tax_amount?: number | null
          description: string
          notes?: string | null
          due_date: string
          status?: "unpaid" | "partial" | "paid" | "void"
          buyer_pin?: string | null
          line_items?: any[]
          payment_reference?: string | null
          paid_at?: string | null
          digitax_control_number?: string | null
          digitax_qr_code_url?: string | null
          digitax_invoice_number?: string | null
          digitax_fiscalized_at?: string | null
          digitax_status?: "pending" | "submitted" | "fiscalized" | "failed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          property_id?: string | null
          unit_id?: string | null
          lease_id?: string | null
          tenant_id?: string | null
          invoice_number?: string | null
          amount?: number
          tax_rate?: number
          tax_amount?: number | null
          description?: string
          notes?: string | null
          due_date?: string
          status?: "unpaid" | "partial" | "paid" | "void"
          buyer_pin?: string | null
          line_items?: any[]
          payment_reference?: string | null
          paid_at?: string | null
          digitax_control_number?: string | null
          digitax_qr_code_url?: string | null
          digitax_invoice_number?: string | null
          digitax_fiscalized_at?: string | null
          digitax_status?: "pending" | "submitted" | "fiscalized" | "failed"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_invoices_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          }
        ]
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          base_price_monthly: number
          description: string | null
          limits: any
          features: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          base_price_monthly?: number
          description?: string | null
          limits?: any
          features?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          base_price_monthly?: number
          description?: string | null
          limits?: any
          features?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {`;

content = content.replace(/\r?\n\s*\}\r?\n\s*Views: \{/, "\n" + branchesAndInvoices);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated types.ts');
