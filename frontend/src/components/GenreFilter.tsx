import React from 'react';
import { Tag } from 'lucide-react';
import type { Genre } from '../types/api';

interface GenreFilterProps {
  genres: Genre[];
  selectedGenre: string | null;
  onSelectGenre: (genreName: string | null) => void;
}

export const GenreFilter: React.FC<GenreFilterProps> = ({
  genres,
  selectedGenre,
  onSelectGenre,
}) => {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
      <div className="flex items-center space-x-2 text-xs text-[#78716C] font-semibold uppercase tracking-wider pr-2 border-r border-[#EAE0D0] shrink-0">
        <Tag className="w-3.5 h-3.5" />
        <span>Genres</span>
      </div>

      {/* "All" Tag */}
      <button
        onClick={() => onSelectGenre(null)}
        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
          selectedGenre === null
            ? 'bg-[#854D0E] text-[#FDFBF7] shadow-sm'
            : 'bg-[#F5EFE6] text-[#57534E] hover:bg-[#EAE0D0] hover:text-[#1C1917]'
        }`}
      >
        All Reviews
      </button>

      {/* Genre Pills */}
      {genres.map((genre) => {
        const isSelected = selectedGenre === genre.name;
        return (
          <button
            key={genre.id}
            onClick={() => onSelectGenre(genre.name)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-[#854D0E] text-[#FDFBF7] shadow-sm'
                : 'bg-[#F5EFE6] text-[#57534E] hover:bg-[#EAE0D0] hover:text-[#1C1917]'
            }`}
          >
            {genre.name}
          </button>
        );
      })}
    </div>
  );
};
