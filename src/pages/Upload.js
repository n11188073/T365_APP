
import React, { useState } from 'react';
import './Upload.css';
const New = () => {
  const [previews, setPreviews] = useState([]);
  const [mode, setMode] = useState('post'); // 'post' or 'video'
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const mediaFiles = files.filter(file =>
      mode === 'post' ? file.type.startsWith('image/') : file.type.startsWith('video/')
    );
    mediaFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews(prev => [...prev, { src: reader.result, type: file.type }]);
      };
      reader.readAsDataURL(file);
    });
  };
  return (
    <div className="container">
      <header>
        <button className="back">&larr;</button>
        <h1>New Post</h1>
      </header>
      <div className="toggle-buttons">
        <button
          className={`toggle ${mode === 'post' ? 'active' : ''}`}
          onClick={() => {
            setMode('post');
            setPreviews([]);
          }}
        >
          Post
        </button>
        <button
          className={`toggle ${mode === 'video' ? 'active' : ''}`}
          onClick={() => {
            setMode('video');
            setPreviews([]);
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
        {/* Upload tile */}
        <label className="tile camera">
          <input
            type="file"
            accept={mode === 'post' ? 'image/*' : 'video/*'}
            multiple
            hidden
            onChange={handleFileChange}
          />
          <span className="icon">📷</span>
        </label>
        {/* Media previews */}
        {previews.map((media, idx) => (
          <div className="tile" key={idx}>
            {media.type.startsWith('image/') ? (
              <img src={media.src} alt={`media-${idx}`} />
            ) : (
              <video src={media.src} controls muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default New;
