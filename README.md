# Single File React TypeScript App

This is a simplified React application that consists of a single index.tsx file along with supporting HTML and CSS files.

## Project Structure

- `index.html` - The main HTML file that loads React and the TypeScript transpiler
- `index.tsx` - The single React component file containing all the application logic
- `styles.css` - CSS styles for the application

## How to Run

Simply open the `index.html` file in a modern web browser to see the application.

Alternatively, you can use a simple HTTP server:

```bash
# If you have Python installed
python -m http.server

# If you have Node.js installed
npx serve
```

Then open your browser and navigate to `http://localhost:8000` (for Python) or `http://localhost:3000` (for Node.js serve).

## Development

This simple setup uses browser-based TypeScript transpiling for demonstration purposes only. For a production application, you would want to:

1. Use a build tool like Webpack, Vite, or Parcel
2. Set up proper TypeScript compilation
3. Implement hot module reloading for development

## Notes

This simplified approach is meant for educational purposes or very small projects. For larger applications, consider using a framework like Next.js, Create React App, or Vite. 