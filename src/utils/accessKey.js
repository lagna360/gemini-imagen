// This file contains utility functions for handling API keys

// Store the user's API key in localStorage
export const storePassphrase = (apiKey) => {
  localStorage.setItem('geminiApiKey', apiKey);
};

// Get the user's API key from localStorage
export const getPassphrase = () => {
  return localStorage.getItem('geminiApiKey');
};

// Remove the user's API key from localStorage
export const removePassphrase = () => {
  localStorage.removeItem('geminiApiKey');
};
