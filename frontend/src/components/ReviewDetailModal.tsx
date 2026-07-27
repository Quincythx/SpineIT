import React, { useState, useEffect } from 'react';
import { X, Star, Heart, Bookmark, Send, Trash2, BookOpen } from 'lucide-react';
import type { Review, Comment } from '../types/api';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ReviewDetailModalProps {
  review: Review | null;
  onClose: () => void;
  isLiked: boolean;
  isBookmarked: boolean;
  onLikeToggle: (reviewId: number) => void;
  onBookmarkToggle: (reviewId: number) => void;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  review,
  onClose,
  isLiked,
  isBookmarked,
  onLikeToggle,
  onBookmarkToggle,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (review) {
      fetchComments();
    }
  }, [review]);

  const fetchComments = async () => {
    if (!review) return;
    setIsLoadingComments(true);
    try {
      const data = await api.getComments(review.id);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review || !newCommentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const createdComment = await api.createComment(review.id, newCommentText.trim());
      setComments((prev) => [...prev, createdComment]);
      setNewCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  if (!review) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] border border-[#EAE0D0] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EAE0D0] flex items-center justify-between bg-[#F5EFE6]">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#854D0E]">Review Details</span>
            {review.genre && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAE0D0] text-[#854D0E] text-xs font-medium">
                {review.genre}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#78716C] hover:bg-[#EAE0D0] hover:text-[#1C1917] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Top Review Info Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* Book Cover Photo / Illustration */}
            <div className="w-full md:w-44 h-56 bg-[#EAE0D0]/50 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center border border-[#EAE0D0]">
              {review.image ? (
                <img
                  src={review.image}
                  alt={review.book_title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-4 text-center">
                  <BookOpen className="w-10 h-10 text-[#854D0E]/40 mx-auto mb-2" />
                  <p className="font-serif-editorial italic text-sm text-[#57534E]">{review.book_title}</p>
                </div>
              )}
            </div>

            {/* Book Metadata */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= review.rating ? 'text-[#D97706] fill-[#D97706]' : 'text-[#EAE0D0]'
                    }`}
                  />
                ))}
                <span className="text-sm font-bold text-[#1C1917] ml-2">{review.rating} out of 5 stars</span>
              </div>

              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] leading-tight">
                {review.book_title}
              </h2>
              <p className="text-base text-[#57534E]">
                Written by <span className="font-semibold text-[#1C1917]">{review.author}</span>
              </p>

              {/* Reviewer Badge & Date */}
              <div className="flex items-center space-x-3 pt-2 text-xs text-[#78716C]">
                <span className="font-medium text-[#1C1917]">Reviewed by @{review.user}</span>
                <span>•</span>
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
              </div>

              {/* Action Buttons (Like / Bookmark) */}
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={() => onLikeToggle(review.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center space-x-2 transition-all ${
                    isLiked
                      ? 'bg-[#991B1B] text-[#FDFBF7]'
                      : 'bg-[#F5EFE6] text-[#57534E] hover:bg-[#EAE0D0]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{isLiked ? 'Liked' : 'Like Review'}</span>
                </button>

                <button
                  onClick={() => onBookmarkToggle(review.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center space-x-2 transition-all ${
                    isBookmarked
                      ? 'bg-[#854D0E] text-[#FDFBF7]'
                      : 'bg-[#F5EFE6] text-[#57534E] hover:bg-[#EAE0D0]'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Review Body Text */}
          <div className="prose prose-stone max-w-none pt-4 border-t border-[#EAE0D0]">
            <p className="text-base text-[#2C2523] leading-relaxed whitespace-pre-line font-serif-editorial">
              {review.review_text}
            </p>
          </div>

          {/* Comments / Discussion Section */}
          <div className="pt-6 border-t border-[#EAE0D0] space-y-4">
            <h4 className="font-bold text-base text-[#1C1917]">
              Discussion & Comments ({comments.length})
            </h4>

            {/* Post Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a thoughtful comment..."
                  className="flex-1 px-4 py-2.5 bg-[#F5EFE6] border border-[#EAE0D0] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#854D0E]/30"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newCommentText.trim()}
                  className="px-5 py-2.5 bg-[#854D0E] hover:bg-[#B45309] text-[#FDFBF7] rounded-full text-sm font-semibold disabled:opacity-50 transition-all flex items-center space-x-1"
                >
                  <Send className="w-4 h-4" />
                  <span>Post</span>
                </button>
              </form>
            ) : (
              <p className="text-xs text-[#78716C] italic">Sign in to participate in the literary discussion.</p>
            )}

            {/* Comment List */}
            {isLoadingComments ? (
              <p className="text-xs text-[#78716C]">Loading discussion...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-[#78716C] italic py-2">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              <div className="space-y-3 pt-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3.5 bg-[#F5EFE6] rounded-2xl border border-[#EAE0D0]/80 flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold text-[#1C1917]">@{comment.user}</span>
                        <span className="text-[10px] text-[#A8A29E]">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-[#57534E] leading-relaxed">{comment.text}</p>
                    </div>

                    {user?.username === comment.user && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-[#78716C] hover:text-[#991B1B] p-1 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
