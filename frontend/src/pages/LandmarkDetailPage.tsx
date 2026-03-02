import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { landmarkAPI, commentsAPI, progressAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './LandmarkDetailPage.css';

export function LandmarkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const {
    data: landmark,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['landmark', id],
    queryFn: () => landmarkAPI.fetchById(id!),
    enabled: Boolean(id),
  });

  const { data: comments } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => commentsAPI.fetchByLandmark(id!),
    enabled: Boolean(id),
  });

  const { data: progress } = useQuery({
    queryKey: ['progress'],
    queryFn: () => progressAPI.getProgress(),
    staleTime: 5 * 60 * 1000,
  });

  const isVisited = progress?.visitedLandmarks.includes(id!);
  const isCollected = progress?.collectedLandmarks.includes(id!);

  const handleToggleVisited = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/landmarks/${id}` } } });
      return;
    }

    try {
      if (isVisited) {
        await progressAPI.unmarkVisited(id!);
      } else {
        await progressAPI.markVisited(id!);
      }
      // Invalidate progress query to refetch
    } catch (err) {
      console.error('Failed to update visited status:', err);
    }
  };

  const handleToggleCollected = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/landmarks/${id}` } } });
      return;
    }

    try {
      if (isCollected) {
        await progressAPI.unmarkCollected(id!);
      } else {
        await progressAPI.markCollected(id!);
      }
      // Invalidate progress query to refetch
    } catch (err) {
      console.error('Failed to update collected status:', err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await commentsAPI.create({
        content: newComment.trim(),
        landmarkId: id!,
      });
      setNewComment('');
      // Invalidate comments query to refetch
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleFlagComment = async (commentId: string, reason: string) => {
    if (!window.confirm('Flag this comment for review?')) return;

    try {
      await commentsAPI.flag(commentId, reason);
      // Invalidate comments query to refetch
    } catch (err) {
      console.error('Failed to flag comment:', err);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading landmark...</div>;
  }

  if (error || !landmark) {
    return (
      <div className="error-page">
        <h2>Landmark not found</h2>
        <p>The landmark you're looking for doesn't exist or has been removed.</p>
        <Link to="/map" className="btn btn-primary">
          Back to Map
        </Link>
      </div>
    );
  }

  return (
    <div className="landmark-detail-page">
      <div className="detail-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="detail-content">
          <div className="detail-main">
            <div className="detail-images">
              {landmark.images && landmark.images.length > 0 ? (
                <img src={landmark.images[0]} alt={landmark.name} className="main-image" />
              ) : (
                <div className="image-placeholder">
                  <span>No image available</span>
                </div>
              )}
            </div>

            <div className="detail-info">
              <h1 className="detail-title">{landmark.name}</h1>

              <div className="detail-meta">
                <span className={`category-badge ${landmark.category}`}>{landmark.category}</span>
                {landmark.rating && (
                  <span className="rating">
                    ★ {landmark.rating.toFixed(1)}
                    {landmark.reviewCount && (
                      <span className="review-count">({landmark.reviewCount} reviews)</span>
                    )}
                  </span>
                )}
              </div>

              <div className="detail-description">
                <h3>About</h3>
                <p>{landmark.description}</p>
              </div>

              <div className="detail-location">
                <h3>Location</h3>
                <p className="address">{landmark.address}</p>
                <div className="coordinates">
                  Lat: {landmark.latitude.toFixed(6)}, Lng: {landmark.longitude.toFixed(6)}
                </div>
              </div>

              {landmark.openingHours && landmark.openingHours.length > 0 && (
                <div className="detail-hours">
                  <h3>Opening Hours</h3>
                  <ul>
                    {landmark.openingHours.map((hours, idx) => (
                      <li key={idx}>
                        <strong>{hours.day}:</strong> {hours.open} - {hours.close}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="detail-actions">
                <button
                  className={`action-btn visited-btn ${isVisited ? 'active' : ''}`}
                  onClick={handleToggleVisited}
                  title={isVisited ? 'Mark as not visited' : 'Mark as visited'}
                >
                  {isVisited ? '✓ Visited' : 'Mark Visited'}
                </button>
                <button
                  className={`action-btn collected-btn ${isCollected ? 'active' : ''}`}
                  onClick={handleToggleCollected}
                  title={isCollected ? 'Remove from collection' : 'Add to collection'}
                >
                  {isCollected ? '★ Collected' : '☆ Collect'}
                </button>
              </div>

              {(landmark.phone || landmark.website) && (
                <div className="detail-contact">
                  {landmark.phone && (
                    <a href={`tel:${landmark.phone}`} className="contact-link">
                      📞 {landmark.phone}
                    </a>
                  )}
                  {landmark.website && (
                    <a
                      href={landmark.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link"
                    >
                      🌐 Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="comments-section">
            <h2>Comments ({comments?.length || 0})</h2>

            {isAuthenticated ? (
              <form onSubmit={handleSubmitComment} className="comment-form">
                <textarea
                  placeholder="Share your thoughts about this landmark..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  disabled={isSubmittingComment}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingComment || !newComment.trim()}
                >
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            ) : (
              <div className="login-prompt">
                <p>
                  <Link to="/login">Sign in</Link> to leave a comment.
                </p>
              </div>
            )}

            <div className="comments-list">
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <span className="comment-author">{comment.authorName}</span>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                    {user?.role === 'admin' && comment.flagReason && (
                      <div className="admin-badge">Flagged: {comment.flagReason}</div>
                    )}
                    {isAuthenticated && (
                      <div className="comment-actions">
                        <button
                          className="flag-btn"
                          onClick={() => handleFlagComment(comment.id, 'inappropriate')}
                          title="Flag as inappropriate"
                        >
                          🚩 Flag
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-comments">No comments yet. Be the first to share!</p>
              )}
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-card map-link">
            <h3>View on Map</h3>
            <p>See this landmark in the interactive map</p>
            <Link to={`/map?focus=${id}`} className="btn btn-primary">
              Open Map
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
