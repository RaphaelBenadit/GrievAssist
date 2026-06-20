/**
 * API Configuration
 * 
 * Dynamically resolves the backend API base URL.
 * - In development: uses the same hostname the browser is on (works on mobile too)
 * - In production: uses relative URLs (assumes same-origin deployment)
 * 
 * This ensures that when you access the app from a mobile device on the
 * same network (e.g., http://192.168.x.x:3000), API calls go to
 * http://192.168.x.x:5000 instead of http://localhost:5000.
 */

const API_PORT = 5000;

// Use the current browser hostname so it works from any device on the network
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  `http://${window.location.hostname}:${API_PORT}`;

export default API_BASE_URL;
