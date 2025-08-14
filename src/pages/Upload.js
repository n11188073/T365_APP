import React, { useState } from 'react';
import './Upload.css';

const New = () => {
  const [previews, setPreviews] = useState([]);
  const [mode, setMode] = useState('post'); // 'post' or 'video'
  const [selected, setSelected] = useState([]); // store selected indices

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
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleNext = async () => {
    const selectedFiles = selected.map(i => previews[i].file);

    if (selectedFiles.length === 0) {
      alert("Please select at least one file");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      // Parse response safely
      let data;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        console.error('Server responded with error:', data);
        alert(`Upload failed: ${typeof data === 'string' ? data : data.message}`);
        return;
      }

      console.log('Server response:', data);
      alert('Uploaded successfully!');
      setPreviews([]);
      setSelected([]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed: Network or server error');
    }
  };

  return (
    <div className="container">
      <header>
        <button className="back">&larr;</button>
        <h1>New Post</h1>
        {previews.length > 0 && (
          <button
            className="next-btn-header"
            onClick={handleNext}
            disabled={selected.length === 0}
          >
            Next
          </button>
        )}
      </header>

      <div className="toggle-buttons">
        <button
          className={`toggle ${mode === 'post' ? 'active' : ''}`}
          onClick={() => {
            setMode('post');
            setPreviews([]);
            setSelected([]);
          }}
        >
          Post
        </button>
        <button
          className={`toggle ${mode === 'video' ? 'active' : ''}`}
          onClick={() => {
            setMode('video');
            setPreviews([]);
            setSelected([]);
          }}
        >
          Video
        </button>
      </div>

      <div className="recents">
        <span>Recents</span>
        <span className="dropdown">&#9662;</span>
      </div>

      <div className="grid">
        {/* Camera/upload tile */}
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

        {/* Previews with always-visible checkboxes */}
        {previews.map((media, idx) => (
          <div
            className={`tile preview ${selected.includes(idx) ? 'selected' : ''}`}
            key={idx}
          >
            {media.type.startsWith('image/') ? (
              <img src={media.src} alt={`media-${idx}`} />
            ) : (
              <video
                src={media.src}
                controls
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            <input
              type="checkbox"
              className="select-checkbox"
              checked={selected.includes(idx)}
              onChange={() => toggleSelect(idx)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default New;
