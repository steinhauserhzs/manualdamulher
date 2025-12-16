import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, EyeOff } from "lucide-react";
import { criarNotificacao, getNomeUsuario, detectarMencoes } from "@/lib/notificacoes";

interface PostFormProps {
  onSuccess: () => void;
}

export const PostForm = ({ onSuccess }: PostFormProps) => {
  const [tipo, setTipo] = useState<string>("post");
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [opcoesEnquete, setOpcoesEnquete] = useState<string[]>(["", ""]);
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [anonimo, setAnonimo] = useState(false);

  const adicionarTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removerTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const adicionarOpcaoEnquete = () => {
    setOpcoesEnquete([...opcoesEnquete, ""]);
  };

  const removerOpcaoEnquete = (index: number) => {
    if (opcoesEnquete.length > 2) {
      setOpcoesEnquete(opcoesEnquete.filter((_, i) => i !== index));
    }
  };

  const atualizarOpcaoEnquete = (index: number, valor: string) => {
    const novasOpcoes = [...opcoesEnquete];
    novasOpcoes[index] = valor;
    setOpcoesEnquete(novasOpcoes);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setImagemFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagemPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImagem = async (userId: string): Promise<string | null> => {
    if (!imagemFile) return null;

    try {
      const fileExt = imagemFile.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("comunidade-imagens")
        .upload(fileName, imagemFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("comunidade-imagens")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast.error("Erro ao enviar imagem");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!conteudo.trim()) {
      toast.error("O conteúdo do post não pode estar vazio");
      return;
    }

    if (tipo === "enquete") {
      const opcoesValidas = opcoesEnquete.filter((op) => op.trim());
      if (opcoesValidas.length < 2) {
        toast.error("A enquete deve ter pelo menos 2 opções");
        return;
      }
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let imagemUrl: string | null = null;
      if (imagemFile) {
        imagemUrl = await uploadImagem(user.id);
      }

      // Criar post
      const { data: post, error: postError } = await supabase
        .from("comunidade_posts")
        .insert({
          user_id: user.id,
          tipo,
          titulo: titulo.trim() || null,
          conteudo: conteudo.trim(),
          tags: tags.length > 0 ? tags : null,
          imagem_url: imagemUrl,
          anonimo,
        })
        .select()
        .single();

      if (postError) throw postError;

      // Se for enquete, criar registro da enquete
      if (tipo === "enquete" && post) {
        const opcoesValidas = opcoesEnquete.filter((op) => op.trim());
        const opcoesFormatadas = opcoesValidas.map((opcao) => ({
          texto: opcao.trim(),
          votos: 0,
        }));

        const { error: enqueteError } = await supabase
          .from("comunidade_enquetes")
          .insert({
            post_id: post.id,
            opcoes: opcoesFormatadas,
            multipla_escolha: false,
          });

        if (enqueteError) throw enqueteError;
      }

      // Detect and notify mentions in the post content (only if not anonymous)
      if (!anonimo) {
        const mencionados = await detectarMencoes(conteudo);
        if (mencionados.length > 0 && post) {
          const nomeUsuario = await getNomeUsuario(user.id);
          for (const mencionadoId of mencionados) {
            await criarNotificacao({
              userId: mencionadoId,
              tipo: 'mencao',
              titulo: 'Você foi mencionada! 📢',
              mensagem: `${nomeUsuario} mencionou você em um post`,
              referenciaId: post.id,
              referenciaTipo: 'post'
            });
          }
        }
      }

      // Limpar formulário
      setTitulo("");
      setConteudo("");
      setTags([]);
      setOpcoesEnquete(["", ""]);
      setImagemFile(null);
      setImagemPreview(null);
      setAnonimo(false);

      onSuccess();
    } catch (error: any) {
      toast.error("Erro ao criar post. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de Post */}
      <div className="space-y-3">
        <Label>Tipo de Post</Label>
        <RadioGroup value={tipo} onValueChange={setTipo}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="post" id="post" />
            <Label htmlFor="post" className="cursor-pointer">
              📝 Post Normal
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pergunta" id="pergunta" />
            <Label htmlFor="pergunta" className="cursor-pointer">
              ❓ Pergunta
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dica" id="dica" />
            <Label htmlFor="dica" className="cursor-pointer">
              💡 Dica
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="enquete" id="enquete" />
            <Label htmlFor="enquete" className="cursor-pointer">
              📊 Enquete
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Opção de Anonimato */}
      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg border">
        <Checkbox
          id="anonimo"
          checked={anonimo}
          onCheckedChange={(checked) => setAnonimo(checked as boolean)}
        />
        <div className="flex items-center gap-2">
          <EyeOff className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="anonimo" className="cursor-pointer text-sm">
            Publicar anonimamente
          </Label>
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          Seu nome não será exibido
        </span>
      </div>

      {/* Título (opcional) */}
      <div>
        <Label htmlFor="titulo">Título (opcional)</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Dê um título ao seu post..."
          maxLength={200}
        />
      </div>

      {/* Conteúdo */}
      <div>
        <Label htmlFor="conteudo">
          Conteúdo <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="conteudo"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder={
            tipo === "pergunta"
              ? "Descreva sua pergunta..."
              : tipo === "dica"
              ? "Compartilhe sua dica..."
              : tipo === "enquete"
              ? "Descreva sua enquete..."
              : "Escreva seu post... Use @nome para mencionar alguém"
          }
          rows={5}
          maxLength={5000}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          {conteudo.length}/5000 caracteres • Use @nome para mencionar
        </p>
      </div>

      {/* Upload de Imagem */}
      <div>
        <Label htmlFor="imagem">Imagem (opcional)</Label>
        <div className="space-y-3">
          <Input
            id="imagem"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="cursor-pointer"
          />
          {imagemPreview && (
            <div className="relative">
              <img
                src={imagemPreview}
                alt="Preview"
                className="rounded-lg max-h-48 w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImagemFile(null);
                  setImagemPreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Opções de Enquete (se tipo for enquete) */}
      {tipo === "enquete" && (
        <div className="space-y-3">
          <Label>Opções da Enquete</Label>
          {opcoesEnquete.map((opcao, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={opcao}
                onChange={(e) => atualizarOpcaoEnquete(index, e.target.value)}
                placeholder={`Opção ${index + 1}`}
                maxLength={100}
              />
              {opcoesEnquete.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removerOpcaoEnquete(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {opcoesEnquete.length < 5 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={adicionarOpcaoEnquete}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Opção
            </Button>
          )}
        </div>
      )}

      {/* Tags */}
      <div className="space-y-3">
        <Label htmlFor="tags">Tags (opcional)</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionarTag();
              }
            }}
            placeholder="Adicione tags..."
            maxLength={20}
          />
          <Button type="button" variant="outline" onClick={adicionarTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removerTag(index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Botões */}
      <div className="flex gap-3 justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Publicando..." : "Publicar"}
        </Button>
      </div>
    </form>
  );
};
