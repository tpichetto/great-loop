import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { commentsAPI } from '../../services/api';
import './AdminPages.css';

export function AdminCommentModeration() {
  const {
    data: comments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['comments', 'moderation'],
    queryFn: () => commentsAPI.fetchFlagged(),
    staleTime: 2 * 60 * 1000,
  });

  const handleApprove = async (commentId: string) => {
    try {
      await commentsAPI.approve(commentId);
      // Refetch comments after action
    } catch (err) {
      console.error('Failed to approve comment:', err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentsAPI.delete(commentId);
        // Refetch comments after action
      } catch (err) {
        console.error('Failed to delete comment:', err);
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Loading comments...</div>;
  }

  if (error) {
    return (
      <div className="error">Error: {error instanceof Error ? error.message : 'Unknown error'}</div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Comment Moderation</h1>
        <p className="page-subtitle">Review and manage flagged comments</p>
      </div>

      {!comments || comments.length === 0 ? (
        <div className="empty-state">
          <p>No flagged comments to review.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Comment</th>
                <th>Author</th>
                <th>Landmark</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id}>
                  <td>
                    <div className="comment-content">
                      <p>{comment.content}</p>
                    </div>
                  </td>
                  <td>{comment.authorName}</td>
                  <td>
                    <Link to={`/landmarks/${comment.landmarkId}`} className="link">
                      View Landmark
                    </Link>
                  </td>
                  <td>
                    <span className={`flag-badge flag-${comment.flagReason}`}>
                      {comment.flagReason}
                    </span>
                  </td>
                  <td>{new Date(comment.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleApprove(comment.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(comment.id)}
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
