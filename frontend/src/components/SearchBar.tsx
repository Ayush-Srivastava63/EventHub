import { useState } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search events...', initialValue = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(query.trim());
  }

  function handleClear() {
    setQuery('');
    onSearch('');
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} id="search-bar">
      <span className="search-bar__icon">🔍</span>
      <input
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button type="button" className="search-bar__clear" onClick={handleClear}>
          ✕
        </button>
      )}
      <button type="submit" className="search-bar__btn">Search</button>
    </form>
  );
}
