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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          address: string | null
          business_number: string
          company_name: string
          contact: string | null
          created_at: string | null
          email: string | null
          id: string
          representative_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          business_number: string
          company_name: string
          contact?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          representative_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          business_number?: string
          company_name?: string
          contact?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          representative_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payees: {
        Row: {
          account_number_encrypted: string | null
          address: string | null
          bank_name: string | null
          business_type: string
          company_id: string
          contact: string | null
          contract_end_date: string | null
          contract_file_url: string | null
          contract_start_date: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          resident_number_encrypted: string
          updated_at: string | null
        }
        Insert: {
          account_number_encrypted?: string | null
          address?: string | null
          bank_name?: string | null
          business_type: string
          company_id: string
          contact?: string | null
          contract_end_date?: string | null
          contract_file_url?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          resident_number_encrypted: string
          updated_at?: string | null
        }
        Update: {
          account_number_encrypted?: string | null
          address?: string | null
          bank_name?: string | null
          business_type?: string
          company_id?: string
          contact?: string | null
          contract_end_date?: string | null
          contract_file_url?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          resident_number_encrypted?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          income_tax: number
          local_income_tax: number
          net_amount: number
          payee_id: string
          payment_amount: number
          payment_date: string
          payment_reason: string | null
          receipt_issued: boolean | null
          receipt_issued_at: string | null
          total_tax: number
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          income_tax: number
          local_income_tax: number
          net_amount: number
          payee_id: string
          payment_amount: number
          payment_date: string
          payment_reason?: string | null
          receipt_issued?: boolean | null
          receipt_issued_at?: string | null
          total_tax: number
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          income_tax?: number
          local_income_tax?: number
          net_amount?: number
          payee_id?: string
          payment_amount?: number
          payment_date?: string
          payment_reason?: string | null
          receipt_issued?: boolean | null
          receipt_issued_at?: string | null
          total_tax?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payee_id_fkey"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "payees"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          company_id: string
          created_at: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          issued_by: string | null
          payee_id: string
          payment_id: string
          pdf_url: string | null
          receipt_number: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          issued_by?: string | null
          payee_id: string
          payment_id: string
          pdf_url?: string | null
          receipt_number: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          issued_by?: string | null
          payee_id?: string
          payment_id?: string
          pdf_url?: string | null
          receipt_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_payee_id_fkey"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "payees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      memos: {
        Row: {
          id: string
          company_id: string
          content: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          content: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          content?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

// 원천징수 시스템 타입 별칭 (편의성)
export type Company = Tables<"companies">
export type CompanyInsert = TablesInsert<"companies">
export type CompanyUpdate = TablesUpdate<"companies">

export type Payee = Tables<"payees">
export type PayeeInsert = TablesInsert<"payees">
export type PayeeUpdate = TablesUpdate<"payees">

export type Payment = Tables<"payments">
export type PaymentInsert = TablesInsert<"payments">
export type PaymentUpdate = TablesUpdate<"payments">

export type Receipt = Tables<"receipts">
export type ReceiptInsert = TablesInsert<"receipts">
export type ReceiptUpdate = TablesUpdate<"receipts">

export type Memo = Tables<"memos">
export type MemoInsert = TablesInsert<"memos">
export type MemoUpdate = TablesUpdate<"memos">

