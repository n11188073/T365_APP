import React, { useState } from 'react';
import './Upload.css';

const New = () => {
  const [previews, setPreviews] = useState([]);
  const [selected, setSelected] = useState([]);
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('post');
  const [postText, setPostText] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [tagPeople, setTagPeople] = useState('');

  const userId = 1;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const mediaFiles = files.filter(file =>
      mode === 'post' ? file.type.startsWith('image/') : file.type.startsWith('video/')
    );

    mediaFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews(prev => [...prev, { src: reader.result, type: file.type, file }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleSelect = (index) => {
    setSelected(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleNext = () => {
    if (selected.length === 0) {
      alert("Please select at least one file");
      return;
    }
    const selectedFiles = selected.map(i => previews[i]);
    setPreviews(selectedFiles);
    setSelected(selectedFiles.map((_, idx) => idx));
    setStep(2);
  };

  const handleCreatePost = async () => {
  if (!postText.trim()) {
    alert("Post text is required");
    return;
  }

  const mediaFiles = selected.map(i => previews[i]);
  if (mediaFiles.length === 0) {
    alert("Please select at least one image or video");
    return;
  }

  try {
    const formData = new FormData();
    formData.append('post_name', postText);
    mediaFiles.forEach(file => formData.append('files', file.file));

    // Await the fetch response
    const response = await fetch('http://localhost:5000/create-post', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      alert("Post and media created successfully!");

      // Reset everything
      setStep(1);
      setPreviews([]);
      setSelected([]);
      setPostText('');
      setLocation('');
      setTags('');
      setTagPeople('');
    } else {
      alert("Failed to create post: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Error creating post:", err);
    alert("Error creating post. See console for details.");
  }
};

  return (
    <div className="container new-post-container">
      <header className="header">
        <h1>{step === 1 ? 'New Upload' : 'Create Post'}</h1>
        {step === 1 && previews.length > 0 && (
          <button className="btn primary" onClick={handleNext} disabled={selected.length === 0}>
            Next
          </button>
        )}
      </header>

      {step === 1 && (
        <div className="toggle-buttons">
          <button className={`toggle ${mode === 'post' ? 'active' : ''}`} onClick={() => { setMode('post'); setPreviews([]); setSelected([]); }}>
            Post
          </button>
          <button className={`toggle ${mode === 'video' ? 'active' : ''}`} onClick={() => { setMode('video'); setPreviews([]); setSelected([]); }}>
            Video
          </button>
        </div>
      )}

      <div className="grid">
        {step === 1 && (
          <label className="tile camera">
            <input
              type="file"
              accept={mode === 'post' ? 'image/*' : 'video/*'}
              multiple
              hidden
              onChange={handleFileChange}
            />
            <span className="icon">{mode === 'video' ? '🎥' : '📷'}</span>
          </label>
        )}

        {previews.map((media, idx) => (
          <div key={idx} className={`tile preview ${selected.includes(idx) ? 'selected' : ''}`}>
            {media.type.startsWith('image/') ? (
              <img src={media.src} alt={`media-${idx}`} />
            ) : (
              <video src={media.src} controls muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            {step === 1 && (
              <input
                type="checkbox"
                className="select-checkbox"
                checked={selected.includes(idx)}
                onChange={() => toggleSelect(idx)}
              />
            )}
          </div>
        ))}
      </div>

      {step === 2 && (
        <div className="post-form">
          {/* Keep Share your experience as textarea */}
          <textarea
            className="input-textarea"
            placeholder="Share your experience..."
            value={postText}
            onChange={e => setPostText(e.target.value)}
          />

          {/* Arrow buttons with relevant icons */}
          <button className="arrow-btn">📍 Add location</button>
          <button className="arrow-btn">#️⃣ Hashtags</button>
          <button className="arrow-btn">👤 Tag people</button>
        </div>
      )}

      {/* Upload button at bottom */}
      {step === 2 && (
        <button className="btn primary bottom-btn" onClick={handleCreatePost}>
          Upload
        </button>
      )}
    </div>
  );
};

export default New;
