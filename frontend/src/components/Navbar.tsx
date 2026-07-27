import React, { useState } from 'react';
import { BookOpen, Search, LogOut, PlusCircle, Bookmark, PenTool } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onOpenCreateReviewModal: () => void;
  activeTab: 'feed' | 'bookmarks' | 'my-reviews';
  onTabChange: (tab: 'feed' | 'bookmarks' | 'my-reviews') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchTerm,
  onSearchChange,
  onOpenAuthModal,
  onOpenCreateReviewModal,
  activeTab,
  onTabChange,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#EAE0D0] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => onTabChange('feed')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#854D0E] text-[#FDFBF7] flex items-center justify-center shadow-sm group-hover:bg-[#B45309] transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif-editorial text-2xl font-bold tracking-tight text-[#1C1917]">
                Spine<span className="text-[#854D0E]">IT</span>
              </span>
              <span className="block text-[10px] tracking-widest text-[#78716C] uppercase font-sans font-medium">
                Literary Reviews
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-6 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#78716C]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search title, author, or genre..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5EFE6] border border-[#EAE0D0] rounded-full text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#854D0E]/30 focus:border-[#854D0E] transition-all"
              />
            </div>
          </div>

          {/* Navigation Links & Action Buttons */}
          <div className="flex items-center space-x-4">
            
            {/* Tab Navigation */}
            <nav className="hidden sm:flex items-center space-x-1">
              <button
                onClick={() => onTabChange('feed')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'feed'
                    ? 'bg-[#EAE0D0] text-[#1C1917]'
                    : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5EFE6]'
                }`}
              >
                Feed
              </button>

              {isAuthenticated && (
                <>
                  <button
                    onClick={() => onTabChange('bookmarks')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center space-x-1.5 ${
                      activeTab === 'bookmarks'
                        ? 'bg-[#EAE0D0] text-[#1C1917]'
                        : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5EFE6]'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 text-[#854D0E]" />
                    <span>Bookmarks</span>
                  </button>

                  <button
                    onClick={() => onTabChange('my-reviews')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center space-x-1.5 ${
                      activeTab === 'my-reviews'
                        ? 'bg-[#EAE0D0] text-[#1C1917]'
                        : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5EFE6]'
                    }`}
                  >
                    <PenTool className="w-4 h-4 text-[#854D0E]" />
                    <span>My Reviews</span>
                  </button>
                </>
              )}
            </nav>

            {/* Write Review & User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={onOpenCreateReviewModal}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#854D0E] hover:bg-[#B45309] text-[#FDFBF7] text-sm font-medium shadow-sm transition-all transform active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Write Review</span>
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-[#F5EFE6] border border-transparent hover:border-[#EAE0D0] transition-all"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover border border-[#854D0E]/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#EAE0D0] text-[#854D0E] flex items-center justify-center font-bold text-sm">
                        {user?.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#FDFBF7] border border-[#EAE0D0] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-[#EAE0D0]">
                        <p className="text-xs text-[#78716C] uppercase font-semibold">Signed in as</p>
                        <p className="text-sm font-bold text-[#1C1917] truncate">{user?.username}</p>
                        <p className="text-xs text-[#78716C] truncate">{user?.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#991B1B] hover:bg-[#F5EFE6] flex items-center space-x-2 font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-4 py-2 text-sm font-medium text-[#57534E] hover:text-[#1C1917] transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-4 py-2 rounded-full bg-[#854D0E] hover:bg-[#B45309] text-[#FDFBF7] text-sm font-medium shadow-sm transition-all"
                >
                  Get Started
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
