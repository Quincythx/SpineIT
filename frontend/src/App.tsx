import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GenreFilter } from './components/GenreFilter';
import { ReviewCard } from './components/ReviewCard';
import { ReviewDetailModal } from './components/ReviewDetailModal';
import { CreateReviewModal } from './components/CreateReviewModal';
import { AuthModal } from './components/AuthModal';
import type { Review, Genre, Like, Bookmark } from './types/api';
import { api } from './services/api';
import { BookOpen, Sparkles, AlertCircle } from 'lucide-react';

const SpineITMain: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // State Management
  const [reviews, setReviews] = useState<Review[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [userLikes, setUserLikes] = useState<Like[]>([]);
  const [userBookmarks, setUserBookmarks] = useState<Bookmark[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'bookmarks' | 'my-reviews'>('feed');

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isCreateReviewModalOpen, setIsCreateReviewModalOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial Data Fetching
  useEffect(() => {
    fetchInitialData();
  }, [isAuthenticated]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch Reviews & Genres
      const [reviewsData, genresData] = await Promise.all([
        api.getReviews(),
        api.getGenres(),
      ]);

      setReviews(reviewsData.results);
      setGenres(genresData);

      // Fetch User's Likes and Bookmarks if logged in
      if (isAuthenticated) {
        try {
          const [likesData, bookmarksData] = await Promise.all([
            api.getLikes(),
            api.getBookmarks(),
          ]);
          setUserLikes(likesData);
          setUserBookmarks(bookmarksData);
        } catch (err) {
          console.error('Failed to fetch user likes/bookmarks:', err);
        }
      } else {
        setUserLikes([]);
        setUserBookmarks([]);
      }
    } catch (err: any) {
      console.error('Failed to load SpineIT data:', err);
      setError('Could not connect to SpineIT API. Please verify backend service.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper sets of liked & bookmarked review IDs for fast lookup
  const likedReviewIds = useMemo(() => new Set(userLikes.map((l) => l.review)), [userLikes]);
  const bookmarkedReviewIds = useMemo(() => new Set(userBookmarks.map((b) => b.review)), [userBookmarks]);

  // Filtering Logic
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      // Tab filter
      if (activeTab === 'bookmarks') {
        if (!bookmarkedReviewIds.has(review.id)) return false;
      } else if (activeTab === 'my-reviews') {
        if (review.user !== user?.username) return false;
      }

      // Genre filter
      if (selectedGenre && review.genre !== selectedGenre) {
        return false;
      }

      // Search term filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesTitle = review.book_title.toLowerCase().includes(query);
        const matchesAuthor = review.author.toLowerCase().includes(query);
        const matchesGenre = review.genre?.toLowerCase().includes(query);
        return matchesTitle || matchesAuthor || matchesGenre;
      }

      return true;
    });
  }, [reviews, activeTab, selectedGenre, searchTerm, bookmarkedReviewIds, user]);

  // Like Toggle Handler
  const handleLikeToggle = async (reviewId: number) => {
    if (!isAuthenticated) {
      setAuthModal({ isOpen: true, mode: 'login' });
      return;
    }

    const existingLike = userLikes.find((l) => l.review === reviewId);
    try {
      if (existingLike) {
        await api.removeLike(existingLike.id);
        setUserLikes((prev) => prev.filter((l) => l.id !== existingLike.id));
      } else {
        const newLike = await api.addLike(reviewId);
        setUserLikes((prev) => [...prev, newLike]);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  // Bookmark Toggle Handler
  const handleBookmarkToggle = async (reviewId: number) => {
    if (!isAuthenticated) {
      setAuthModal({ isOpen: true, mode: 'login' });
      return;
    }

    const existingBookmark = userBookmarks.find((b) => b.review === reviewId);
    try {
      if (existingBookmark) {
        await api.removeBookmark(existingBookmark.id);
        setUserBookmarks((prev) => prev.filter((b) => b.id !== existingBookmark.id));
      } else {
        const newBookmark = await api.addBookmark(reviewId);
        setUserBookmarks((prev) => [...prev, newBookmark]);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  // Delete Review Handler
  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] flex flex-col font-sans selection:bg-[#F3EAD8] selection:text-[#854D0E]">
      
      {/* Navigation Header */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenAuthModal={(mode) => setAuthModal({ isOpen: true, mode })}
        onOpenCreateReviewModal={() => setIsCreateReviewModalOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Hero Banner (Shown on Feed tab) */}
      {activeTab === 'feed' && !searchTerm && (
        <HeroSection
          onOpenCreateReviewModal={() => setIsCreateReviewModalOpen(true)}
          onOpenAuthModal={(mode) => setAuthModal({ isOpen: true, mode })}
        />
      )}

      {/* Main Content Feed Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Genre Filter Bar & Feed Heading */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#EAE0D0] pb-6">
          <div>
            <h2 className="font-serif-editorial text-2xl font-bold text-[#1C1917]">
              {activeTab === 'feed' && 'Literary Feed'}
              {activeTab === 'bookmarks' && 'Saved Bookmarks'}
              {activeTab === 'my-reviews' && 'My Published Reviews'}
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              Showing {filteredReviews.length} review{filteredReviews.length === 1 ? '' : 's'}
            </p>
          </div>

          <GenreFilter
            genres={genres}
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
          />
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-4 bg-[#991B1B]/10 border border-[#991B1B]/30 rounded-2xl flex items-center justify-between space-x-3 text-sm text-[#991B1B]">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchInitialData}
              className="px-3.5 py-1.5 bg-[#991B1B] text-[#FDFBF7] rounded-full text-xs font-semibold hover:bg-[#7F1D1D] transition-colors shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#854D0E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-serif-editorial italic text-sm text-[#78716C]">Loading literary reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center space-y-4 bg-[#F5EFE6]/60 border border-[#EAE0D0] rounded-3xl p-8 max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-[#854D0E]/40 mx-auto" />
            <h3 className="font-serif-editorial text-xl font-bold text-[#1C1917]">No Reviews Found</h3>
            <p className="text-sm text-[#57534E]">
              {searchTerm
                ? `No reviews match "${searchTerm}". Try a different keyword.`
                : activeTab === 'bookmarks'
                ? "You haven't bookmarked any reviews yet."
                : activeTab === 'my-reviews'
                ? "You haven't published any reviews yet."
                : 'No reviews available in this genre.'}
            </p>
          </div>
        ) : (
          /* Review Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isLiked={likedReviewIds.has(review.id)}
                isBookmarked={bookmarkedReviewIds.has(review.id)}
                onLikeToggle={handleLikeToggle}
                onBookmarkToggle={handleBookmarkToggle}
                onSelectReview={(r) => setSelectedReview(r)}
                onDeleteReview={handleDeleteReview}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#F5EFE6] border-t border-[#EAE0D0] py-8 text-center text-xs text-[#78716C]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 font-serif-editorial font-bold text-[#1C1917]">
            <Sparkles className="w-4 h-4 text-[#854D0E]" />
            <span>SpineIT — Book Review Platform</span>
          </div>
          <p>© {new Date().getFullYear()} SpineIT. Connected to live DRF API.</p>
        </div>
      </footer>

      {/* Modals */}
      <ReviewDetailModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
        isLiked={selectedReview ? likedReviewIds.has(selectedReview.id) : false}
        isBookmarked={selectedReview ? bookmarkedReviewIds.has(selectedReview.id) : false}
        onLikeToggle={handleLikeToggle}
        onBookmarkToggle={handleBookmarkToggle}
      />

      <CreateReviewModal
        isOpen={isCreateReviewModalOpen}
        onClose={() => setIsCreateReviewModalOpen(false)}
        onReviewCreated={fetchInitialData}
      />

      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SpineITMain />
    </AuthProvider>
  );
};

export default App;
