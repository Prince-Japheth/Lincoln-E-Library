# Lincoln E-Library

A modern digital library management system built with Next.js, Supabase, and TypeScript. This application provides a comprehensive platform for managing educational resources with role-based access control.

## 🚀 Features

### Default Site Behavior

1. **Public Access**: When the site loads, some books are accessible by default (publicly available)
2. **Limited Content**: Not all books are publicly available; only those marked as public by the admin
3. **Call to Action**: Clear prompts for users to sign up for access to the complete library

### Student Access

1. **Authentication Required**: Students need to sign up and log in to access books that are not publicly available
2. **Course Filtering**: Students can filter books by course name
3. **Book Requests**: Students can request books that are not currently available
4. **Complete Library Access**: After login, students can access both public and private books
5. **Personal Dashboard**: Students get a personalized dashboard with their reading statistics

### Admin Privileges

1. **Book Management**:
   - Upload new books
   - View all uploaded books
   - Edit uploaded books (update details, content, etc.)
   - Make books private or public
   - Assign a course to each book
   - Categorize books by genre or author
   - Delete books

2. **Request Management**:
   - View all book requests from students
   - Approve or deny book requests
   - Send notifications to users about request status

3. **User Management**:
   - View all user profiles
   - Manage user roles and permissions

4. **Notifications**:
   - Receive real-time notifications for new book requests
   - Notification bell in header with unread count
   - Mark notifications as read

### Course Filtering

1. **Student Filtering**: Students can filter books by course name
2. **Admin Filtering**: Admins can also filter books by course name for management purposes

### User Roles

1. **Admin**: Full control over book management, user management, and system administration
2. **Student**: Access to public books without login, and complete library access after logging in

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account and project
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd lincoln-e-library
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the database setup script:

```sql
-- Run the complete database setup
\i scripts/complete-database-setup-clean.sql
```

### 5. Create Admin User

1. In Supabase Auth dashboard, create a new user:
   - Email: `admin@lincoln.edu`
   - Password: `LincolnAdmin123!`

2. Run the admin setup script:

```sql
-- Run the admin setup script
\i scripts/setup-admin.sql
```

### 6. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
lincoln-e-library/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Student dashboard
│   ├── book/              # Book detail pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utility libraries
│   └── supabase/         # Supabase client configuration
├── scripts/              # Database setup scripts
└── public/               # Static assets
```

## 🔐 Authentication Flow

1. **Public Access**: Users can browse public books without authentication
2. **Student Signup**: Students can create accounts to access the full library
3. **Admin Login**: Admins use specific credentials to access admin panel
4. **Role-based Routing**: Middleware ensures users can only access appropriate pages

## 📚 Book Management

### Public vs Private Books

- **Public Books**: Available to all visitors without authentication
- **Private Books**: Only accessible to authenticated students and admins

### Book Properties

- Title, Author, Genre
- Description and cover image
- Course assignment
- Public/private status
- File URL for reading

## 🔔 Notification System

- Real-time notifications for admin users
- Book request status updates
- Unread notification count in header
- Mark as read functionality

## 🎨 UI/UX Features

- Modern glassmorphism design
- Responsive layout for all devices
- Dark/light theme toggle
- Smooth animations and transitions
- Loading skeletons for better UX

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Configuration

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Configuration

The application uses Supabase with the following main tables:
- `user_profiles`: User information and roles
- `books`: Book catalog with metadata
- `courses`: Course categories
- `book_requests`: Student book requests
- `notifications`: System notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

## 🔄 Updates and Maintenance

- Regular dependency updates
- Security patches
- Feature enhancements
- Performance optimizations

## Password Reset

### Requesting a Password Reset
- On the login page, click the "Forgot your password?" link.
- Enter your email address and submit the form.
- If the email exists, a password reset link will be sent to your inbox.

### Setting a New Password
- Click the link in your email to open the reset password page.
- Enter and confirm your new password.
- On success, you will be redirected to the login page.

### Changing Password from Profile
- Go to your profile page after logging in.
- Use the "Change Password" section to update your password.

### Troubleshooting
- Ensure Supabase SMTP settings are configured for email delivery.
- Check spam/junk folders if the reset email does not arrive.
- The reset link expires after a short period for security.

---

**Built with ❤️ for educational institutions** 