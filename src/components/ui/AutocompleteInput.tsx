"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

export interface AutocompleteOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface AutocompleteInputProps {
  options: AutocompleteOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AutocompleteInput({
  options,
  value,
  onChange,
  placeholder = "Digite para buscar…",
  disabled = false,
}: AutocompleteInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === value);

  const normalizeStr = (str: string) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredOptions =
    query.trim() === ""
      ? []
      : options
          .filter((o) => normalizeStr(o.label).includes(normalizeStr(query)))
          .slice(0, 8);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(option: AutocompleteOption) {
    onChange(option.id);
    setQuery(option.label);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || filteredOptions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search size={18} className="absolute left-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={selectedOption && !open ? selectedOption.label : query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange("");
            setOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border gd-border gd-surface-2 pl-10 pr-4 text-sm font-semibold gd-text outline-none transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-60 overflow-y-auto rounded-xl border gd-border bg-[var(--color-surface)] shadow-2xl p-1.5 space-y-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, i) => (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold cursor-pointer transition-colors ${
                  i === highlightedIndex ? "bg-[var(--color-primary)] text-white" : "gd-text hover:gd-surface-2"
                }`}
              >
                <span>{opt.label}</span>
                {opt.sublabel && (
                  <span className={`text-xs ${i === highlightedIndex ? "text-white/80" : "gd-muted"}`}>
                    {opt.sublabel}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="px-3 py-2.5 text-xs gd-muted text-center italic">
              Nenhuma sugestão encontrada para &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
