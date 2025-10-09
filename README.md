# Go Invoice Frontend

A modern, responsive React + TypeScript frontend for the GoInvoice application. Built with Vite and Tailwind CSS, featuring authentication, client management, and professional invoice generation.

## Features

### Public Features

- **Invoice Generation**: Create professional invoices without registration
- **Real-time Preview**: Side-by-side form and invoice preview
- **PDF Download**: Generate and download invoices as PDF files
- **Responsive Design**: Works perfectly on desktop and mobile devices

### Authenticated Features

- **User Authentication**: Secure login and registration system
- **Dashboard**: Overview of invoice activity and statistics
- **Client Management**: Save and manage client information
- **Invoice Management**: Create, edit, and track invoices
- **Email Integration**: Send invoices directly via email
- **User Settings**: Manage account and business information
- **Auto-fill**: Pre-fill business info and select clients from saved list

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **Date Handling**: date-fns

## Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   # Update the .env file with your backend API URL
   VITE_API_BASE_URL=http://localhost:8080
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Navbar.tsx      # Navigation bar
│   ├── InvoiceForm.tsx # Invoice creation form
│   └── InvoicePreview.tsx # Invoice preview component
├── context/            # React contexts
│   └── AuthContext.tsx # Authentication state
├── pages/              # Page components
│   ├── HomePage.tsx    # Public Invoice generator
│   ├── LoginPage.tsx   # User authentication
│   ├── RegisterPage.tsx # User registration
│   ├── DashboardPage.tsx # User dashboard
│   ├── InvoicesPage.tsx # Invoice management
│   ├── ClientsPage.tsx # Client management
│   ├── SettingsPage.tsx # User settings
│   └── CreateInvoicePage.tsx # Invoice creation
├── types/              # TypeScript type definitions
│   └── index.ts        # Application types
├── utils/              # Utilities
│   ├── api.ts          # API service layer
│   └── helper.ts       # helper functions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

Try the application [here](https://go-invoice-frontend-58444507601.asia-southeast1.run.app)
