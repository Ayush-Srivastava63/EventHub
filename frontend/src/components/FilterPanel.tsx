import './FilterPanel.css';

interface FilterPanelProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: FilterPanelProps) {
  return (
    <div className="filter-panel" id="filter-panel">
      <div className="filter-panel__group">
        <label className="filter-panel__label">Category</label>
        <select
          className="filter-panel__select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-panel__group">
        <label className="filter-panel__label">Sort By</label>
        <select
          className="filter-panel__select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="date_asc">Date (Earliest First)</option>
          <option value="date_desc">Date (Latest First)</option>
          <option value="title_asc">Title (A-Z)</option>
          <option value="title_desc">Title (Z-A)</option>
        </select>
      </div>
    </div>
  );
}
