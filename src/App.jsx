import { useState, useEffect } from 'react';
import { generateImageFromText, generateImageFromTextAndImage } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import { storePassphrase, getPassphrase, removePassphrase } from './utils/accessKey';

function App() {
  const [activeTab, setActiveTab] = useState('text-to-image');
  const [apiKey, setApiKey] = useState(getPassphrase() || '');
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('');
  
  // Function to clear all inputs and reset the form
  const handleClearForm = () => {
    setPrompt('');
    setAspectRatio('');
    setError(null);
    setGeneratedImage(null);
    
    if (activeTab === 'image-text-to-image') {
      setImageFile(null);
      setPreviewUrl('');
    }
  };
  
  // Reset state when switching tabs
  useEffect(() => {
    // Only reset if not explicitly transferring from text-to-image to image+text mode
    if (!window.keepImageState) {
      setGeneratedImage(null);
      setError(null);
      setPrompt('');
      if (activeTab === 'text-to-image') {
        setImageFile(null);
        setPreviewUrl('');
      }
    } else {
      // Clear the flag after use
      window.keepImageState = false;
    }
  }, [activeTab]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to handle downloading the generated image
  const handleDownloadImage = () => {
    if (!generatedImage) return;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Function to modify the generated image (transfer to image+text mode)
  const handleModifyImage = async () => {
    if (!generatedImage) return;
    
    try {
      // Set a flag to prevent state reset in the useEffect
      window.keepImageState = true;
      
      // Convert data URL to File object
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const file = new File([blob], `image-to-modify-${Date.now()}.png`, { type: 'image/png' });
      
      // Switch to image+text mode and set the current image as the input
      setActiveTab('image-text-to-image');
      setImageFile(file);
      setPreviewUrl(generatedImage);
      setGeneratedImage(null); // Clear the generated image so it doesn't show in output
      setPrompt(''); // Clear the prompt for new instructions
    } catch (err) {
      console.error('Error preparing image for modification:', err);
      setError('Failed to prepare image for modification');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    
    if (activeTab === 'image-text-to-image' && !imageFile) {
      setError('Please upload an image');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Store the API key
      storePassphrase(apiKey.trim());
      
      let response;
      if (activeTab === 'text-to-image') {
        response = await generateImageFromText(prompt, aspectRatio);
      } else {
        response = await generateImageFromTextAndImage(prompt, imageFile, aspectRatio);
      }
      
      // The response is now directly the image data URL if available
      if (typeof response === 'string' && response.startsWith('data:')) {
        setGeneratedImage(response);
      } else {
        setError('No image generated. Try a different prompt or API key.');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err.message || 'Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="header-glow-1"></div>
        <div className="header-glow-2"></div>
        <div className="container">
          <div className="title-container">
            <h1>AI Image Generator</h1>
            <p className="subtitle">Powered by Google Gemini 2</p>
          </div>
        </div>
      </header>
      
      <main className="container">
        {/* API Key Input */}
        <div className="api-key-container">
          <input
            type="text"
            placeholder="Enter your Gemini API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onPaste={(e) => {
              e.preventDefault();
              const pastedText = e.clipboardData.getData('text');
              setApiKey(pastedText.trim());
            }}
            className="api-key-input"
          />
          {apiKey && (
            <button 
              className="clear-btn" 
              onClick={() => {
                removePassphrase();
                setApiKey('');
              }}
            >
              Clear
            </button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab ${activeTab === 'text-to-image' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => setActiveTab('text-to-image')}
          >
            Text to Image
          </button>
          <button
            className={`tab ${activeTab === 'image-text-to-image' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => setActiveTab('image-text-to-image')}
          >
            Image+Text to Image
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            {activeTab === 'image-text-to-image' && (
              <div className="form-group">
                <label htmlFor="image-upload" className="form-label">
                  <span className="label-icon">📷</span> Upload an image
                </label>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden-input"
                  disabled={isLoading}
                />
                <div 
                  onClick={() => document.getElementById('image-upload').click()}
                  className={`file-upload-container ${previewUrl ? 'has-image' : ''}`}
                >
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="preview-image" 
                    />
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon">📷</div>
                      <p className="upload-text">Click to upload an image</p>
                      <p className="upload-formats">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="prompt" className="form-label">
                <span className="label-icon">✨</span> Enter your prompt
              </label>
              <textarea
                id="prompt"
                className="input-field"
                placeholder={activeTab === 'text-to-image' ? 
                  "Describe the image you want to generate..." : 
                  "Describe how you want to transform the image..."}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
              />
              <div className="prompt-tips">
                <p>Tips: Be specific about style, colors, and composition for best results</p>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="aspect-ratio" className="form-label">
                <span className="label-icon">📐</span> Choose aspect ratio (optional)
              </label>
              <div className="aspect-ratio-container">
                <select
                  id="aspect-ratio"
                  className="input-field aspect-ratio-select"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Default (square 1:1)</option>
                  <option value="16:9">Landscape (16:9)</option>
                  <option value="4:3">Landscape (4:3)</option>
                  <option value="3:2">Landscape (3:2)</option>
                  <option value="9:16">Portrait (9:16)</option>
                  <option value="3:4">Portrait (3:4)</option>
                  <option value="2:3">Portrait (2:3)</option>
                </select>
              </div>
            </div>
            
            <div className="button-container">
              <button
                type="submit"
                className="btn btn-primary generate-btn"
                disabled={isLoading || !prompt.trim() || !apiKey.trim() || (activeTab === 'image-text-to-image' && !imageFile)}
              >
                {isLoading ? 'Generating...' : 'Generate Image'}
              </button>
              <button
                type="button"
                className="btn btn-secondary clear-all-btn"
                onClick={handleClearForm}
                disabled={isLoading || (!prompt.trim() && !generatedImage && (activeTab === 'text-to-image' || !imageFile))}
              >
                <span className="action-icon">🔄</span> Clear All
              </button>
            </div>
          </form>

          {isLoading && <LoadingSpinner />}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {generatedImage && !isLoading && (
            <div className="result-container">
              <h2 className="result-title">Generated Image</h2>
              <div className="image-container">
                <img 
                  src={generatedImage} 
                  alt="Generated" 
                  className={`generated-image ${aspectRatio ? `aspect-ratio-${aspectRatio.replace(':', '-')}` : ''}`}
                />
                <div className="image-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleDownloadImage}
                  >
                    <span className="action-icon">💾</span> Download
                  </button>
                  {activeTab === 'text-to-image' && (
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={handleModifyImage}
                    >
                      <span className="action-icon">✏️</span> Modify
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer>
        <div className="container">
          <p>© {new Date().getFullYear()} AI Image Generator | Powered by Google Gemini 2</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
