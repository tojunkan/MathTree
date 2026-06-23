import { useState, useRef, useEffect } from 'react';
import { useGraphStore } from '../../stores/graphStore';
import { searchApi } from '../../api/client';
import type { NodeRow } from '../../types';

export function SearchBar() {
  const { selectNode, setFilters, filters } = useGraphStore();
  const [query, setQuery] = useState(filters.searchQuery);
  const [results, setResults] = useState<NodeRow[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setSearching(true);
    try {
      const data = await searchApi.search(q);
      setResults(data);
      setOpen(data.length > 0);
    } catch {
      setResults([]);
    }
    setSearching(false);
  };

  const handleChange = (value: string) => {
    setQuery(value);
    setFilters({ searchQuery: value });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 250);
  };

  const handleSelect = (node: NodeRow) => {
    selectNode(node.id);
    setOpen(false);
    setQuery(node.label);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="搜索节点..."
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-blue-600 focus:outline-none"
      />
      {searching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
          {results.map((n) => (
            <button
              key={n.id}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 flex items-center gap-2 transition-colors"
              onClick={() => handleSelect(n)}
            >
              <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                n.type === 'Entity' ? 'bg-green-800 text-green-300' : 'bg-orange-800 text-orange-300'
              }`}>
                {n.type}
              </span>
              <span className="text-gray-200 truncate">{n.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
