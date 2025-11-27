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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ajuda_artigos: {
        Row: {
          categoria: string
          conteudo: string
          created_at: string | null
          helpful_no: number | null
          helpful_yes: number | null
          id: string
          ordem: number | null
          titulo: string
          views: number | null
        }
        Insert: {
          categoria: string
          conteudo: string
          created_at?: string | null
          helpful_no?: number | null
          helpful_yes?: number | null
          id?: string
          ordem?: number | null
          titulo: string
          views?: number | null
        }
        Update: {
          categoria?: string
          conteudo?: string
          created_at?: string | null
          helpful_no?: number | null
          helpful_yes?: number | null
          id?: string
          ordem?: number | null
          titulo?: string
          views?: number | null
        }
        Relationships: []
      }
      badges_casa: {
        Row: {
          created_at: string
          criterio: string
          descricao: string
          icone: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          criterio: string
          descricao: string
          icone?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          criterio?: string
          descricao?: string
          icone?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      badges_usuario: {
        Row: {
          badge_id: string
          data_conquista: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          data_conquista?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          data_conquista?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_usuario_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges_casa"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_blog: {
        Row: {
          created_at: string
          id: string
          nome: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          slug?: string
        }
        Relationships: []
      }
      categorias_tarefa_casa: {
        Row: {
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      ciclo_menstrual: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          id: string
          intensidade: string | null
          sintomas: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          id?: string
          intensidade?: string | null
          sintomas?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          intensidade?: string | null
          sintomas?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contas_financeiras: {
        Row: {
          created_at: string
          id: string
          nome: string
          saldo_atual: number | null
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          saldo_atual?: number | null
          tipo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          saldo_atual?: number | null
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dicas_favoritas: {
        Row: {
          created_at: string | null
          dica_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dica_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          dica_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dicas_favoritas_dica_id_fkey"
            columns: ["dica_id"]
            isOneToOne: false
            referencedRelation: "dicas_praticas"
            referencedColumns: ["id"]
          },
        ]
      }
      dicas_praticas: {
        Row: {
          categoria: string
          checklist: Json | null
          conteudo: string
          created_at: string | null
          destacada: boolean | null
          id: string
          ordem: number | null
          titulo: string
        }
        Insert: {
          categoria: string
          checklist?: Json | null
          conteudo: string
          created_at?: string | null
          destacada?: boolean | null
          id?: string
          ordem?: number | null
          titulo: string
        }
        Update: {
          categoria?: string
          checklist?: Json | null
          conteudo?: string
          created_at?: string | null
          destacada?: boolean | null
          id?: string
          ordem?: number | null
          titulo?: string
        }
        Relationships: []
      }
      ebook_capitulos: {
        Row: {
          conteudo: string
          created_at: string | null
          id: string
          numero: number
          ordem: number
          tempo_leitura: number | null
          titulo: string
          xp_recompensa: number | null
        }
        Insert: {
          conteudo: string
          created_at?: string | null
          id?: string
          numero: number
          ordem: number
          tempo_leitura?: number | null
          titulo: string
          xp_recompensa?: number | null
        }
        Update: {
          conteudo?: string
          created_at?: string | null
          id?: string
          numero?: number
          ordem?: number
          tempo_leitura?: number | null
          titulo?: string
          xp_recompensa?: number | null
        }
        Relationships: []
      }
      ebook_progresso: {
        Row: {
          capitulo_id: string | null
          concluido: boolean | null
          created_at: string | null
          data_conclusao: string | null
          data_inicio: string | null
          id: string
          posicao_scroll: number | null
          progresso: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          capitulo_id?: string | null
          concluido?: boolean | null
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          id?: string
          posicao_scroll?: number | null
          progresso?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          capitulo_id?: string | null
          concluido?: boolean | null
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          id?: string
          posicao_scroll?: number | null
          progresso?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ebook_progresso_capitulo_id_fkey"
            columns: ["capitulo_id"]
            isOneToOne: false
            referencedRelation: "ebook_capitulos"
            referencedColumns: ["id"]
          },
        ]
      }
      ebook_respostas_interativas: {
        Row: {
          created_at: string
          data: string
          id: string
          respostas: Json
          tipo_resposta: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          respostas: Json
          tipo_resposta: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          respostas?: Json
          tipo_resposta?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      habitos_bem_estar: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          frequencia: string
          id: string
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          frequencia?: string
          id?: string
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          frequencia?: string
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      habitos_bem_estar_historico: {
        Row: {
          concluido: boolean
          created_at: string
          data: string
          habito_id: string
          id: string
          user_id: string
        }
        Insert: {
          concluido?: boolean
          created_at?: string
          data: string
          habito_id: string
          id?: string
          user_id: string
        }
        Update: {
          concluido?: boolean
          created_at?: string
          data?: string
          habito_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habitos_bem_estar_historico_habito_id_fkey"
            columns: ["habito_id"]
            isOneToOne: false
            referencedRelation: "habitos_bem_estar"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_financeiras: {
        Row: {
          created_at: string
          data_limite: string | null
          id: string
          nome: string
          updated_at: string
          user_id: string
          valor_atual: number | null
          valor_total: number
        }
        Insert: {
          created_at?: string
          data_limite?: string | null
          id?: string
          nome: string
          updated_at?: string
          user_id: string
          valor_atual?: number | null
          valor_total: number
        }
        Update: {
          created_at?: string
          data_limite?: string | null
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
          valor_atual?: number | null
          valor_total?: number
        }
        Relationships: []
      }
      notas: {
        Row: {
          categoria: string | null
          conteudo: string | null
          created_at: string
          id: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          id?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          id?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          completed: boolean | null
          created_at: string | null
          dados_onboarding: Json | null
          id: string
          step: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          dados_onboarding?: Json | null
          id?: string
          step?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          dados_onboarding?: Json | null
          id?: string
          step?: string | null
          user_id?: string
        }
        Relationships: []
      }
      perfis: {
        Row: {
          created_at: string
          data_nascimento: string | null
          id: string
          nome: string
          objetivos: string | null
          pronome: string | null
          tipo_usuario: Database["public"]["Enums"]["tipo_usuario"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_nascimento?: string | null
          id?: string
          nome: string
          objetivos?: string | null
          pronome?: string | null
          tipo_usuario?: Database["public"]["Enums"]["tipo_usuario"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_nascimento?: string | null
          id?: string
          nome?: string
          objetivos?: string | null
          pronome?: string | null
          tipo_usuario?: Database["public"]["Enums"]["tipo_usuario"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      posts_blog: {
        Row: {
          autor: string | null
          categoria_id: string | null
          conteudo: string
          created_at: string
          data_publicacao: string | null
          id: string
          slug: string
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          autor?: string | null
          categoria_id?: string | null
          conteudo: string
          created_at?: string
          data_publicacao?: string | null
          id?: string
          slug: string
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          autor?: string | null
          categoria_id?: string | null
          conteudo?: string
          created_at?: string
          data_publicacao?: string | null
          id?: string
          slug?: string
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_blog_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_blog"
            referencedColumns: ["id"]
          },
        ]
      }
      recursos_digitais: {
        Row: {
          created_at: string
          descricao: string | null
          exige_login: boolean
          id: string
          tipo: string
          titulo: string
          updated_at: string
          url_arquivo: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          exige_login?: boolean
          id?: string
          tipo: string
          titulo: string
          updated_at?: string
          url_arquivo?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          exige_login?: boolean
          id?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          url_arquivo?: string | null
        }
        Relationships: []
      }
      refeicoes: {
        Row: {
          created_at: string
          data_hora: string
          descricao: string | null
          id: string
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_hora?: string
          descricao?: string | null
          id?: string
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_hora?: string
          descricao?: string | null
          id?: string
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      registro_agua: {
        Row: {
          created_at: string
          data: string
          id: string
          quantidade_ml: number
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          id?: string
          quantidade_ml: number
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          quantidade_ml?: number
          user_id?: string
        }
        Relationships: []
      }
      saude_resumo_diario: {
        Row: {
          created_at: string
          data: string
          energia: number | null
          humor: string | null
          id: string
          notas: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          energia?: number | null
          humor?: string | null
          id?: string
          notas?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          energia?: number | null
          humor?: string | null
          id?: string
          notas?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tarefas_casa: {
        Row: {
          ativo: boolean
          categoria_id: string | null
          created_at: string
          data_proxima_execucao: string | null
          descricao: string | null
          frequencia: string
          id: string
          nome: string
          pontos_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          categoria_id?: string | null
          created_at?: string
          data_proxima_execucao?: string | null
          descricao?: string | null
          frequencia?: string
          id?: string
          nome: string
          pontos_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          categoria_id?: string | null
          created_at?: string
          data_proxima_execucao?: string | null
          descricao?: string | null
          frequencia?: string
          id?: string
          nome?: string
          pontos_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_casa_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_tarefa_casa"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas_casa_historico: {
        Row: {
          data_conclusao: string
          id: string
          observacoes: string | null
          tarefa_id: string
          user_id: string
        }
        Insert: {
          data_conclusao?: string
          id?: string
          observacoes?: string | null
          tarefa_id: string
          user_id: string
        }
        Update: {
          data_conclusao?: string
          id?: string
          observacoes?: string | null
          tarefa_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_casa_historico_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas_casa"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes_financeiras: {
        Row: {
          categoria: string
          conta_id: string | null
          created_at: string
          data: string
          descricao: string | null
          id: string
          tipo: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria: string
          conta_id?: string | null
          created_at?: string
          data: string
          descricao?: string | null
          id?: string
          tipo: string
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string
          conta_id?: string | null
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          tipo?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_financeiras_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas_financeiras"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorial_progress: {
        Row: {
          completed: boolean | null
          id: string
          modulo: string
          step_atual: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          id?: string
          modulo: string
          step_atual?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          id?: string
          modulo?: string
          step_atual?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "usuario"
      tipo_usuario: "usuario" | "admin"
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
    Enums: {
      app_role: ["admin", "usuario"],
      tipo_usuario: ["usuario", "admin"],
    },
  },
} as const
