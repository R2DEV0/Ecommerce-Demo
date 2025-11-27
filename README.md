# Depth and Complexity Platform

A modern Next.js/Netlify application with WordPress-like admin functionality, featuring a shop, courses (LearnDash-like), announcements, webinars, and user management with hierarchical access control.

## Features

- **Admin Panel**: WordPress-like admin dashboard for managing all content
- **Shop**: Products with multiple versions/options
- **Courses**: LearnDash-like course system with lessons, progress tracking, and certificates
- **Announcements**: Public announcements system
- **Webinars**: Webinar scheduling and registration
- **User Management**: Hierarchical user system with role-based access (admin, manager, subscriber)
- **Certificates**: Automatic certificate generation upon course completion
- **Mobile Responsive**: Fully responsive design for all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT-based with bcrypt password hashing
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. The database will be automatically initialized on first run in the `data/` directory.

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Admin Credentials

- **Email**: admin@example.com
- **Password**: admin123

⚠️ **Important**: Change these credentials in production!

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── courses/           # Course pages
│   ├── shop/              # Shop pages
│   ├── profile/           # User profile pages
│   └── ...
├── components/            # React components
├── lib/                   # Utility functions
│   ├── db.ts             # Database setup and queries
│   └── auth.ts           # Authentication utilities
└── data/                  # SQLite database (auto-generated)
```

## Database Schema

The application uses SQLite with the following main tables:

- **users**: User accounts with roles and hierarchical relationships
- **products**: Shop products
- **product_versions**: Product variants/versions
- **courses**: Course catalog
- **lessons**: Course lessons
- **course_enrollments**: User course enrollments
- **lesson_progress**: Lesson completion tracking
- **certificates**: Earned certificates
- **announcements**: Public announcements
- **webinars**: Webinar scheduling
- **webinar_registrations**: User webinar registrations
- **orders**: Shop orders
- **order_items**: Order line items

## User Roles

- **admin**: Full access to all features
- **manager**: Can add users under them (if granted permission)
- **subscriber**: Standard user with access to courses, shop, etc.

## Deployment to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy to Netlify:
   - Connect your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Add environment variable: `JWT_SECRET` (use a strong random string)

Note: For production, consider migrating to a more robust database solution like PostgreSQL, as SQLite may have limitations in serverless environments.

## Development

- Run development server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm start`
- Lint code: `npm run lint`

## License

MIT

