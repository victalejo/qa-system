import React, { useState } from 'react';
import api from '../lib/api';
import './CommentSection.css';

interface Comment {
  _id?: string;
  user: {
    name: string;
    email: string;
  };
  text: string;
  createdAt: string;
}

interface CommentSectionProps {
  reportId: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  reportId,
  comments,
  onCommentAdded
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setError('El comentario no puede estar vacío');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/bug-reports/${reportId}/comments`, {
        text: newComment.trim()
      });
      setNewComment('');
      onCommentAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al agregar comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Hace un momento';
    if (diffInMins < 60) return `Hace ${diffInMins} ${diffInMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffInHours < 24) return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    if (diffInDays < 7) return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="comment-section">
      {/* Lista de comentarios */}
      {comments.length > 0 ? (
        <div className="comments-list">
          {comments.map((comment, index) => (
            <div key={comment._id || index} className="comment-item">
              <div className="comment-avatar">
                {comment.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">{comment.user.name}</span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-comments">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>No hay comentarios aún</p>
        </div>
      )}

      {/* Formulario para nuevo comentario */}
      <form onSubmit={handleSubmit} className="comment-form">
        <div className="comment-form-header">
          <label htmlFor="new-comment">Agregar Comentario</label>
        </div>
        {error && <div className="comment-error">{error}</div>}
        <textarea
          id="new-comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          className="comment-input"
          rows={3}
          disabled={isSubmitting}
        />
        <div className="comment-form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-small"></span>
                Enviando...
              </>
            ) : (
              'Agregar Comentario'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
