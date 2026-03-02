import { useMapStore } from '../../store/useMapStore';
import { LandmarkCategory } from '../../types';
import './SearchFilterControls.css';

const CATEGORIES: { value: LandmarkCategory; label: string; emoji: string }[] = [
  { value: 'attraction', label: 'Attraction', emoji: '🎢' },
  { value: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { value: 'park', label: 'Park', emoji: '🌳' },
  { value: 'museum', label: 'Museum', emoji: '🏛️' },
  { value: 'historic', label: 'Historic', emoji: '🏰' },
  { value: 'nature', label: 'Nature', emoji: '🌲' },
  { value: 'entertainment', label: 'Ent.', emoji: '🎭' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
];

const DISTANCE_OPTIONS = [
  { value: 0, label: 'Any distance' },
  { value: 1, label: 'Within 1 km' },
  { value: 5, label: 'Within 5 km' },
  { value: 10, label: 'Within 10 km' },
  { value: 25, label: 'Within 25 km' },
  { value: 50, label: 'Within 50 km' },
];

export function SearchFilterControls() {
  const { filters, setFilters, userLocation, setViewport } = useMapStore();

  const handleCategoryToggle = (category: LandmarkCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    setFilters({ categories: newCategories });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ searchQuery: e.target.value });
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === '0' ? null : Number(e.target.value);
    setFilters({ distance: value });
  };

  const handleLocateMe = () => {
    if (userLocation) {
      setViewport({
        center: [userLocation.latitude, userLocation.longitude],
        zoom: 12,
      });
    }
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      distance: null,
      searchQuery: '',
    });
  };

  const hasActiveFilters =
    filters.categories.length > 0 || filters.distance !== null || filters.searchQuery;

  return (
    <div className="search-filter-controls">
      <div className="controls-header">
        <h2>Find Landmarks</h2>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Clear filters
          </button>
        )}
      </div>

      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Search landmarks..."
          value={filters.searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        {filters.searchQuery && (
          <button className="clear-search-btn" onClick={() => setFilters({ searchQuery: '' })}>
            ✕
          </button>
        )}
      </div>

      {userLocation && (
        <button className="locate-me-btn" onClick={handleLocateMe}>
          📍 Use my location
        </button>
      )}

      <div className="filter-group">
        <h3>Categories</h3>
        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`category-btn ${filters.categories.includes(cat.value) ? 'active' : ''}`}
              onClick={() => handleCategoryToggle(cat.value)}
              title={cat.label}
            >
              <span className="category-emoji">{cat.emoji}</span>
              <span className="category-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>Distance</h3>
        <select
          value={filters.distance ?? 0}
          onChange={handleDistanceChange}
          className="distance-select"
        >
          {DISTANCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="active-filters-summary">
        {filters.categories.length > 0 && <span>{filters.categories.length} categories</span>}
        {filters.distance && <span>Within {filters.distance} km</span>}
        {filters.searchQuery && <span>"{filters.searchQuery}"</span>}
      </div>
    </div>
  );
}
