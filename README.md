# Job Portal

A modern, full-stack Job Portal application built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**. This platform enables job seekers to search and apply for jobs, while employers can post job listings and manage applications efficiently.

## 🚀 Features

- **User Authentication**: Secure login and registration for both job seekers and employers.
- **Job Listings**: Browse and search for job opportunities with detailed information.
- **Application Management**: Employers can manage applications; job seekers can track their applications.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: (Specify if using Redux, Zustand, or Context API)
- **Authentication**: (Specify method, e.g., JWT, NextAuth.js)
- **Database**: (Specify, e.g., MongoDB, PostgreSQL)
- **ORM**: (Specify if using Prisma, Mongoose, etc.)
- **API Routes**: Built-in API routes provided by Next.js
- **Package Manager**: [pnpm](https://pnpm.io/)

## 📁 Project Structure

├── app/ # Next.js app directory
├── components/ # Reusable UI components
├── hooks/ # Custom React hooks
├── lib/ # Utility functions and libraries
├── public/ # Static assets
├── styles/ # Global and component-specific styles
├── middleware.ts # Middleware for request handling
├── next.config.mjs # Next.js configuration
├── tailwind.config.ts # Tailwind CSS configuration
├── tsconfig.json # TypeScript configuration
├── package.json # Project metadata and scripts
├── pnpm-lock.yaml # Dependency lockfile for pnpm


## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version >= 18)
- [pnpm](https://pnpm.io/) (version >= 7)

### Installation

1. **Clone the repository:**
   git clone https://github.com/dheeraj0944/Job_portal.git
   cd Job_portal
   
2.Install dependencies:pnpm install

3.Configure environment variables:

Create a .env.local file in the root directory and add the necessary environment variables:
DATABASE_URL=your_database_connection_string
NEXTAUTH_SECRET=your_nextauth_secret

4.Run the development server:
pnpm dev

5.Open http://localhost:3000 in your browser to see the application.

