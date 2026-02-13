/**
 * Frontend Configuration for Finance Management System
 * Pattern adapted for Vite and Supabase integration
 */

const config = {
  development: {
    apiUrl: import.meta.env.VITE_DEVELOPMENT_BASE_URL || 'http://localhost:3000/api/',
    env: 'development',
    timeout: 10000,
    // Add other development-specific keys here
  },
  production: {
    apiUrl: import.meta.env.VITE_PRODUCTION_BASE_URL,
    env: 'production',
    timeout: 15000,
    // Fill this in later when you deploy to Vercel or Render
  }
};

// Vite uses import.meta.env.MODE to determine the current environment
const currentConfig = import.meta.env.MODE === 'production' 
  ? config.production 
  : config.development;

export default Object.freeze(currentConfig);