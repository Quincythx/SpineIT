import React from 'react';
import { Feather, BookOpen, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeroSectionProps {
  onOpenCreateReviewModal: () => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenCreateReviewModal,
  onOpenAuthModal,
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden bg-[#F5EFE6] border-b border-[#EAE0D0] py-12 md:py-16">
      
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-[#EAE0D0]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-[#854D0E]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FDFBF7] border border-[#EAE0D0] text-xs font-semibold text-[#854D0E] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Discover your next favourite read</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif-editorial text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1C1917] leading-tight">
            A Sanctuary for Thoughtful <br />
            <span className="italic text-[#854D0E]">Book Reviews</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#57534E] leading-relaxed max-w-2xl mx-auto">
            SpineIT connects passionate readers through honest reviews, literary discussions, and curated bookmarks. Share what moves you.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex items-center justify-center space-x-4 pt-2">
            {isAuthenticated ? (
              <button
                onClick={onOpenCreateReviewModal}
                className="px-6 py-3 rounded-full bg-[#854D0E] hover:bg-[#B45309] text-[#FDFBF7] text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 transform active:scale-95"
              >
                <Feather className="w-4 h-4" />
                <span>Publish a Review</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuthModal('register')}
                className="px-6 py-3 rounded-full bg-[#854D0E] hover:bg-[#B45309] text-[#FDFBF7] text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 transform active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>Join the Community</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
