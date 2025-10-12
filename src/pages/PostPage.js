import React from 'react';
import { useParams, Link } from 'react-router-dom';

// Helper duplicated here for simplicity.
// You can move it to a shared util file if you prefer.
const mapHrefFor = (post) => {
  const { lat, lng, location } = post || {};
  if (typeof lat === 'number' && typeof lng === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  }
  if (location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post?.post_name || 'map')}`;
};

const PostPage = ({ posts = [] }) => {
  const { id } = useParams();
  const post = posts.find((p) => p.post_id === id);

  if (!post) {
    return (
      <div className="main-container">
        <h2>Post not found</h2>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="main-container">
      <h2>{post.post_name}</h2>
      {post.imageUrl && (
        <img src={post.imageUrl} alt={post.post_name} className="post-media" />
      )}

      <p><strong>ID:</strong> {post.post_id}</p>
      <p className="muted">
        {post.location ? (
          <a
            href={mapHrefFor(post)}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps"
          >
            {post.location}
          </a>
        ) : '—'}
      </p>

      <div style={{ marginTop: 12 }}>
        <Link to="/">← Back to Home</Link>
      </div>
    </div>
  );
};

export default PostPage;
