'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Loader2, ChevronDown } from 'lucide-react';
import { searchTags } from '@/app/actions/search-tags';

interface Props {
  label: string;
  field: 'notes' | 'accords' | 'perfumers';
  selected: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  autoFocus?: boolean; // New prop to control auto-focus
}

export default function AsyncTagInput({ label, field, selected, onChange, placeholder,autoFocus }: Props) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  if (autoFocus && inputRef.current) {
    inputRef.current.focus();
    setIsOpen(true);      // 👈 open dropdown automatically
    fetchTags(input);     // 👈 load suggestions immediately
  }
}, [autoFocus]);
  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Function to fetch tags
  const fetchTags = async (query: string) => {
    setLoading(true);
    try {
      const results = await searchTags(field, query);
      // Filter out items already selected so they don't show up twice
      setSuggestions(results.filter(r => !selected.includes(r)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Input Typing
  useEffect(() => {
    const timer = setTimeout(() => {
      // If open, fetch based on input
      if (isOpen) {
        fetchTags(input);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input, isOpen]); // Re-run when input changes or box opens

  const handleFocus = () => {
    setIsOpen(true);
    // Fetch immediately on click (even if empty) to show suggestions
    fetchTags(input); 
  };

  const addTag = (tag: string) => {
    onChange([...selected, tag]);
    setInput(''); // Clear input after adding
    setIsOpen(false); // Close dropdown
  };

  const removeTag = (tag: string) => {
    onChange(selected.filter(t => t !== tag));
  };

  return (
    <div className="w-full mb-6" ref={wrapperRef}>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{label}</label>
      
      {/* Selected Tags Area */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map(tag => (
          <span key={tag} className="bg-[#ece0cf] text-[#897452] text-xs px-3 py-1 rounded-full flex items-center gap-1 font-medium shadow-sm animate-fadeIn">
            {tag}
            <button onClick={() => removeTag(tag)} className="text-[#897452] p-0.5 ml-1">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>

      {/* Input Area */}
      <div className="relative">
        <input
          ref={inputRef}

          className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-gray-500 outline-none transition-all bg-white text-black"
          placeholder={placeholder || `Search or click to see ${label}...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onFocus={handleFocus}
        />
        
        {/* Spinner or Icon on the right */}
        <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <ChevronDown size={16} />}
        </div>
        
        {/* Dropdown Results */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
            {suggestions.length > 0 ? (
              suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => addTag(s)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-green-50 text-gray-700 flex items-center gap-2 border-b border-gray-50 last:border-0 transition-colors"
                >
                  <Plus size={14} className="text-gray-500" /> {s}
                </button>
              ))
            ) : (
              <div className="p-4 text-xs text-gray-400 text-center italic">
                {loading ? "Loading..." : "No results found."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}