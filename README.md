# AI Image Generator

A simple front-end application that generates images using Google Gemini 2 API, featuring two tabs for 'Text to Image' and 'Image+Text to Image' functionalities. This app makes direct calls to the Gemini API using the user's API key.

## Features

- **Dual Tabs**: Switch between 'Text to Image' for generating images from text prompts, and 'Image+Text to Image' for generating images based on both an uploaded image and a text prompt.
- **Dark Theme**: A sleek dark theme throughout the application using Tailwind CSS's dark mode capabilities.
- **Loading Indicators**: Spinners and animations to indicate processing states, with buttons disabled during operations to prevent multiple submissions.
- **Responsive Design**: Mobile-first design approach, making the application responsive and user-friendly across various devices.

## Technologies Used

- React with Vite
- JavaScript
- Tailwind CSS for styling
- Zustand for state management
- Axios for API calls

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Google Gemini 2 API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. No environment variables are needed as the app uses the user-provided API key
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`

## Usage

### Text to Image
1. Select the 'Text to Image' tab
2. Enter a descriptive prompt in the text area
3. Click 'Generate Image'
4. Wait for the image to be generated

### Image+Text to Image
1. Select the 'Image+Text to Image' tab
2. Upload an image by clicking on the upload area
3. Enter a descriptive prompt in the text area
4. Click 'Generate Image'
5. Wait for the image to be generated

## Deployment

This is a simple front-end application that can be deployed to any static hosting service:

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the contents of the `dist` directory to your preferred hosting service (GitHub Pages, Vercel, Netlify, etc.)

## API Key Security

This application stores the user's API key in the browser's localStorage for convenience. Please note:

- The API key is only stored locally in the user's browser
- The key is never sent to any server other than Google's Gemini API
- Users should be careful when using this application on shared or public computers
- For production use, consider implementing a more secure approach

## License

MIT
