import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Upload, User, X } from "lucide-react";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userId: string;
  userName: string;
  onAvatarUpdate: (url: string | null) => void;
}

const AvatarUpload = ({ currentAvatarUrl, userId, userName, onAvatarUpdate }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Você precisa selecionar uma imagem para upload");
      }

      const file = event.target.files[0];
      
      // Validar tipo de arquivo
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        throw new Error("Formato inválido. Use JPEG, PNG ou WebP");
      }

      // Validar tamanho (máx 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("Imagem muito grande. Máximo 2MB");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Se já existe um avatar, deletar o antigo
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split("/").slice(-2).join("/");
        await supabase.storage.from("avatares").remove([oldPath]);
      }

      // Upload do novo avatar
      const { error: uploadError } = await supabase.storage
        .from("avatares")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("avatares")
        .getPublicUrl(fileName);

      // Atualizar perfil no banco
      const { error: updateError } = await supabase
        .from("perfis")
        .update({ avatar_url: publicUrl })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      onAvatarUpdate(publicUrl);
      toast.success("Foto de perfil atualizada! ✨");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const deleteAvatar = async () => {
    try {
      setDeleting(true);

      if (!currentAvatarUrl) return;

      // Extrair o path do arquivo
      const oldPath = currentAvatarUrl.split("/").slice(-2).join("/");
      
      // Deletar do storage
      const { error: deleteError } = await supabase.storage
        .from("avatares")
        .remove([oldPath]);

      if (deleteError) throw deleteError;

      // Atualizar perfil no banco
      const { error: updateError } = await supabase
        .from("perfis")
        .update({ avatar_url: null })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      onAvatarUpdate(null);
      toast.success("Foto de perfil removida");
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover foto");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-32 w-32 border-4 border-primary/20">
        <AvatarImage src={currentAvatarUrl || undefined} alt={userName} />
        <AvatarFallback className="text-3xl bg-primary/10 text-primary">
          <User className="h-16 w-16" />
        </AvatarFallback>
      </Avatar>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || deleting}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {currentAvatarUrl ? "Alterar Foto" : "Adicionar Foto"}
        </Button>

        {currentAvatarUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={deleteAvatar}
            disabled={uploading || deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <X className="h-4 w-4 mr-2" />
            )}
            Remover
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={uploadAvatar}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground text-center">
        JPEG, PNG ou WebP. Máximo 2MB.
      </p>
    </div>
  );
};

export default AvatarUpload;
