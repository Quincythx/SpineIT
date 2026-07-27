import React, { useState, useEffect } from 'react';
import { X, Star, Upload, Feather } from 'lucide-react';
import type { Genre } from '../types/api';
import { api } from '../services/api';

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewCreated: () => void;
}

export const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewCreated,
}) => {
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [genreId, setGenreId] = useState<number | ''>('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchGenres();
    }
  }, [isOpen]);

  const fetchGenres = async () => {
    try {
      const data = await api.getGenres();
      setGenres(data);
    } catch (err) {
      console.error('Failed to fetch genres:', err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle || !author || !reviewText) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('book_title', bookTitle);
      formData.append('author', author);
      formData.append('review_text', reviewText);
      formData.append('rating', rating.toString());
      if (genreId !== '') {
        formData.append('genre_id', genreId.toString());
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.createReview(formData);
      
      // Reset form
      setBookTitle('');
      setAuthor('');
      setReviewText('');
      setRating(5);
      setGenreId('');
      setImageFile(null);
      setImagePreview(null);
      
      onReviewCreated();
      onClose();
    } catch (err: any) {
      console.error('Failed to create review:', err);
      setErrorMessage(err.response?.data?.detail || 'Failed to submit review. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] border border-[#EAE0D0] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EAE0D0] flex items-center justify-between bg-[#F5EFE6]">
          <div className="flex items-center space-x-2">
            <Feather className="w-5 h-5 text-[#854D0E]" />
            <h3 className="font-serif-editorial text-xl font-bold text-[#1C1917]">Write a Book Review</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#78716C] hover:bg-[#EAE0D0] hover:text-[#1C1917] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3 bg-[#991B1B]/10 border border-[#991B1B]/30 rounded-xl text-xs text-[#991B1B] font-medium">
              {errorMessage}
            </div>
          )}

          {/* Book Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase mb-1.5">
                Book Title *
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="e.g. To Kill a Mockingbird"
                required
                className="w-full px-4 py-2.5 bg-[#F5EFE6] border border-[#EAE0D0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#854D0E]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase mb-1.5">
                Author *
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Harper Lee"
                required
                className="w-full px-4 py-2.5 bg-[#F5EFE6] border border-[#EAE0D0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#854D0E]/30"
              />
            </div>
          </div>

          {/* Genre & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase mb-1.5">
                Genre
              </label>
              <select
                value={genreId}
                onChange={(e) => setGenreId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2.5 bg-[#F5EFE6] border border-[#EAE0D0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#854D0E]/30"
              >
                <option value="">Select Genre (Optional)</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Interactive Star Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#57534E] uppercase mb-1.5">
                Your Rating * ({rating}/5 Stars)
              </label>
              <div className="flex items-center space-x-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-[#D97706] hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-[#D97706]' : 'text-[#EAE0D0]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-semibold text-[#57534E] uppercase mb-1.5">
              Review Content *
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              placeholder="What did you think of the themes, character development, and narrative arc?"
              required
              className="w-full px-4 py-3 bg-[#F5EFE6] border border-[#EAE0D0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#854D0E]/30 font-serif-editorial"
            />
          </div>

          {/* Cover Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-[#57534E] uppercase mb-1.5">
              Cover Image (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer px-4 py-2.5 bg-[#F5EFE6] hover:bg-[#EAE0D0] border border-[#EAE0D0] rounded-xl text-xs font-semibold text-[#57534E] flex items-center space-x-2 transition-all">
                <Upload className="w-4 h-4 text-[#854D0E]" />
                <span>Upload Cover Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-12 h-16 object-cover rounded-lg border border-[#EAE0D0]"
                />
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#EAE0D0] flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#57534E] hover:bg-[#F5EFE6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#854D0E] hover:bg-[#B45309] text-[#FDFBF7] text-sm font-semibold shadow-md disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Review'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
