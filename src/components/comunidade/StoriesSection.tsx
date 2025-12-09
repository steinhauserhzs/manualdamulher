import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Story {
  id: string;
  user_id: string;
  conteudo: string | null;
  imagem_url: string | null;
  visualizacoes: number;
  created_at: string;
  perfil?: {
    nome: string;
    avatar_url: string | null;
  };
}

interface StoriesByUser {
  user_id: string;
  nome: string;
  avatar_url: string | null;
  stories: Story[];
}

export const StoriesSection = () => {
  const [storiesByUser, setStoriesByUser] = useState<StoriesByUser[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentStories, setCurrentStories] = useState<Story[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [novoStory, setNovoStory] = useState({ conteudo: "", imagem_url: "" });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    carregarStories();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const carregarStories = async () => {
    const { data, error } = await supabase
      .from("comunidade_stories")
      .select("*")
      .gt("expira_em", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar stories:", error);
      return;
    }

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(s => s.user_id))];
      const { data: perfis } = await supabase
        .from("perfis")
        .select("user_id, nome, avatar_url")
        .in("user_id", userIds);

      const perfisMap = new Map(perfis?.map(p => [p.user_id, p]) || []);

      // Agrupar stories por usuário
      const grouped = data.reduce((acc, story) => {
        const perfil = perfisMap.get(story.user_id);
        if (!acc[story.user_id]) {
          acc[story.user_id] = {
            user_id: story.user_id,
            nome: perfil?.nome || "Usuária",
            avatar_url: perfil?.avatar_url || null,
            stories: []
          };
        }
        acc[story.user_id].stories.push({ ...story, perfil });
        return acc;
      }, {} as Record<string, StoriesByUser>);

      setStoriesByUser(Object.values(grouped));
    }
    setLoading(false);
  };

  const criarStory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!novoStory.conteudo && !novoStory.imagem_url) {
      toast({ title: "Adicione um texto ou imagem", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("comunidade_stories").insert({
      user_id: user.id,
      conteudo: novoStory.conteudo || null,
      imagem_url: novoStory.imagem_url || null
    });

    if (error) {
      toast({ title: "Erro ao criar story", variant: "destructive" });
      return;
    }

    toast({ title: "Story publicado!", description: "Expira em 24 horas" });
    setDialogOpen(false);
    setNovoStory({ conteudo: "", imagem_url: "" });
    carregarStories();
  };

  const visualizarStories = async (userStories: StoriesByUser) => {
    setCurrentStories(userStories.stories);
    setCurrentStoryIndex(0);
    setViewDialogOpen(true);

    // Registrar visualização
    const { data: { user } } = await supabase.auth.getUser();
    if (user && userStories.stories[0]) {
      await supabase.from("comunidade_stories_views").upsert({
        story_id: userStories.stories[0].id,
        user_id: user.id
      }, { onConflict: 'story_id,user_id' });
    }
  };

  const proximoStory = () => {
    if (currentStoryIndex < currentStories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      setViewDialogOpen(false);
    }
  };

  const storyAnterior = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-shrink-0 w-16 h-16 rounded-full bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* Botão de criar story */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">Seu Story</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Story</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Texto</Label>
                <Textarea
                  value={novoStory.conteudo}
                  onChange={(e) => setNovoStory(prev => ({ ...prev, conteudo: e.target.value }))}
                  placeholder="O que você quer compartilhar?"
                  rows={3}
                />
              </div>
              <div>
                <Label>URL da Imagem (opcional)</Label>
                <Input
                  value={novoStory.imagem_url}
                  onChange={(e) => setNovoStory(prev => ({ ...prev, imagem_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={criarStory} className="w-full">
                Publicar Story
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stories de outros usuários */}
        {storiesByUser.map((userStory) => (
          <button
            key={userStory.user_id}
            onClick={() => visualizarStories(userStory)}
            className="flex-shrink-0 flex flex-col items-center gap-1"
          >
            <div className={`p-0.5 rounded-full ${userStory.user_id === currentUserId ? 'bg-muted' : 'bg-gradient-to-br from-primary to-secondary'}`}>
              <Avatar className="w-14 h-14 border-2 border-background">
                <AvatarImage src={userStory.avatar_url || undefined} />
                <AvatarFallback>{userStory.nome[0]}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs text-muted-foreground truncate w-16 text-center">
              {userStory.nome.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Visualizador de Stories */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-black">
          {currentStories[currentStoryIndex] && (
            <div className="relative min-h-[70vh] flex flex-col">
              {/* Progress bars */}
              <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
                {currentStories.map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded bg-white/30">
                    <div 
                      className={`h-full rounded bg-white transition-all ${i <= currentStoryIndex ? 'w-full' : 'w-0'}`}
                    />
                  </div>
                ))}
              </div>

              {/* Close button */}
              <button 
                onClick={() => setViewDialogOpen(false)}
                className="absolute top-4 right-4 z-10 text-white"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Content */}
              <div 
                className="flex-1 flex items-center justify-center p-6 pt-12"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  if (x < rect.width / 2) {
                    storyAnterior();
                  } else {
                    proximoStory();
                  }
                }}
              >
                {currentStories[currentStoryIndex].imagem_url ? (
                  <img 
                    src={currentStories[currentStoryIndex].imagem_url!}
                    alt="Story"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <p className="text-white text-xl text-center">
                    {currentStories[currentStoryIndex].conteudo}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 flex items-center gap-2 text-white/70">
                <Eye className="h-4 w-4" />
                <span className="text-sm">{currentStories[currentStoryIndex].visualizacoes}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
