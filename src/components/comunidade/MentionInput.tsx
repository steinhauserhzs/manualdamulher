import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface UserSuggestion {
  user_id: string;
  nome: string;
  avatar_url: string | null;
}

export const MentionInput = ({ value, onChange, placeholder, className }: MentionInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      const { data } = await supabase
        .from("perfis")
        .select("user_id, nome, avatar_url")
        .ilike("nome", `%${searchTerm}%`)
        .limit(5);

      setSuggestions(data || []);
    };

    fetchUsers();
  }, [searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart || 0;
    setCursorPosition(position);
    onChange(newValue);

    // Check for @ mention
    const textBeforeCursor = newValue.substring(0, position);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setSearchTerm(mentionMatch[1]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSearchTerm("");
    }
  };

  const insertMention = (user: UserSuggestion) => {
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const mentionStart = textBeforeCursor.lastIndexOf("@");
    
    const newValue = 
      textBeforeCursor.substring(0, mentionStart) + 
      `@${user.nome} ` + 
      textAfterCursor;

    onChange(newValue);
    setShowSuggestions(false);
    setSearchTerm("");
    textareaRef.current?.focus();
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((user) => (
            <button
              key={user.user_id}
              type="button"
              onClick={() => insertMention(user)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent text-left"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>{user.nome[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{user.nome}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
