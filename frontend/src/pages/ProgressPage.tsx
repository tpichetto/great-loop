import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { progressAPI } from '../services/api';
import './ProgressPage.css';

export function ProgressPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    data: progress,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['progress'],
    queryFn: () => progressAPI.getProgress(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const visitedCount = progress?.visitedLandmarks.length || 0;
  const collectedCount = progress?.collectedLandmarks.length || 0;

  if (isLoading) {
    return <div className="loading">Loading your progress...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Error loading progress: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="progress-page">
      <div className="page-header">
        <h1 className="page-title">My Progress</h1>
        <p className="page-subtitle">Track your visited and collected landmarks</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card visited">
          <div className="stat-number">{visitedCount}</div>
          <div className="stat-label">Visited</div>
        </div>
        <div className="stat-card collected">
          <div className="stat-number">{collectedCount}</div>
          <div className="stat-label">Collected</div>
        </div>
      </div>

      <div className="progress-tabs">
        <button
          className={`tab-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
        >
          Grid View
        </button>
        <button
          className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          List View
        </button>
      </div>

      <div className="progress-sections">
        <section className="progress-section">
          <h2 className="section-title">Visited Landmarks ({visitedCount})</h2>
          {visitedCount === 0 ? (
            <div className="empty-state">
              <p>You haven't visited any landmarks yet.</p>
              <a href="/map" className="btn btn-primary">
                Start Exploring
              </a>
            </div>
          ) : (
            <div className={`landmarks-container ${viewMode}`}>
              {progress?.visitedLandmarks.map((landmarkId) => (
                <div key={landmarkId} className="landmark-card">
                  <div className="landmark-placeholder">Landmark {landmarkId}</div>
                  <div className="landmark-info">
                    <h3 className="landmark-name">Landmark Name</h3>
                    <p className="landmark-category">Category</p>
                  </div>
                  <div className="landmark-status visited-badge">Visited</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="progress-section">
          <h2 className="section-title">Collected Landmarks ({collectedCount})</h2>
          {collectedCount === 0 ? (
            <div className="empty-state">
              <p>You haven't collected any landmarks yet.</p>
              <a href="/map" className="btn btn-primary">
                Start Exploring
              </a>
            </div>
          ) : (
            <div className={`landmarks-container ${viewMode}`}>
              {progress?.collectedLandmarks.map((landmarkId) => (
                <div key={landmarkId} className="landmark-card collected">
                  <div className="landmark-placeholder">🏆</div>
                  <div className="landmark-info">
                    <h3 className="landmark-name">Landmark Name</h3>
                    <p className="landmark-category">Category</p>
                  </div>
                  <div className="landmark-status collected-badge">Collected</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
