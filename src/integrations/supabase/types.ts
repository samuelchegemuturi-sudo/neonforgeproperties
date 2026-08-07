export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          audience: string
          body: string
          created_at: string
          created_by: string | null
          id: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          company_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          company_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          company_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      companies: {
        Row: {
          enabled_modules: string[]
activation_status: string
          auto_disbursement: boolean
          company_type: string
          country: string | null
          created_at: string
          currency: string
          email: string | null
          id: string
          kyc_details: Json
          kyc_status: string
          logo_url: string | null
          name: string
          phone: string | null
          status: string
          updated_at: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
                    enabled_modules?: string[]
activation_status?: string
          auto_disbursement?: boolean
          company_type?: string
          country?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          kyc_details?: Json
          kyc_status?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
                    enabled_modules?: string[]
activation_status?: string
          auto_disbursement?: boolean
          company_type?: string
          country?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          kyc_details?: Json
          kyc_status?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      leases: {
        Row: {
          billing_day: number
          company_id: string
          created_at: string
          deposit: number
          end_date: string | null
          id: string
          notes: string | null
          property_id: string
          rent: number
          service_charge: number
          start_date: string
          status: string
          tenant_id: string
          terminated_at: string | null
          unit_id: string
          updated_at: string
        }
        Insert: {
          billing_day?: number
          company_id: string
          created_at?: string
          deposit?: number
          end_date?: string | null
          id?: string
          notes?: string | null
          property_id: string
          rent?: number
          service_charge?: number
          start_date?: string
          status?: string
          tenant_id: string
          terminated_at?: string | null
          unit_id: string
          updated_at?: string
        }
        Update: {
          billing_day?: number
          company_id?: string
          created_at?: string
          deposit?: number
          end_date?: string | null
          id?: string
          notes?: string | null
          property_id?: string
          rent?: number
          service_charge?: number
          start_date?: string
          status?: string
          tenant_id?: string
          terminated_at?: string | null
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      licences: {
        Row: {
          activation_fee: number
          code: string
          company_id: string
          created_at: string
          id: string
          issued_at: string
          issued_by: string | null
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          activation_fee?: number
          code: string
          company_id: string
          created_at?: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          activation_fee?: number
          code?: string
          company_id?: string
          created_at?: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "licences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          key: string
          label: string
          module: string
          sort_order: number
        }
        Insert: {
          action: string
          key: string
          label: string
          module: string
          sort_order?: number
        }
        Update: {
          action?: string
          key?: string
          label?: string
          module?: string
          sort_order?: number
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          category: string
          key: string
          label: string
          updated_at: string
          value: Json
        }
        Insert: {
          category?: string
          key: string
          label: string
          updated_at?: string
          value: Json
        }
        Update: {
          category?: string
          key?: string
          label?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          bedrooms: number | null
          category: string
          created_at: string
          id: string
          is_configurable: boolean
          label: string
          price_per_unit: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          bedrooms?: number | null
          category?: string
          created_at?: string
          id?: string
          is_configurable?: boolean
          label: string
          price_per_unit?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bedrooms?: number | null
          category?: string
          created_at?: string
          id?: string
          is_configurable?: boolean
          label?: string
          price_per_unit?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_super_admin: boolean
          national_id: string | null
          phone: string | null
          position: string | null
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_super_admin?: boolean
          national_id?: string | null
          phone?: string | null
          position?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_super_admin?: boolean
          national_id?: string | null
          phone?: string | null
          position?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          branch_id: string | null
address: string | null
          city: string | null
          company_id: string
          county: string | null
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string | null
          property_type: string
          status: string
          updated_at: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
                    branch_id?: string | null
address?: string | null
          city?: string | null
          company_id: string
          county?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id?: string | null
          property_type?: string
          status?: string
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
                    branch_id?: string | null
address?: string | null
          city?: string | null
          company_id?: string
          county?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string | null
          property_type?: string
          status?: string
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      property_owners: {
        Row: {
          commission_percent: number
          company_id: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          national_id: string | null
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          commission_percent?: number
          company_id: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          national_id?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          commission_percent?: number
          company_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          national_id?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_owners_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_key: string
          role_id: string
        }
        Insert: {
          permission_key: string
          role_id: string
        }
        Update: {
          permission_key?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_invoices: {
        Row: {
          amount: number
          basis: string
          billable_units: number
          breakdown: Json
          company_id: string
          created_at: string
          id: string
          period_end: string
          period_start: string
          settled_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          basis?: string
          billable_units?: number
          breakdown?: Json
          company_id: string
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          settled_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          basis?: string
          billable_units?: number
          breakdown?: Json
          company_id?: string
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          settled_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          body: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          body?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          body?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          company_id: string
          created_at: string
          email: string | null
          emergency_name: string | null
          emergency_phone: string | null
          full_name: string
          id: string
          kyc_status: string
          national_id: string | null
          notes: string | null
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email?: string | null
          emergency_name?: string | null
          emergency_phone?: string | null
          full_name: string
          id?: string
          kyc_status?: string
          national_id?: string | null
          notes?: string | null
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string | null
          emergency_name?: string | null
          emergency_phone?: string | null
          full_name?: string
          id?: string
          kyc_status?: string
          national_id?: string | null
          notes?: string | null
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_preferences: {
        Row: {
          accent: string
          font: string
          mode: string
          radius: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent?: string
          font?: string
          mode?: string
          radius?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent?: string
          font?: string
          mode?: string
          radius?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      unit_types: {
        Row: {
          bedrooms: number
          company_id: string
          created_at: string
          deposit: number
          id: string
          label: string
          pricing_slug: string
          property_id: string
          quantity: number
          rent: number
          service_charge: number
          unit_prefix: string | null
          updated_at: string
        }
        Insert: {
          bedrooms?: number
          company_id: string
          created_at?: string
          deposit?: number
          id?: string
          label: string
          pricing_slug: string
          property_id: string
          quantity?: number
          rent?: number
          service_charge?: number
          unit_prefix?: string | null
          updated_at?: string
        }
        Update: {
          bedrooms?: number
          company_id?: string
          created_at?: string
          deposit?: number
          id?: string
          label?: string
          pricing_slug?: string
          property_id?: string
          quantity?: number
          rent?: number
          service_charge?: number
          unit_prefix?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_types_pricing_slug_fkey"
            columns: ["pricing_slug"]
            isOneToOne: false
            referencedRelation: "pricing_rules"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "unit_types_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          company_id: string
          created_at: string
          id: string
          property_id: string
          rent: number
          status: string
          unit_number: string
          unit_type_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          property_id: string
          rent?: number
          status?: string
          unit_number: string
          unit_type_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          property_id?: string
          rent?: number
          status?: string
          unit_number?: string
          unit_type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_unit_type_id_fkey"
            columns: ["unit_type_id"]
            isOneToOne: false
            referencedRelation: "unit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          assigned_to: string | null
          company_id: string | null
          created_at: string
          decided_by: string | null
          decision_at: string | null
          documents: Json
          id: string
          latitude: number | null
          longitude: number | null
          photos: Json
          property_id: string | null
          report: string | null
          status: string
          target_type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id?: string | null
          created_at?: string
          decided_by?: string | null
          decision_at?: string | null
          documents?: Json
          id?: string
          latitude?: number | null
          longitude?: number | null
          photos?: Json
          property_id?: string | null
          report?: string | null
          status?: string
          target_type?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string | null
          created_at?: string
          decided_by?: string | null
          decision_at?: string | null
          documents?: Json
          id?: string
          latitude?: number | null
          longitude?: number | null
          photos?: Json
          property_id?: string | null
          report?: string | null
          status?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }

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
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_subscription: {
        Args: { _company_id: string; _paid_only?: boolean }
        Returns: Json
      }
      current_company_id: { Args: never; Returns: string }
      generate_licence: { Args: { _company_id: string }; Returns: string }
      generate_units_for_type: {
        Args: { _unit_type_id: string }
        Returns: number
      }
      has_permission: {
        Args: { _key: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      seed_company_roles: { Args: { _company_id: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
