import { useState } from 'react';
import './Upload.css';

const Upload = ({ onPostCreated }) => {
  const [previews, setPreviews] = useState([]);
  const [selected, setSelected] = useState([]);
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('post');
  const [postText, setPostText] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]); // 👤 for UI display only
  const [showTagModal, setShowTagModal] = useState(false);
  const [tempTag, setTempTag] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id;

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

  const handleAddTag = () => {
    if (tempTag.trim() && !taggedUsers.includes(tempTag.trim())) {
      setTaggedUsers(prev => [...prev, tempTag.trim()]);
      setTempTag('');
    }
  };

  const handleRemoveTag = (username) => {
    setTaggedUsers(prev => prev.filter(u => u !== username));
  };

  const handleCreatePost = async () => {
    if (!postText.trim()) return alert("Post text is required");
    if (!userId) return alert("You must be logged in to create a post");

    const mediaFiles = selected.map(i => previews[i]);
    if (mediaFiles.length === 0) return alert("Please select at least one image or video");

    try {
      const formData = new FormData();
      formData.append('post_name', postText);
      formData.append('location', location);
      formData.append('tags', tags);
      formData.append('user_id', String(userId));
      formData.append('tagged_users', JSON.stringify(taggedUsers)); // UI only for now

      mediaFiles.forEach(file => formData.append('files', file.file));

      const response = await fetch(`${BACKEND_URL}/create-post`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert("Post created successfully!");
        setStep(1);
        setPreviews([]);
        setSelected([]);
        setPostText('');
        setLocation('');
        setTags('');
        setTaggedUsers([]);
        if (onPostCreated) onPostCreated();
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
          <button
            className={`toggle ${mode === 'post' ? 'active' : ''}`}
            onClick={() => { setMode('post'); setPreviews([]); setSelected([]); }}
          >
            Post
          </button>
          <button
            className={`toggle ${mode === 'video' ? 'active' : ''}`}
            onClick={() => { setMode('video'); setPreviews([]); setSelected([]); }}
          >
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
              <video src={media.src} controls muted />
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
          <textarea
            className="input-textarea"
            placeholder="Share your experience..."
            value={postText}
            onChange={e => setPostText(e.target.value)}
          />
          <input
            type="text"
            className="input-text"
            placeholder="📍 Add location"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <input
            type="text"
            className="input-text"
            placeholder="#️⃣ Add tags (comma separated)"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />

          <button className="tag-btn" onClick={() => setShowTagModal(true)}>
            <span className="tag-icon">👥</span>
            <span>Tag People</span>
          </button>

          {taggedUsers.length > 0 && (
            <div className="tagged-list">
              {taggedUsers.map((user, idx) => (
                <span key={idx} className="tag-chip">
                  @{user}
                  <button className="remove-tag" onClick={() => handleRemoveTag(user)}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <button className="btn primary bottom-btn" onClick={handleCreatePost}>
          Upload
        </button>
      )}

      {showTagModal && (
        <div className="tag-modal">
          <div className="tag-modal-content">
            <h3>Tag People</h3>
            <input
              type="text"
              className="input-text"
              placeholder="Enter username..."
              value={tempTag}
              onChange={e => setTempTag(e.target.value)}
            />
            <div className="tag-modal-actions">
              <button className="btn" onClick={() => setShowTagModal(false)}>Cancel</button>
              <button className="btn primary" onClick={() => { handleAddTag(); setShowTagModal(false); }}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
