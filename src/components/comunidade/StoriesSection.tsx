import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Eye, ImagePlus, EyeOff, User } from "lucide-react";
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
  anonimo?: boolean;
  perfil?: {
    nome: string;
    avatar_url: string | null;
    username?: string | null;
  };
}

interface StoriesByUser {
  user_id: string;
  nome: string;
  avatar_url: string | null;
  username?: string | null;
  stories: Story[];
  anonimo?: boolean;
}

export const StoriesSection = () => {
  const [storiesByUser, setStoriesByUser] = useState<StoriesByUser[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentStories, setCurrentStories] = useState<Story[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentStoryUser, setCurrentStoryUser] = useState<StoriesByUser | null>(null);
  const [novoStory, setNovoStory] = useState({ conteudo: "" });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [anonimo, setAnonimo] = useState(false);

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
        .select("user_id, nome, avatar_url, username")
        .in("user_id", userIds);

      const perfisMap = new Map(perfis?.map(p => [p.user_id, p]) || []);

      // Agrupar stories por usuário
      const grouped = data.reduce((acc, story) => {
        const perfil = perfisMap.get(story.user_id);
        const isAnonimo = (story as any).anonimo === true;
        
        if (!acc[story.user_id]) {
          acc[story.user_id] = {
            user_id: story.user_id,
            nome: isAnonimo ? "Anônima" : (perfil?.nome || "Usuária"),
            avatar_url: isAnonimo ? null : (perfil?.avatar_url || null),
            username: isAnonimo ? null : perfil?.username,
            stories: [],
            anonimo: isAnonimo
          };
        }
        acc[story.user_id].stories.push({ 
          ...story, 
          perfil,
          anonimo: isAnonimo 
        });
        return acc;
      }, {} as Record<string, StoriesByUser>);

      setStoriesByUser(Object.values(grouped));
    }
    setLoading(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Selecione uma imagem válida", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Imagem muito grande", description: "Máximo 5MB", variant: "destructive" });
      return;
    }

    setImagemFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagemPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removerImagem = () => {
    setImagemFile(null);
    setImagemPreview(null);
  };

  const uploadImagem = async (userId: string): Promise<string | null> => {
    if (!imagemFile) return null;

    const fileExt = imagemFile.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `stories/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('comunidade-imagens')
      .upload(filePath, imagemFile);

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      throw new Error('Erro ao fazer upload da imagem');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('comunidade-imagens')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const criarStory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!novoStory.conteudo && !imagemFile) {
      toast({ title: "Adicione um texto ou imagem", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      let imagemUrl: string | null = null;

      if (imagemFile) {
        imagemUrl = await uploadImagem(user.id);
      }

      const { error } = await supabase.from("comunidade_stories").insert({
        user_id: user.id,
        conteudo: novoStory.conteudo || null,
        imagem_url: imagemUrl,
        anonimo
      });

      if (error) {
        toast({ title: "Erro ao criar story", variant: "destructive" });
        return;
      }

      toast({ title: "Story publicado!", description: "Expira em 24 horas" });
      setDialogOpen(false);
      setNovoStory({ conteudo: "" });
      setImagemFile(null);
      setImagemPreview(null);
      setAnonimo(false);
      carregarStories();
    } catch (error) {
      toast({ title: "Erro ao fazer upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const visualizarStories = async (userStories: StoriesByUser) => {
    setCurrentStories(userStories.stories);
    setCurrentStoryUser(userStories);
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
              {/* Opção de Anonimato */}
              <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg border">
                <Checkbox
                  id="anonimo-story"
                  checked={anonimo}
                  onCheckedChange={(checked) => setAnonimo(checked as boolean)}
                />
                <div className="flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="anonimo-story" className="cursor-pointer text-sm">
                    Publicar anonimamente
                  </Label>
                </div>
              </div>

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
                <Label>Imagem (opcional)</Label>
                {imagemPreview ? (
                  <div className="relative mt-2">
                    <img 
                      src={imagemPreview} 
                      alt="Preview" 
                      className="rounded-lg max-h-40 w-full object-cover"
                    />
                    <Button 
                      variant="destructive" 
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={removerImagem}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <label className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <ImagePlus className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Selecionar da galeria</span>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
              <Button onClick={criarStory} className="w-full" disabled={uploading}>
                {uploading ? "Publicando..." : "Publicar Story"}
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
                {userStory.anonimo ? (
                  <AvatarFallback className="bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </AvatarFallback>
                ) : (
                  <>
                    <AvatarImage src={userStory.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(userStory.nome)}</AvatarFallback>
                  </>
                )}
              </Avatar>
            </div>
            <span className="text-xs text-muted-foreground truncate w-16 text-center">
              {userStory.anonimo ? "Anônima" : userStory.nome.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Visualizador de Stories */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-black">
          {currentStories[currentStoryIndex] && currentStoryUser && (
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

              {/* Header com autor */}
              <div className="absolute top-6 left-4 right-12 z-10 flex items-center gap-3">
                {currentStoryUser.anonimo ? (
                  <Avatar className="h-8 w-8 border border-white/30">
                    <AvatarFallback className="bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Link to={`/perfil/${currentStoryUser.user_id}`}>
                    <Avatar className="h-8 w-8 border border-white/30">
                      <AvatarImage src={currentStoryUser.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(currentStoryUser.nome)}</AvatarFallback>
                    </Avatar>
                  </Link>
                )}
                <div className="flex flex-col">
                  {currentStoryUser.anonimo ? (
                    <span className="text-white text-sm font-medium">Usuária Anônima</span>
                  ) : (
                    <Link to={`/perfil/${currentStoryUser.user_id}`} className="text-white text-sm font-medium hover:underline">
                      {currentStoryUser.nome}
                    </Link>
                  )}
                  {currentStoryUser.username && !currentStoryUser.anonimo && (
                    <span className="text-white/70 text-xs">@{currentStoryUser.username}</span>
                  )}
                </div>
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
                className="flex-1 flex items-center justify-center p-6 pt-16"
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
