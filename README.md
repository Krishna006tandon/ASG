# Avinash Personal Brand & Knowledge Platform (ASG)

## 1. Project Overview
The **Avinash Personal Brand & Knowledge Platform** is a highly responsive, single-page web application designed to establish Avinash's online footprint. It offers curated educational components, startup guidance, authored books, webinars, and consultation slots. 

The application architecture leverages a modern, decoupled layout consisting of a fast, stateful React (Next.js App Router) client communicating via secure REST API calls to a high-performance Node.js environment, with data persistence handled by MongoDB.

## 2. Core Objectives
- **Digital Ecosystem:** Establish Avinash's professional digital footprint.
- **E-commerce:** Automate authored physical bookstore orders and payment updates.
- **Consultations:** Manage calendar consultation appointments and slot availability tracking.
- **Masterclasses:** Conduct gated masterclasses and webinar seat registrations via Razorpay integration.
- **Content Platform:** Publish long-form SEO articles focusing on Startup Planning and Financial Literacy.

## 3. Scope Matrix
The system encompasses:
- Responsive frontend landing routes and biography profiles.
- An e-commerce catalog with local-storage stateful shopping carts.
- Automated Razorpay webhooks for payment processing.
- A robust Content Management System (CMS).
- Webinar sign-up grids.
- Administrative analytic control dashboards.
- Programmatic server-rendered SEO tags for better discoverability.

## 4. Target Audience
- **Primary Audience:** Aspiring entrepreneurs, startup founders, students hunting career guidance frameworks, young working professionals, book readers, and masterclass webinar participants.
- **Secondary Audience:** Educational safety institutes, corporate learning bodies, trainers, digital mentors, and existing social media followers looking for centralized consultation assets.

---

## Technical Setup & Handover Guide

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v18.x or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### Getting Started

1. **Clone the repository and navigate into the web directory:**
   ```bash
   cd asg-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root of the `asg-web` directory and add the following keys:
   ```env
   # MongoDB Connection String (Local or Atlas)
   MONGODB_URI="mongodb://127.0.0.1:27017/ASG-Web"
   
   # JSON Web Token Secret (used for signing sessions)
   JWT_SECRET="your_secure_random_jwt_secret"
   
   # Razorpay API Keys (from your Razorpay Dashboard)
   RAZORPAY_KEY_ID="rzp_live_your_key_id"
   RAZORPAY_KEY_SECRET="your_razorpay_secret"
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Key Scripts
- `npm run dev`: Starts the Next.js local development server.
- `npm run build`: Creates an optimized production build.
- `npm run start`: Starts the production server (after building).
- `npm run lint`: Runs ESLint to catch syntax and styling errors.

### Tech Stack
- **Frontend / Framework:** [Next.js](https://nextjs.org/) (App Router), React
- **Styling:** Vanilla CSS Modules / Global CSS
- **Database:** MongoDB (via Mongoose)
- **Authentication:** Custom JWT-based authentication
- **Payments:** Razorpay

### Deployment
This Next.js application is optimized for deployment on [Vercel](https://vercel.com/):
1. Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2. Import the project into Vercel.
3. Add the environment variables from `.env.local` to the Vercel project settings.
4. Deploy!