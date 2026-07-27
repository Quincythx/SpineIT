/**
 * SpineIT API Types & Models
 * Matching the Django REST Framework Serializers from SpineIT backend.
 */

// User profile model matching accounts.User
export interface User {
  id: number;
  username: string;
  email: string;
  bio: string | null;
  is_verified: boolean;
  avatar: string | null;
}

// Genre model matching reviews.Genre
export interface Genre {
  id: number;
  name: string;
}

// Review model matching reviews.Review serializer
export interface Review {
  id: number;
  user: string;           // Username of reviewer
  genre: string | null;   // Name of genre (read-only StringRelatedField)
  genre_id?: number;      // Write-only PrimaryKeyRelatedField for create/update
  book_title: string;
  author: string;
  review_text: string;
  rating: number;         // 1 to 5 stars
  image: string | null;   // Cover image URL
  created_at: string;
  updated_at: string;
}

// Data payload for creating a new review
export interface CreateReviewInput {
  book_title: string;
  author: string;
  review_text: string;
  rating: number;
  genre_id?: number | null;
  image?: File | null;
}

// Comment model matching reviews.Comment
export interface Comment {
  id: number;
  review: number;         // Review ID
  user: string;           // Username of commenter
  text: string;
  created_at: string;
}

// Like model matching reviews.Like
export interface Like {
  id: number;
  review: number;         // Liked Review ID
  user: string;
  created_at: string;
}

// Bookmark model matching reviews.Bookmark
export interface Bookmark {
  id: number;
  review: number;         // Bookmarked Review ID
  user: string;
  created_at: string;
}

// JWT Authentication response tokens from /api/auth/login/
export interface AuthTokens {
  access: string;
  refresh: string;
}

// DRF PageNumberPagination wrapper shape
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
