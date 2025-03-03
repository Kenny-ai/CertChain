export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            certificates: {
                Row: {
                    certificate_hash: string;
                    id: string;
                    issue_date: string;
                    issuing_institution_id: string | null;
                    issuing_institution_name: string | null;
                    graduation_year: string | null;
                    metadata: Json | null;
                    title: string | null;
                    txn_id: string | null;
                    user_ids: string[] | null;
                    matric_numbers: string[] | null;
                };
                Insert: {
                    certificate_hash: string;
                    id?: string;
                    issue_date?: string;
                    issuing_institution_id?: string | null;
                    issuing_institution_name?: string | null;
                    graduation_year?: string | null;
                    metadata?: Json | null;
                    title?: string | null;
                    txn_id?: string | null;
                    user_id?: string | null;
                    user_ids?: string[] | null;
                    matric_numbers?: string[] | null;
                };
                Update: {
                    certificate_hash?: string;
                    id?: string;
                    issue_date?: string;
                    issuing_institution_id?: string | null;
                    issuing_institution_name?: string | null;
                    graduation_year?: string | null;
                    metadata?: Json | null;
                    title?: string | null;
                    txn_id?: string | null;
                    user_id?: string | null;
                    user_ids?: string[] | null;
                    matric_numbers?: string[] | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "public_certificates_issuing_institution_id_fkey";
                        columns: ["issuing_institution_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            institutions: {
                Row: {
                    address: string | null;
                    contact_info: string | null;
                    id: string;
                    name: string;
                    public_key: string | null;
                };
                Insert: {
                    address?: string | null;
                    contact_info?: string | null;
                    id: string;
                    name: string;
                    public_key?: string | null;
                };
                Update: {
                    address?: string | null;
                    contact_info?: string | null;
                    id?: string;
                    name?: string;
                    public_key?: string | null;
                };
                Relationships: [];
            };
            roles: {
                Row: {
                    id: string;
                    name: string;
                };
                Insert: {
                    id: string;
                    name: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                };
                Relationships: [];
            };
            user_roles: {
                Row: {
                    id: string;
                    role_id: string;
                    user_id: string;
                };
                Insert: {
                    id: string;
                    role_id: string;
                    user_id: string;
                };
                Update: {
                    id?: string;
                    role_id?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "user_roles_role_id_fkey";
                        columns: ["role_id"];
                        isOneToOne: false;
                        referencedRelation: "roles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "user_roles_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            users: {
                Row: {
                    avatar_url: string | null;
                    billing_address: Json | null;
                    certificates: number[] | null;
                    certificates_issued: number[] | null;
                    full_name: string | null;
                    id: string;
                    matric_number: string;
                    graduation_year: string | null;
                    organization: boolean | null;
                    payment_method: Json | null;
                    user_metadata: any;
                };
                Insert: {
                    avatar_url?: string | null;
                    billing_address?: Json | null;
                    certificates?: number[] | null;
                    certificates_issued?: number[] | null;
                    full_name?: string | null;
                    id: string;
                    matric_number: string;
                    graduation_year?: string | null;
                    organization?: boolean | null;
                    payment_method?: Json | null;
                };
                Update: {
                    avatar_url?: string | null;
                    billing_address?: Json | null;
                    certificates?: number[] | null;
                    certificates_issued?: number[] | null;
                    full_name?: string | null;
                    id?: string;
                    matric_number?: string;
                    graduation_year?: string | null;
                    organization?: boolean | null;
                    payment_method?: Json | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "users_id_fkey";
                        columns: ["id"];
                        isOneToOne: true;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

export type Tables<
    PublicTableNameOrOptions extends
        | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
              Database[PublicTableNameOrOptions["schema"]]["Views"])
        : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
          Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
            Database["public"]["Views"])
      ? (Database["public"]["Tables"] &
            Database["public"]["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    PublicTableNameOrOptions extends
        | keyof Database["public"]["Tables"]
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
      ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    PublicTableNameOrOptions extends
        | keyof Database["public"]["Tables"]
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
      ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    PublicEnumNameOrOptions extends
        | keyof Database["public"]["Enums"]
        | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
        : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
      ? Database["public"]["Enums"][PublicEnumNameOrOptions]
      : never;
