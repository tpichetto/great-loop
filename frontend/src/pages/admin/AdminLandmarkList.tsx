import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { landmarkAPI } from '../../services/api';
import type { Landmark } from '../../types';
import './AdminPages.css';

export function AdminLandmarkList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const {
    data: landmarks,
    isLoading,
    error,
  } = useQuery<Landmark[]>({
    queryKey: ['landmarks', 'admin'],
    queryFn: () =>
      landmarkAPI.fetchByBoundingBox({
        minLat: -90,
        maxLat: 90,
        minLng: -180,
        maxLng: 180,
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const filteredLandmarks =
    landmarks?.filter((landmark) => {
      const matchesSearch =
        searchQuery === '' ||
        landmark.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        landmark.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === '' || landmark.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }) || [];

  const categories = Array.from(new Set(landmarks?.map((l: Landmark) => l.category) || []));

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Manage Landmarks</h1>
          <p className="page-subtitle">Create, edit, and manage all landmarks</p>
        </div>
        <Link to="/admin/landmarks/new" className="btn btn-primary">
          + Add Landmark
        </Link>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search landmarks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="loading">Loading landmarks...</div>
      ) : error ? (
        <div className="error">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLandmarks.map((landmark) => (
                <tr key={landmark.id}>
                  <td>
                    <div className="landmark-info">
                      <strong>{landmark.name}</strong>
                      <div className="landmark-preview">{landmark.shortDescription}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`category-badge ${landmark.category}`}>
                      {landmark.category}
                    </span>
                  </td>
                  <td>{landmark.address}</td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/admin/landmarks/${landmark.id}/edit`}
                        className="btn btn-sm btn-secondary"
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this landmark?')) {
                            // TODO: Implement delete functionality
                            // await landmarkAPI.delete(landmark.id);
                            // refetch();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
