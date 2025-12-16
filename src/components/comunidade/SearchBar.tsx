import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, User, FileText, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SearchResult {
  type: "user" | "post";
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string | null;
  postType?: string;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true);
      const searchResults: SearchResult[] = [];

      // Buscar usuários
      const { data: users } = await supabase
        .from("perfis")
        .select("user_id, nome, username, avatar_url")
        .or(`nome.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(5);

      if (users) {
        users.forEach((user) => {
          searchResults.push({
            type: "user",
            id: user.user_id,
            title: user.nome,
            subtitle: user.username ? `@${user.username}` : undefined,
            avatar: user.avatar_url,
          });
        });
      }

      // Buscar posts (não anônimos)
      const { data: posts } = await supabase
        .from("comunidade_posts")
        .select("id, titulo, conteudo, tipo, anonimo")
        .eq("anonimo", false)
        .or(`titulo.ilike.%${query}%,conteudo.ilike.%${query}%,tags.cs.{${query}}`)
        .limit(5);

      if (posts) {
        posts.forEach((post) => {
          searchResults.push({
            type: "post",
            id: post.id,
            title: post.titulo || post.conteudo.substring(0, 50) + "...",
            subtitle: post.tipo,
            postType: post.tipo,
          });
        });
      }

      setResults(searchResults);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    if (result.type === "user") {
      navigate(`/perfil/${result.id}`);
    } else {
      navigate(`/comunidade/${result.id}`);
    }
    setIsOpen(false);
    setQuery("");
  };

  const handleSearch = () => {
    if (onSearch && query.trim()) {
      onSearch(query.trim());
      setIsOpen(false);
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

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "pergunta":
        return "❓";
      case "dica":
        return "💡";
      case "enquete":
        return "📊";
      default:
        return "📝";
    }
  };

  return (
    <div className="relative w-full">
      <Popover open={isOpen && query.length >= 2} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar posts, usuários, tags..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="pl-10 pr-10"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandList>
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Buscando...
                </div>
              ) : results.length === 0 ? (
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              ) : (
                <>
                  {results.filter((r) => r.type === "user").length > 0 && (
                    <CommandGroup heading="Usuárias">
                      {results
                        .filter((r) => r.type === "user")
                        .map((result) => (
                          <CommandItem
                            key={result.id}
                            onSelect={() => handleSelect(result)}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={result.avatar || undefined} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {getInitials(result.title)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{result.title}</span>
                              {result.subtitle && (
                                <span className="text-xs text-muted-foreground">
                                  {result.subtitle}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  )}
                  {results.filter((r) => r.type === "post").length > 0 && (
                    <CommandGroup heading="Posts">
                      {results
                        .filter((r) => r.type === "post")
                        .map((result) => (
                          <CommandItem
                            key={result.id}
                            onSelect={() => handleSelect(result)}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <span>{getPostTypeIcon(result.postType || "post")}</span>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-medium truncate">{result.title}</span>
                              <span className="text-xs text-muted-foreground capitalize">
                                {result.subtitle}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
