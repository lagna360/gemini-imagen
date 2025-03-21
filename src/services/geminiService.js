import axios from 'axios';
import { getPassphrase } from '../utils/accessKey';

// Direct Gemini API URL for image generation
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent';

// Function to convert image file to base64
const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Extract the base64 data from the data URL
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Function to generate image from text prompt
export const generateImageFromText = async (prompt, aspectRatio) => {
  try {
    const apiKey = getPassphrase();
    if (!apiKey) {
      throw new Error('Please enter your Gemini API key');
    }
    
    // Prepare the prompt with aspect ratio instruction if provided
    const promptWithAspectRatio = aspectRatio 
      ? `Generate an image based on this description: ${prompt}. Use ${aspectRatio} aspect ratio.` 
      : `Generate an image based on this description: ${prompt}`;
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              { text: promptWithAspectRatio }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
          responseModalities: ["Text", "Image"]
        }
      }
    );
    
    // Extract the image data from the response
    console.log('Response data structure:', JSON.stringify(response.data, null, 2));
    if (response.data.candidates && response.data.candidates[0]?.content?.parts) {
      const parts = response.data.candidates[0].content.parts;
      // Look for inlineData part (image) first
      const imagePart = parts.find(part => part.inlineData);
      if (imagePart && imagePart.inlineData) {
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }
      // Fall back to text part which might contain a data URL
      const textPart = parts.find(part => part.text);
      if (textPart && textPart.text.startsWith('data:')) {
        return textPart.text;
      }
    }
    throw new Error('No image generated. Try a different prompt.');
  } catch (error) {
    console.error('Error generating image from text:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      if (error.response.status === 400) {
        throw new Error('Invalid API key or API quota exceeded. Please check your API key.');
      }
      throw new Error(`API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('No response received from the API. Please check your internet connection.');
    } else {
      console.error('Error details:', error.message);
      throw error; // Return the original error instead of creating a new one
    }
  }
};

// Function to generate image from text prompt and image
export const generateImageFromTextAndImage = async (prompt, imageFile, aspectRatio) => {
  try {
    const apiKey = getPassphrase();
    if (!apiKey) {
      throw new Error('Please enter your Gemini API key');
    }
    
    // Convert image to base64
    const base64Image = await getBase64(imageFile);
    
    // Prepare the prompt with aspect ratio instruction if provided
    const promptWithAspectRatio = aspectRatio 
      ? `${prompt} Use ${aspectRatio} aspect ratio.` 
      : prompt;
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              { text: promptWithAspectRatio },
              {
                inline_data: {
                  mime_type: imageFile.type,
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
          responseModalities: ["Text", "Image"]
        }
      }
    );
    
    // Extract the image data from the response
    console.log('Response data structure:', JSON.stringify(response.data, null, 2));
    if (response.data.candidates && response.data.candidates[0]?.content?.parts) {
      const parts = response.data.candidates[0].content.parts;
      // Look for inlineData part (image) first
      const imagePart = parts.find(part => part.inlineData);
      if (imagePart && imagePart.inlineData) {
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }
      // Fall back to text part which might contain a data URL
      const textPart = parts.find(part => part.text);
      if (textPart && textPart.text.startsWith('data:')) {
        return textPart.text;
      }
    }
    throw new Error('No image generated. Try a different prompt or image.');
  } catch (error) {
    console.error('Error generating image from text and image:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      if (error.response.status === 400) {
        throw new Error('Invalid API key or API quota exceeded. Please check your API key.');
      }
      throw new Error(`API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('No response received from the API. Please check your internet connection.');
    } else {
      console.error('Error details:', error.message);
      throw error; // Return the original error instead of creating a new one
    }
  }
};
