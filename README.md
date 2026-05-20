# TOA Request Form

A modern web application for creating and managing Total Offer Analysis (TOA) requests for prospective clients. This form streamlines the collection of health plan and fertility benefit information, enabling efficient proposal generation.

## Features

- 📋 **Comprehensive Form Interface** - Collect detailed prospect information including health plans, fertility benefits, and employee distribution
- 🎨 **Dark/Light Theme** - User-friendly interface with theme switching
- 🔐 **Authentication** - Secure access via Supabase authentication
- 📊 **PowerPoint Generation** - Automatically generate PPTX presentations from form data
- 💾 **Data Persistence** - Save and load form data for easy revisiting
- 📧 **Formspree Integration** - Submit forms directly via email
- 🎯 **Smart Validation** - Built-in validation for distribution totals and required fields
- 📱 **Responsive Design** - Works seamlessly across desktop and mobile devices

## Tech Stack

- **Frontend Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **UI Icons**: Lucide React
- **Authentication**: Supabase
- **Form Submission**: Formspree
- **Document Generation**: docxtemplater, PizZip
- **Image Processing**: react-easy-crop

## Prerequisites

Before running this project, ensure you have:

- Node.js (v18 or higher recommended)
- npm or yarn package manager
- A Formspree account and form endpoint
- Supabase project credentials (optional, for authentication)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Request_Form-Formspree
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory with the following:
   ```env
   VITE_FORMSPREE_FORM_ID=your_formspree_form_id
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── components/
│   ├── AutocompleteInput.tsx    # Reusable autocomplete component
│   └── ProspectForm.tsx         # Main form component
├── contexts/
│   └── AuthContext.tsx          # Authentication context provider
├── lib/
│   └── supabase.ts              # Supabase client configuration
├── utils/
│   ├── bayesianApi.ts           # Bayesian API integration
│   ├── formatting.ts            # Currency and number formatting utilities
│   ├── formspree.ts             # Formspree submission handler
│   └── pptxGenerator.ts         # PowerPoint generation logic
├── App.tsx                      # Main application component
├── main.tsx                     # Application entry point
└── index.css                    # Global styles and Tailwind imports
```

## Key Components

### ProspectForm
The main form component that handles:
- Prospect information collection
- Health plan details with multiple rows
- Fertility benefit configurations
- Form validation and submission
- Data export/import functionality
- PowerPoint generation

### AutocompleteInput
A reusable autocomplete input component with:
- Dropdown suggestions
- Keyboard navigation
- Custom styling support

### AuthContext
Provides authentication state management throughout the application.

## Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Preview the production build locally**
   ```bash
   npm run preview
   ```

The optimized build files will be in the `dist/` directory.

## Deployment

This application can be deployed to any static hosting service:

- **Vercel**: Connect your repository and deploy automatically
- **Netlify**: Drag and drop the `dist/` folder or connect via Git
- **GitHub Pages**: Use GitHub Actions to build and deploy
- **AWS S3 + CloudFront**: Upload the `dist/` folder to S3

### Build Command
```bash
npm run build
```

### Output Directory
```
dist/
```

## Configuration Files

- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `tsconfig.json` - TypeScript compiler configuration
- `eslint.config.js` - ESLint rules and settings

## Browser Support

This application supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For questions or support, please contact the development team.

---

Built with ❤️ using React, TypeScript, and Vite
