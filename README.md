# 📚 SpineIT — Backend API

🔗 **Live API:** https://spineit-api.onrender.com
🔗 **Live Docs:** https://spineit-api.onrender.com/api/docs/

SpineIT is a complete, production-style backend for a book review platform, built with Django REST Framework. Users can register, verify their email, post book reviews with cover images, comment, like, and bookmark reviews — all secured with JWT authentication and documented with a live, interactive API explorer.

Built as a hands-on learning project, following real-world backend development practices from the ground up: custom user models, relational database design, token-based authentication, ownership permissions, and clean API design.

---

## ✨ Features

**Authentication & Accounts**
- User registration with email verification
- JWT-based login, logout, and token refresh
- Password reset via email (Gmail SMTP)
- Editable user profile with avatar upload
- Strong password validation
- Rate limiting to prevent brute-force login attempts

**Reviews**
- Full CRUD — create, read, update, delete
- Book cover image upload per review
- Star rating, genre (relational), author, and title
- Auto-managed created/updated timestamps
- Search by book title, author, or genre
- Live like count on every review
- Ownership permissions — only the author can edit or delete their own review

**Social Features**
- Comment on reviews
- Like a review (public reaction, contributes to a visible count)
- Bookmark a review (private, personal saved list) — tracked completely independently from likes

**Developer Experience**
- Interactive Swagger API documentation, auto-generated and always up to date
- Paginated list endpoints across the entire API
- Clean, consistent JSON responses and error messages

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Language | Python |
| Framework | Django + Django REST Framework |
| Database | PostgreSQL |
| Auth | JWT via `djangorestframework-simplejwt` |
| Images | Pillow |
| CORS | `django-cors-headers` |
| Filtering | `django-filter` |
| API Docs | `drf-spectacular` (Swagger UI) |
| Secrets management | `python-decouple` |

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/book-review-platform-api.git
cd book-review-platform-api
```

### 2. Create and activate a virtual environment
```bash
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Create a PostgreSQL database
```sql
CREATE DATABASE book_review_db;
```

### 5. Set up environment variables
Copy the example file and fill in your real values:
```bash
copy .env.example .env        # Windows
cp .env.example .env          # macOS/Linux
```

You'll need to fill in:
- Your PostgreSQL credentials
- A Django secret key
- A Gmail address + [App Password](https://myaccount.google.com/apppasswords) (for sending verification/reset emails)

### 6. Run migrations
```bash
python manage.py migrate
```

### 7. Create a superuser (optional, for admin panel access)
```bash
python manage.py createsuperuser
```

### 8. Run the development server
```bash
python manage.py runserver
```

### 9. Explore the API
- Interactive docs: `http://127.0.0.1:8000/api/docs/`
- Admin panel: `http://127.0.0.1:8000/admin/`

---

## 📡 API Reference

All endpoints are prefixed with `/api/`. Endpoints marked 🔒 require a valid JWT access token in the `Authorization: Bearer <token>` header.

### Auth — `/api/auth/`

Registration is a two-step, email-verified flow (not a single "register" call) — this is deliberate: it means the database never contains an account with an unconfirmed email address.

| Method | Endpoint | Description |
|---|---|---|
| POST | `send-code/` | Step 1: send a 6-digit verification code to an email address |
| POST | `verify-code-register/` | Step 2: confirm the code and create the account (returns JWT tokens, already verified) |
| POST | `login/` | Log in — returns access + refresh tokens |
| POST | `login/refresh/` | Exchange a refresh token for a new access token |
| POST | `logout/` | Log out — blacklists the refresh token |
| POST | `password-reset/` | Request a password reset email |
| POST | `password-reset-confirm/` | Set a new password using uid + token |
| GET / PATCH | `profile/` 🔒 | View or update your own profile (including avatar) |
| GET | `/api/users/<username>/` | Public profile lookup by username (no auth required) |

### Reviews — `/api/reviews/`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all reviews (paginated) |
| GET | `/?search=<term>` | Search by book title, author, or genre |
| POST | `/` 🔒 | Create a new review |
| GET | `/{id}/` | Retrieve a single review |
| PATCH / PUT | `/{id}/` 🔒 | Update a review (owner only) |
| DELETE | `/{id}/` 🔒 | Delete a review (owner only) |

### Genres — `/api/genres/`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all genres |
| POST | `/` 🔒 | Create a new genre |

### Comments — `/api/comments/`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all comments |
| POST | `/` 🔒 | Add a comment to a review |
| PATCH / DELETE | `/{id}/` 🔒 | Update or delete your own comment |

### Likes — `/api/likes/`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` 🔒 | List your own likes |
| POST | `/` 🔒 | Like a review |
| DELETE | `/{id}/` 🔒 | Unlike a review |

### Bookmarks — `/api/bookmarks/`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` 🔒 | List your own bookmarked reviews |
| POST | `/` 🔒 | Bookmark a review |
| DELETE | `/{id}/` 🔒 | Remove a bookmark |

---

## 🗂 Project Structure

```
book-review-platform/
├── config/            # Project settings, root URLs
├── accounts/          # Custom User model, auth, profile
├── reviews/           # Review, Genre, Comment, Like, Bookmark
├── media/             # Uploaded images (avatars, review covers)
├── requirements.txt
├── .env.example
└── manage.py
```

---

## 🔐 Security Notes

- Passwords are hashed, never stored or returned in plain text
- JWT access tokens are short-lived (30 min); refresh tokens are blacklisted on logout
- All write actions require authentication; users can only modify their own content
- Rate limiting is enabled on all endpoints to reduce brute-force risk
- Secrets (DB credentials, email credentials, secret key) are kept out of source control via `.env`

---

## 👤 Author

Built by **Osedunme Quincy**, as a hands-on backend project.
