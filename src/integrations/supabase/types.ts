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
      calendario_eventos: {
        Row: {
          concluido: boolean | null
          cor: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          frequencia_recorrencia: string | null
          id: string
          lembrete_minutos: number | null
          modulo: string | null
          recorrente: boolean | null
          referencia_id: string | null
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          concluido?: boolean | null
          cor?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          frequencia_recorrencia?: string | null
          id?: string
          lembrete_minutos?: number | null
          modulo?: string | null
          recorrente?: boolean | null
          referencia_id?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          concluido?: boolean | null
          cor?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          frequencia_recorrencia?: string | null
          id?: string
          lembrete_minutos?: number | null
          modulo?: string | null
          recorrente?: boolean | null
          referencia_id?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      comunidade_badges: {
        Row: {
          cor: string | null
          created_at: string
          criterio: string
          descricao: string
          icone: string | null
          id: string
          nome: string
          pontos_necessarios: number | null
        }
        Insert: {
          cor?: string | null
          created_at?: string
          criterio: string
          descricao: string
          icone?: string | null
          id?: string
          nome: string
          pontos_necessarios?: number | null
        }
        Update: {
          cor?: string | null
          created_at?: string
          criterio?: string
          descricao?: string
          icone?: string | null
          id?: string
          nome?: string
          pontos_necessarios?: number | null
        }
        Relationships: []
      }
      comunidade_badges_usuario: {
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
            foreignKeyName: "comunidade_badges_usuario_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "comunidade_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      comunidade_comentarios: {
        Row: {
          conteudo: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_id: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunidade_comentarios_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comunidade_comentarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunidade_comentarios_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "comunidade_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      comunidade_denuncias: {
        Row: {
          comentario_id: string | null
          created_at: string | null
          descricao: string | null
          id: string
          motivo: string
          post_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          comentario_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          motivo: string
          post_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          comentario_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          motivo?: string
          post_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunidade_denuncias_comentario_id_fkey"
            columns: ["comentario_id"]
            isOneToOne: false
            referencedRelation: "comunidade_comentarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunidade_denuncias_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "comunidade_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      comunidade_enquetes: {
        Row: {
          created_at: string | null
          data_fim: string | null
          id: string
          multipla_escolha: boolean | null
          opcoes: Json
          post_id: string
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          id?: string
          multipla_escolha?: boolean | null
          opcoes: Json
          post_id: string
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          id?: string
          multipla_escolha?: boolean | null
          opcoes?: Json
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunidade_enquetes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "comunidade_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      comunidade_grupos: {
        Row: {
          cor: string | null
          created_at: string
          criadora_id: string
          descricao: string | null
          icone: string | null
          id: string
          membros_count: number | null
          nome: string
          privado: boolean | null
          updated_at: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          criadora_id: string
          descricao?: string | null
          icone?: string | null
          id?: string
          membros_count?: number | null
          nome: string
          privado?: boolean | null
          updated_at?: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          criadora_id?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          membros_count?: number | null
          nome?: string
          privado?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      comunidade_grupos_membros: {
        Row: {
          created_at: string
          grupo_id: string
          id: string
          papel: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          grupo_id: string
          id?: string
          papel?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          grupo_id?: string
          id?: string
          papel?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunidade_grupos_membros_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "comunidade_grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      comunidade_likes: {
        Row: {
          comentario_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comentario_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comentario_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunidade_likes_comentario_id_fkey"
            columns: ["comentario_id"]
            isOneToOne: false
            referencedRelation: "comunidade_comentarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunidade_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "comunidade_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      comunidade_posts: {
        Row: {
          comentarios_count: number | null
          conteudo: string
          created_at: string | null
          grupo_id: string | null
          id: string
          imagem_url: string | null
          likes_count: number | null
          tags: string[] | null
          tipo: string
          titulo: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comentarios_count?: number | null
          conteudo: string
          created_at?: string | null
          grupo_id?: string | null
          id?: string
          imagem_url?: string | null
          likes_count?: number | null
          tags?: string[] | null
          tipo?: string
          titulo?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comentarios_count?: number | null
          conteudo?: string
          created_at?: string | null
          grupo_id?: string | null
          id?: string
          imagem_url?: string | null
          likes_count?: number | null
          tags?: string[] | null
          tipo?: string
          titulo?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunidade_posts_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "comunidade_grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      comunidade_seguidores: {
        Row: {
          created_at: string | null
          id: string
          seguidor_id: string
          seguindo_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          seguidor_id: string
          seguindo_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          seguidor_id?: string
          seguindo_id?: string
        }
        Relationships: []
      }
      comunidade_stories: {
        Row: {
          conteudo: string | null
          created_at: string
          expira_em: string
          id: string
          imagem_url: string | null
          user_id: string
          visualizacoes: number | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          expira_em?: string
          id?: string
          imagem_url?: string | null
          user_id: string
          visualizacoes?: number | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          expira_em?: string
          id?: string
          imagem_url?: string | null
          user_id?: string
          visualizacoes?: number | null
        }
        Relationships: []
      }
      comunidade_stories_views: {
        Row: {
          id: string
          story_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          story_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunidade_stories_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "comunidade_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      comunidade_votos: {
        Row: {
          created_at: string | null
          enquete_id: string
          id: string
          opcao_index: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enquete_id: string
          id?: string
          opcao_index: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          enquete_id?: string
          id?: string
          opcao_index?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunidade_votos_enquete_id_fkey"
            columns: ["enquete_id"]
            isOneToOne: false
            referencedRelation: "comunidade_enquetes"
            referencedColumns: ["id"]
          },
        ]
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
      contatos_emergencia: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          ordem: number | null
          relacao: string | null
          telefone: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          ordem?: number | null
          relacao?: string | null
          telefone: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          relacao?: string | null
          telefone?: string
          user_id?: string
        }
        Relationships: []
      }
      despesas_compartilhadas: {
        Row: {
          categoria: string | null
          created_at: string
          data: string
          id: string
          status: string | null
          titulo: string
          updated_at: string
          user_id: string
          valor_total: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data?: string
          id?: string
          status?: string | null
          titulo: string
          updated_at?: string
          user_id: string
          valor_total: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data?: string
          id?: string
          status?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string
          valor_total?: number
        }
        Relationships: []
      }
      despesas_participantes: {
        Row: {
          created_at: string
          despesa_id: string
          email: string | null
          id: string
          nome: string
          status: string | null
          valor_devido: number
          valor_pago: number | null
        }
        Insert: {
          created_at?: string
          despesa_id: string
          email?: string | null
          id?: string
          nome: string
          status?: string | null
          valor_devido: number
          valor_pago?: number | null
        }
        Update: {
          created_at?: string
          despesa_id?: string
          email?: string | null
          id?: string
          nome?: string
          status?: string | null
          valor_devido?: number
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "despesas_participantes_despesa_id_fkey"
            columns: ["despesa_id"]
            isOneToOne: false
            referencedRelation: "despesas_compartilhadas"
            referencedColumns: ["id"]
          },
        ]
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
      dividas: {
        Row: {
          categoria: string | null
          created_at: string
          credor: string | null
          data_inicio: string
          data_vencimento: string | null
          descricao: string | null
          id: string
          nome: string
          parcelas_pagas: number | null
          status: string
          taxa_juros: number | null
          total_parcelas: number | null
          updated_at: string
          user_id: string
          valor_pago: number | null
          valor_total: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          credor?: string | null
          data_inicio?: string
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          nome: string
          parcelas_pagas?: number | null
          status?: string
          taxa_juros?: number | null
          total_parcelas?: number | null
          updated_at?: string
          user_id: string
          valor_pago?: number | null
          valor_total: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          credor?: string | null
          data_inicio?: string
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          parcelas_pagas?: number | null
          status?: string
          taxa_juros?: number | null
          total_parcelas?: number | null
          updated_at?: string
          user_id?: string
          valor_pago?: number | null
          valor_total?: number
        }
        Relationships: []
      }
      dividas_pagamentos: {
        Row: {
          created_at: string
          data_pagamento: string
          divida_id: string
          id: string
          numero_parcela: number | null
          observacoes: string | null
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          data_pagamento?: string
          divida_id: string
          id?: string
          numero_parcela?: number | null
          observacoes?: string | null
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string
          data_pagamento?: string
          divida_id?: string
          id?: string
          numero_parcela?: number | null
          observacoes?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "dividas_pagamentos_divida_id_fkey"
            columns: ["divida_id"]
            isOneToOne: false
            referencedRelation: "dividas"
            referencedColumns: ["id"]
          },
        ]
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
      horoscopo_diario: {
        Row: {
          amor: string | null
          cor_do_dia: string | null
          created_at: string
          data: string
          id: string
          numero_sorte: number | null
          previsao_geral: string
          saude: string | null
          signo: string
          trabalho: string | null
        }
        Insert: {
          amor?: string | null
          cor_do_dia?: string | null
          created_at?: string
          data?: string
          id?: string
          numero_sorte?: number | null
          previsao_geral: string
          saude?: string | null
          signo: string
          trabalho?: string | null
        }
        Update: {
          amor?: string | null
          cor_do_dia?: string | null
          created_at?: string
          data?: string
          id?: string
          numero_sorte?: number | null
          previsao_geral?: string
          saude?: string | null
          signo?: string
          trabalho?: string | null
        }
        Relationships: []
      }
      lembretes: {
        Row: {
          ativo: boolean | null
          created_at: string
          dias_semana: string[] | null
          horario: string
          id: string
          mensagem: string | null
          modulo: string | null
          referencia_id: string | null
          tipo: string
          titulo: string
          ultimo_disparo: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          dias_semana?: string[] | null
          horario: string
          id?: string
          mensagem?: string | null
          modulo?: string | null
          referencia_id?: string | null
          tipo?: string
          titulo: string
          ultimo_disparo?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          dias_semana?: string[] | null
          horario?: string
          id?: string
          mensagem?: string | null
          modulo?: string | null
          referencia_id?: string | null
          tipo?: string
          titulo?: string
          ultimo_disparo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lista_compras: {
        Row: {
          categoria: string
          comprado: boolean | null
          created_at: string
          id: string
          lista_id: string | null
          nome: string
          notas: string | null
          preco_estimado: number | null
          prioridade: string | null
          quantidade: number | null
          unidade: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria?: string
          comprado?: boolean | null
          created_at?: string
          id?: string
          lista_id?: string | null
          nome: string
          notas?: string | null
          preco_estimado?: number | null
          prioridade?: string | null
          quantidade?: number | null
          unidade?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string
          comprado?: boolean | null
          created_at?: string
          id?: string
          lista_id?: string | null
          nome?: string
          notas?: string | null
          preco_estimado?: number | null
          prioridade?: string | null
          quantidade?: number | null
          unidade?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lista_compras_grupo"
            columns: ["lista_id"]
            isOneToOne: false
            referencedRelation: "listas_compras_grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      listas_compras_grupos: {
        Row: {
          ativa: boolean | null
          cor: string | null
          created_at: string
          icone: string | null
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          ativa?: boolean | null
          cor?: string | null
          created_at?: string
          icone?: string | null
          id?: string
          nome?: string
          user_id: string
        }
        Update: {
          ativa?: boolean | null
          cor?: string | null
          created_at?: string
          icone?: string | null
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_anuncios: {
        Row: {
          aceita_troca: boolean | null
          categoria: string
          condicao: string
          created_at: string
          descricao: string | null
          id: string
          imagens: string[] | null
          localizacao: string | null
          preco: number
          status: string
          titulo: string
          updated_at: string
          user_id: string
          visualizacoes: number | null
        }
        Insert: {
          aceita_troca?: boolean | null
          categoria: string
          condicao?: string
          created_at?: string
          descricao?: string | null
          id?: string
          imagens?: string[] | null
          localizacao?: string | null
          preco: number
          status?: string
          titulo: string
          updated_at?: string
          user_id: string
          visualizacoes?: number | null
        }
        Update: {
          aceita_troca?: boolean | null
          categoria?: string
          condicao?: string
          created_at?: string
          descricao?: string | null
          id?: string
          imagens?: string[] | null
          localizacao?: string | null
          preco?: number
          status?: string
          titulo?: string
          updated_at?: string
          user_id?: string
          visualizacoes?: number | null
        }
        Relationships: []
      }
      marketplace_avaliacoes: {
        Row: {
          comentario: string | null
          created_at: string
          id: string
          nota: number
          parceiro_id: string | null
          servico_id: string | null
          user_id: string
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          id?: string
          nota: number
          parceiro_id?: string | null
          servico_id?: string | null
          user_id: string
        }
        Update: {
          comentario?: string | null
          created_at?: string
          id?: string
          nota?: number
          parceiro_id?: string | null
          servico_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_avaliacoes_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "marketplace_parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_avaliacoes_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "marketplace_servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_conversas: {
        Row: {
          anuncio_id: string | null
          comprador_id: string
          created_at: string
          id: string
          servico_id: string | null
          status: string | null
          updated_at: string
          vendedor_id: string
        }
        Insert: {
          anuncio_id?: string | null
          comprador_id: string
          created_at?: string
          id?: string
          servico_id?: string | null
          status?: string | null
          updated_at?: string
          vendedor_id: string
        }
        Update: {
          anuncio_id?: string | null
          comprador_id?: string
          created_at?: string
          id?: string
          servico_id?: string | null
          status?: string | null
          updated_at?: string
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_conversas_anuncio_id_fkey"
            columns: ["anuncio_id"]
            isOneToOne: false
            referencedRelation: "marketplace_anuncios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_conversas_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "marketplace_servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_cupons: {
        Row: {
          codigo: string
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          limite_uso: number | null
          parceiro_id: string | null
          status: string
          tipo_desconto: string
          titulo: string
          updated_at: string
          user_id: string
          usos_atuais: number | null
          valor_desconto: number
          valor_minimo: number | null
        }
        Insert: {
          codigo: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          limite_uso?: number | null
          parceiro_id?: string | null
          status?: string
          tipo_desconto?: string
          titulo: string
          updated_at?: string
          user_id: string
          usos_atuais?: number | null
          valor_desconto: number
          valor_minimo?: number | null
        }
        Update: {
          codigo?: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          limite_uso?: number | null
          parceiro_id?: string | null
          status?: string
          tipo_desconto?: string
          titulo?: string
          updated_at?: string
          user_id?: string
          usos_atuais?: number | null
          valor_desconto?: number
          valor_minimo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_cupons_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "marketplace_parceiros"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_favoritos: {
        Row: {
          anuncio_id: string | null
          created_at: string
          id: string
          parceiro_id: string | null
          servico_id: string | null
          user_id: string
        }
        Insert: {
          anuncio_id?: string | null
          created_at?: string
          id?: string
          parceiro_id?: string | null
          servico_id?: string | null
          user_id: string
        }
        Update: {
          anuncio_id?: string | null
          created_at?: string
          id?: string
          parceiro_id?: string | null
          servico_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_favoritos_anuncio_id_fkey"
            columns: ["anuncio_id"]
            isOneToOne: false
            referencedRelation: "marketplace_anuncios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_favoritos_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "marketplace_parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_favoritos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "marketplace_servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_mensagens: {
        Row: {
          conteudo: string
          conversa_id: string
          created_at: string
          id: string
          lida: boolean | null
          remetente_id: string
        }
        Insert: {
          conteudo: string
          conversa_id: string
          created_at?: string
          id?: string
          lida?: boolean | null
          remetente_id: string
        }
        Update: {
          conteudo?: string
          conversa_id?: string
          created_at?: string
          id?: string
          lida?: boolean | null
          remetente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "marketplace_conversas"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_parceiros: {
        Row: {
          banner_url: string | null
          categoria: string
          cidade: string | null
          created_at: string
          descricao: string | null
          endereco: string | null
          estado: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          nome_estabelecimento: string
          status: string
          telefone: string | null
          updated_at: string
          user_id: string
          verificado: boolean | null
          visualizacoes: number | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          banner_url?: string | null
          categoria: string
          cidade?: string | null
          created_at?: string
          descricao?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          nome_estabelecimento: string
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id: string
          verificado?: boolean | null
          visualizacoes?: number | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          banner_url?: string | null
          categoria?: string
          cidade?: string | null
          created_at?: string
          descricao?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          nome_estabelecimento?: string
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
          verificado?: boolean | null
          visualizacoes?: number | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      marketplace_propostas_troca: {
        Row: {
          created_at: string
          descricao_oferta: string
          id: string
          imagens_oferta: string[] | null
          proponente_id: string
          status: string | null
          troca_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao_oferta: string
          id?: string
          imagens_oferta?: string[] | null
          proponente_id: string
          status?: string | null
          troca_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao_oferta?: string
          id?: string
          imagens_oferta?: string[] | null
          proponente_id?: string
          status?: string | null
          troca_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_propostas_troca_troca_id_fkey"
            columns: ["troca_id"]
            isOneToOne: false
            referencedRelation: "marketplace_trocas"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_servicos: {
        Row: {
          categoria: string
          contato_instagram: string | null
          contato_whatsapp: string | null
          created_at: string
          descricao: string | null
          id: string
          imagens: string[] | null
          portfolio: string[] | null
          preco_maximo: number | null
          preco_minimo: number | null
          status: string
          tipo_preco: string | null
          titulo: string
          updated_at: string
          user_id: string
          visualizacoes: number | null
        }
        Insert: {
          categoria: string
          contato_instagram?: string | null
          contato_whatsapp?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagens?: string[] | null
          portfolio?: string[] | null
          preco_maximo?: number | null
          preco_minimo?: number | null
          status?: string
          tipo_preco?: string | null
          titulo: string
          updated_at?: string
          user_id: string
          visualizacoes?: number | null
        }
        Update: {
          categoria?: string
          contato_instagram?: string | null
          contato_whatsapp?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagens?: string[] | null
          portfolio?: string[] | null
          preco_maximo?: number | null
          preco_minimo?: number | null
          status?: string
          tipo_preco?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string
          visualizacoes?: number | null
        }
        Relationships: []
      }
      marketplace_trocas: {
        Row: {
          aceita_troca_por: string[] | null
          categoria: string
          created_at: string
          descricao: string | null
          id: string
          imagens: string[] | null
          localizacao: string | null
          status: string | null
          titulo: string
          updated_at: string
          user_id: string
          visualizacoes: number | null
        }
        Insert: {
          aceita_troca_por?: string[] | null
          categoria: string
          created_at?: string
          descricao?: string | null
          id?: string
          imagens?: string[] | null
          localizacao?: string | null
          status?: string | null
          titulo: string
          updated_at?: string
          user_id: string
          visualizacoes?: number | null
        }
        Update: {
          aceita_troca_por?: string[] | null
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          imagens?: string[] | null
          localizacao?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string
          visualizacoes?: number | null
        }
        Relationships: []
      }
      marketplace_verificacoes: {
        Row: {
          avaliacao_media: number | null
          created_at: string
          data_primeira_venda: string | null
          documento_tipo: string | null
          documento_verificado: boolean | null
          email_verificado: boolean | null
          id: string
          nivel_verificacao: number | null
          selo_vendedora_confiavel: boolean | null
          telefone_verificado: boolean | null
          total_vendas: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avaliacao_media?: number | null
          created_at?: string
          data_primeira_venda?: string | null
          documento_tipo?: string | null
          documento_verificado?: boolean | null
          email_verificado?: boolean | null
          id?: string
          nivel_verificacao?: number | null
          selo_vendedora_confiavel?: boolean | null
          telefone_verificado?: boolean | null
          total_vendas?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avaliacao_media?: number | null
          created_at?: string
          data_primeira_venda?: string | null
          documento_tipo?: string | null
          documento_verificado?: boolean | null
          email_verificado?: boolean | null
          id?: string
          nivel_verificacao?: number | null
          selo_vendedora_confiavel?: boolean | null
          telefone_verificado?: boolean | null
          total_vendas?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medicamentos_cadastrados: {
        Row: {
          alerta_estoque_minimo: number | null
          ativo: boolean
          categoria: string
          created_at: string
          crm_medico: string | null
          data_fim: string | null
          data_inicio: string | null
          dias_semana: string[] | null
          dosagem: string | null
          farmacia: string | null
          horarios: string[] | null
          id: string
          medico_prescreveu: string | null
          nome: string
          observacoes: string | null
          principio_ativo: string | null
          quantidade_estoque: number | null
          quantidade_por_dose: number | null
          tipo: string
          updated_at: string
          user_id: string
          via_administracao: string | null
        }
        Insert: {
          alerta_estoque_minimo?: number | null
          ativo?: boolean
          categoria?: string
          created_at?: string
          crm_medico?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          dias_semana?: string[] | null
          dosagem?: string | null
          farmacia?: string | null
          horarios?: string[] | null
          id?: string
          medico_prescreveu?: string | null
          nome: string
          observacoes?: string | null
          principio_ativo?: string | null
          quantidade_estoque?: number | null
          quantidade_por_dose?: number | null
          tipo?: string
          updated_at?: string
          user_id: string
          via_administracao?: string | null
        }
        Update: {
          alerta_estoque_minimo?: number | null
          ativo?: boolean
          categoria?: string
          created_at?: string
          crm_medico?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          dias_semana?: string[] | null
          dosagem?: string | null
          farmacia?: string | null
          horarios?: string[] | null
          id?: string
          medico_prescreveu?: string | null
          nome?: string
          observacoes?: string | null
          principio_ativo?: string | null
          quantidade_estoque?: number | null
          quantidade_por_dose?: number | null
          tipo?: string
          updated_at?: string
          user_id?: string
          via_administracao?: string | null
        }
        Relationships: []
      }
      mensagens_diretas: {
        Row: {
          conteudo: string
          created_at: string
          destinatario_id: string
          id: string
          lida: boolean | null
          remetente_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          destinatario_id: string
          id?: string
          lida?: boolean | null
          remetente_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          destinatario_id?: string
          id?: string
          lida?: boolean | null
          remetente_id?: string
        }
        Relationships: []
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
      metas_nutricionais: {
        Row: {
          calorias_diarias: number | null
          carboidratos_diarios: number | null
          created_at: string | null
          gorduras_diarias: number | null
          id: string
          proteinas_diarias: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calorias_diarias?: number | null
          carboidratos_diarios?: number | null
          created_at?: string | null
          gorduras_diarias?: number | null
          id?: string
          proteinas_diarias?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calorias_diarias?: number | null
          carboidratos_diarios?: number | null
          created_at?: string | null
          gorduras_diarias?: number | null
          id?: string
          proteinas_diarias?: number | null
          updated_at?: string | null
          user_id?: string
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
      notificacoes: {
        Row: {
          created_at: string
          id: string
          lida: boolean | null
          mensagem: string | null
          referencia_id: string | null
          referencia_tipo: string | null
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean | null
          mensagem?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean | null
          mensagem?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo?: string
          titulo?: string
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
      orcamentos: {
        Row: {
          alerta_percentual: number | null
          ano: number
          categoria: string
          created_at: string
          id: string
          mes: number
          updated_at: string
          user_id: string
          valor_limite: number
        }
        Insert: {
          alerta_percentual?: number | null
          ano: number
          categoria: string
          created_at?: string
          id?: string
          mes: number
          updated_at?: string
          user_id: string
          valor_limite: number
        }
        Update: {
          alerta_percentual?: number | null
          ano?: number
          categoria?: string
          created_at?: string
          id?: string
          mes?: number
          updated_at?: string
          user_id?: string
          valor_limite?: number
        }
        Relationships: []
      }
      perfil_astrologico: {
        Row: {
          ano_pessoal: number
          created_at: string
          elemento: string
          id: string
          modalidade: string
          numero_pessoal: number
          signo_solar: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ano_pessoal: number
          created_at?: string
          elemento: string
          id?: string
          modalidade: string
          numero_pessoal: number
          signo_solar: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ano_pessoal?: number
          created_at?: string
          elemento?: string
          id?: string
          modalidade?: string
          numero_pessoal?: number
          signo_solar?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      perfis: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cidade: string | null
          created_at: string
          data_nascimento: string | null
          estado: string | null
          id: string
          instagram: string | null
          localizacao: string | null
          nome: string
          objetivos: string | null
          pronome: string | null
          tipo_usuario: Database["public"]["Enums"]["tipo_usuario"]
          updated_at: string
          user_id: string
          visibilidade_perfil: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cidade?: string | null
          created_at?: string
          data_nascimento?: string | null
          estado?: string | null
          id?: string
          instagram?: string | null
          localizacao?: string | null
          nome: string
          objetivos?: string | null
          pronome?: string | null
          tipo_usuario?: Database["public"]["Enums"]["tipo_usuario"]
          updated_at?: string
          user_id: string
          visibilidade_perfil?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cidade?: string | null
          created_at?: string
          data_nascimento?: string | null
          estado?: string | null
          id?: string
          instagram?: string | null
          localizacao?: string | null
          nome?: string
          objetivos?: string | null
          pronome?: string | null
          tipo_usuario?: Database["public"]["Enums"]["tipo_usuario"]
          updated_at?: string
          user_id?: string
          visibilidade_perfil?: string | null
          website?: string | null
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
          alimentos_identificados: Json | null
          calorias: number | null
          carboidratos: number | null
          created_at: string
          data_hora: string
          descricao: string | null
          fibras: number | null
          foto_url: string | null
          gorduras: number | null
          id: string
          porcao: string | null
          proteinas: number | null
          tipo: string
          user_id: string
        }
        Insert: {
          alimentos_identificados?: Json | null
          calorias?: number | null
          carboidratos?: number | null
          created_at?: string
          data_hora?: string
          descricao?: string | null
          fibras?: number | null
          foto_url?: string | null
          gorduras?: number | null
          id?: string
          porcao?: string | null
          proteinas?: number | null
          tipo: string
          user_id: string
        }
        Update: {
          alimentos_identificados?: Json | null
          calorias?: number | null
          carboidratos?: number | null
          created_at?: string
          data_hora?: string
          descricao?: string | null
          fibras?: number | null
          foto_url?: string | null
          gorduras?: number | null
          id?: string
          porcao?: string | null
          proteinas?: number | null
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
      registro_ciclo_diario: {
        Row: {
          created_at: string | null
          data: string
          fluxo: string | null
          humor: string | null
          id: string
          medicamento: string | null
          notas: string | null
          sintomas: string[] | null
          teve_relacao: boolean | null
          user_id: string
          usou_protecao: boolean | null
        }
        Insert: {
          created_at?: string | null
          data: string
          fluxo?: string | null
          humor?: string | null
          id?: string
          medicamento?: string | null
          notas?: string | null
          sintomas?: string[] | null
          teve_relacao?: boolean | null
          user_id: string
          usou_protecao?: boolean | null
        }
        Update: {
          created_at?: string | null
          data?: string
          fluxo?: string | null
          humor?: string | null
          id?: string
          medicamento?: string | null
          notas?: string | null
          sintomas?: string[] | null
          teve_relacao?: boolean | null
          user_id?: string
          usou_protecao?: boolean | null
        }
        Relationships: []
      }
      registro_medicamento: {
        Row: {
          created_at: string
          data: string
          horario_programado: string | null
          horario_tomado: string | null
          id: string
          medicamento_id: string | null
          notas: string | null
          pulou_motivo: string | null
          tomou: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          horario_programado?: string | null
          horario_tomado?: string | null
          id?: string
          medicamento_id?: string | null
          notas?: string | null
          pulou_motivo?: string | null
          tomou?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          horario_programado?: string | null
          horario_tomado?: string | null
          id?: string
          medicamento_id?: string | null
          notas?: string | null
          pulou_motivo?: string | null
          tomou?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registro_medicamento_medicamento_id_fkey"
            columns: ["medicamento_id"]
            isOneToOne: false
            referencedRelation: "medicamentos_cadastrados"
            referencedColumns: ["id"]
          },
        ]
      }
      registro_suplementacao: {
        Row: {
          created_at: string
          data: string
          horario: string | null
          id: string
          notas: string | null
          quantidade: string | null
          suplemento_id: string | null
          tomou: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          horario?: string | null
          id?: string
          notas?: string | null
          quantidade?: string | null
          suplemento_id?: string | null
          tomou?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          horario?: string | null
          id?: string
          notas?: string | null
          quantidade?: string | null
          suplemento_id?: string | null
          tomou?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registro_suplementacao_suplemento_id_fkey"
            columns: ["suplemento_id"]
            isOneToOne: false
            referencedRelation: "suplementos_cadastrados"
            referencedColumns: ["id"]
          },
        ]
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
      suplementos_cadastrados: {
        Row: {
          ativo: boolean
          created_at: string
          data_validade: string | null
          dosagem_recomendada: string | null
          horario_ideal: string | null
          id: string
          marca: string | null
          nome: string
          notas: string | null
          quantidade_restante: number | null
          quantidade_total: number | null
          sabor: string | null
          tipo: string
          unidade: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_validade?: string | null
          dosagem_recomendada?: string | null
          horario_ideal?: string | null
          id?: string
          marca?: string | null
          nome: string
          notas?: string | null
          quantidade_restante?: number | null
          quantidade_total?: number | null
          sabor?: string | null
          tipo?: string
          unidade?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_validade?: string | null
          dosagem_recomendada?: string | null
          horario_ideal?: string | null
          id?: string
          marca?: string | null
          nome?: string
          notas?: string | null
          quantidade_restante?: number | null
          quantidade_total?: number | null
          sabor?: string | null
          tipo?: string
          unidade?: string | null
          updated_at?: string
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
      telemedicina_agendamentos: {
        Row: {
          avaliacao_paciente: number | null
          comentario_avaliacao: string | null
          created_at: string
          data_hora: string
          duracao_minutos: number | null
          id: string
          link_video_chamada: string | null
          motivo_consulta: string | null
          pago: boolean | null
          profissional_id: string | null
          status: string
          tipo: string
          token_acesso: string | null
          updated_at: string
          user_id: string
          valor: number | null
        }
        Insert: {
          avaliacao_paciente?: number | null
          comentario_avaliacao?: string | null
          created_at?: string
          data_hora: string
          duracao_minutos?: number | null
          id?: string
          link_video_chamada?: string | null
          motivo_consulta?: string | null
          pago?: boolean | null
          profissional_id?: string | null
          status?: string
          tipo?: string
          token_acesso?: string | null
          updated_at?: string
          user_id: string
          valor?: number | null
        }
        Update: {
          avaliacao_paciente?: number | null
          comentario_avaliacao?: string | null
          created_at?: string
          data_hora?: string
          duracao_minutos?: number | null
          id?: string
          link_video_chamada?: string | null
          motivo_consulta?: string | null
          pago?: boolean | null
          profissional_id?: string | null
          status?: string
          tipo?: string
          token_acesso?: string | null
          updated_at?: string
          user_id?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "telemedicina_agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "telemedicina_profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      telemedicina_especialidades: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          tipo?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      telemedicina_historico: {
        Row: {
          agendamento_id: string | null
          created_at: string
          data_consulta: string
          id: string
          orientacoes: string | null
          prescricoes: string | null
          profissional_id: string | null
          proxima_consulta: string | null
          resumo_consulta: string | null
          user_id: string
        }
        Insert: {
          agendamento_id?: string | null
          created_at?: string
          data_consulta: string
          id?: string
          orientacoes?: string | null
          prescricoes?: string | null
          profissional_id?: string | null
          proxima_consulta?: string | null
          resumo_consulta?: string | null
          user_id: string
        }
        Update: {
          agendamento_id?: string | null
          created_at?: string
          data_consulta?: string
          id?: string
          orientacoes?: string | null
          prescricoes?: string | null
          profissional_id?: string | null
          proxima_consulta?: string | null
          resumo_consulta?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telemedicina_historico_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "telemedicina_agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telemedicina_historico_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "telemedicina_profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      telemedicina_profissionais: {
        Row: {
          anos_experiencia: number | null
          avaliacao_media: number | null
          bio: string | null
          created_at: string
          disponivel: boolean
          duracao_consulta: number | null
          especialidade_id: string | null
          foto_url: string | null
          id: string
          idiomas: string[] | null
          nome: string
          registro_profissional: string
          total_consultas: number | null
          updated_at: string
          valor_consulta: number
        }
        Insert: {
          anos_experiencia?: number | null
          avaliacao_media?: number | null
          bio?: string | null
          created_at?: string
          disponivel?: boolean
          duracao_consulta?: number | null
          especialidade_id?: string | null
          foto_url?: string | null
          id?: string
          idiomas?: string[] | null
          nome: string
          registro_profissional: string
          total_consultas?: number | null
          updated_at?: string
          valor_consulta?: number
        }
        Update: {
          anos_experiencia?: number | null
          avaliacao_media?: number | null
          bio?: string | null
          created_at?: string
          disponivel?: boolean
          duracao_consulta?: number | null
          especialidade_id?: string | null
          foto_url?: string | null
          id?: string
          idiomas?: string[] | null
          nome?: string
          registro_profissional?: string
          total_consultas?: number | null
          updated_at?: string
          valor_consulta?: number
        }
        Relationships: [
          {
            foreignKeyName: "telemedicina_profissionais_especialidade_id_fkey"
            columns: ["especialidade_id"]
            isOneToOne: false
            referencedRelation: "telemedicina_especialidades"
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
      transacoes_recorrentes: {
        Row: {
          ativo: boolean
          categoria: string
          conta_id: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          dia_vencimento: number | null
          frequencia: string
          id: string
          tipo: string
          ultima_geracao: string | null
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          ativo?: boolean
          categoria: string
          conta_id?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          dia_vencimento?: number | null
          frequencia: string
          id?: string
          tipo: string
          ultima_geracao?: string | null
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          ativo?: boolean
          categoria?: string
          conta_id?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          dia_vencimento?: number | null
          frequencia?: string
          id?: string
          tipo?: string
          ultima_geracao?: string | null
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_recorrentes_conta_id_fkey"
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
