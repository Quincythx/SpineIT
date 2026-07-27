import React from 'react';
import { Star, Heart, Bookmark, MessageSquare, Trash2, BookOpen } from 'lucide-react';
import type { Review } from '../types/api';
import { useAuth } from '../context/AuthContext';

interface ReviewCardProps {
  review: Review;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLikeToggle?: (reviewId: number) => void;
  onBookmarkToggle?: (reviewId: number) => void;
  onSelectReview?: (review: Review) => void;
  onDeleteReview?: (reviewId: number) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  isLiked = false,
  isBookmarked = false,
  onLikeToggle,
  onBookmarkToggle,
  onSelectReview,
  onDeleteReview,
}) => {
  const { user } = useAuth();
  const isOwner = user?.username === review.user;

  // Format date cleanly (e.g. "Oct 24, 2024")
  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="group bg-[#FDFBF7] border border-[#EAE0D0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Cover Image / Graphic Placeholder */}
      <div 
        onClick={() => onSelectReview && onSelectReview(review)}
        className="relative h-48 sm:h-56 bg-[#EAE0D0]/50 cursor-pointer overflow-hidden flex items-center justify-center group-hover:opacity-95 transition-opacity"
      >
        {review.image ? (
          <img
            src={review.image}
            alt={review.book_title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <BookOpen className="w-12 h-12 text-[#854D0E]/40 mb-2" />
            <span className="font-serif-editorial text-lg text-[#57534E] font-medium italic line-clamp-2">
              "{review.book_title}"
            </span>
            <span className="text-xs text-[#78716C] mt-1 font-sans">by {review.author}</span>
          </div>
        )}

        {/* Genre Pill Tag */}
        {review.genre && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-[#FDFBF7]/90 backdrop-blur-md border border-[#EAE0D0] rounded-full text-xs font-semibold text-[#854D0E] shadow-sm">
            {review.genre}
          </span>
        )}

        {/* Owner Tag indicator */}
        {isOwner && (
          <span className="absolute top-3 right-3 px-2.5 py-0.5 bg-[#854D0E] text-[#FDFBF7] rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm">
            Your Review
          </span>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div onClick={() => onSelectReview && onSelectReview(review)} className="cursor-pointer">
          
          {/* Rating Stars */}
          <div className="flex items-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating
                    ? 'text-[#D97706] fill-[#D97706]'
                    : 'text-[#EAE0D0] fill-none'
                }`}
              />
            ))}
            <span className="text-xs font-semibold text-[#78716C] ml-1.5">
              {review.rating}/5
            </span>
          </div>

          {/* Book Title & Author */}
          <h3 className="font-serif-editorial text-xl font-bold text-[#1C1917] group-hover:text-[#854D0E] transition-colors leading-tight line-clamp-1">
            {review.book_title}
          </h3>
          <p className="text-sm font-medium text-[#78716C] mb-3">
            by <span className="text-[#57534E]">{review.author}</span>
          </p>

          {/* Review Text Preview */}
          <p className="text-sm text-[#57534E] leading-relaxed line-clamp-3 mb-4">
            {review.review_text}
          </p>
        </div>

        {/* Card Footer: Reviewer Info & Actions */}
        <div className="pt-4 border-t border-[#EAE0D0]/60 flex items-center justify-between">
          
          {/* Reviewer Meta */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-[#EAE0D0] text-[#854D0E] flex items-center justify-center font-bold text-xs">
              {review.user.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1C1917] leading-none">{review.user}</p>
              <p className="text-[10px] text-[#A8A29E] leading-none mt-0.5">{formattedDate}</p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-1">
            
            {/* Like Button */}
            <button
              onClick={() => onLikeToggle && onLikeToggle(review.id)}
              className={`p-2 rounded-full transition-all ${
                isLiked
                  ? 'bg-[#991B1B]/10 text-[#991B1B]'
                  : 'text-[#78716C] hover:bg-[#F5EFE6] hover:text-[#991B1B]'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#991B1B]' : ''}`} />
            </button>

            {/* Bookmark Button */}
            <button
              onClick={() => onBookmarkToggle && onBookmarkToggle(review.id)}
              className={`p-2 rounded-full transition-all ${
                isBookmarked
                  ? 'bg-[#854D0E]/10 text-[#854D0E]'
                  : 'text-[#78716C] hover:bg-[#F5EFE6] hover:text-[#854D0E]'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#854D0E]' : ''}`} />
            </button>

            {/* Read Comments */}
            <button
              onClick={() => onSelectReview && onSelectReview(review)}
              className="p-2 text-[#78716C] hover:bg-[#F5EFE6] hover:text-[#1C1917] rounded-full transition-all"
              title="View Discussion"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* Delete Review (Owner only) */}
            {isOwner && onDeleteReview && (
              <button
                onClick={() => onDeleteReview(review.id)}
                className="p-2 text-[#78716C] hover:bg-[#991B1B]/10 hover:text-[#991B1B] rounded-full transition-all"
                title="Delete Review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>

      </div>

    </article>
  );
};
