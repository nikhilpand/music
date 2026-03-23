import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (q: string) => void;
  onSuggestionsFetch: (q: string) => Promise<string[]>;
  currentQuery: string;
}

export function SearchBar({ onSearch, onSuggestionsFetch, currentQuery }: SearchBarProps) {
  const [value, setValue] = useState(currentQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const [loadingSugg, setLoadingSugg] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setValue(currentQuery); }, [currentQuery]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setSuggestions([]); return; }
    setLoadingSugg(true);
    try {
      const s = await onSuggestionsFetch(q);
      setSuggestions(s);
      setShowSugg(s.length > 0);
    } finally {
      setLoadingSugg(false);
    }
  }, [onSuggestionsFetch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 350);
  };

  const handleSubmit = (q: string) => {
    if (!q.trim()) return;
    setValue(q);
    setShowSugg(false);
    onSearch(q);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full max-w-[560px]">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2.5 ring-1 ring-transparent transition-all focus-within:border-white/20 focus-within:bg-white/10 focus-within:ring-white/10">
        <Search className="h-4 w-4 shrink-0 text-white/45" />
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={e => { if (e.key === "Enter") handleSubmit(value); if (e.key === "Escape") setShowSugg(false); }}
          onFocus={() => suggestions.length > 0 && setShowSugg(true)}
          placeholder="Search songs, artists, albums..."
          className="flex-1 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
        />
        {loadingSugg && <Loader2 className="h-3.5 w-3.5 animate-spin text-white/40" />}
        {value && !loadingSugg && (
          <button onClick={() => { setValue(""); setSuggestions([]); setShowSugg(false); }}>
            <X className="h-3.5 w-3.5 text-white/40 hover:text-white/70" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSugg && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-white/10 bg-[#1e1e1e] shadow-2xl">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={() => handleSubmit(s)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/80 transition hover:bg-white/8"
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-white/35" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
