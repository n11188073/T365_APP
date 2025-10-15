import React, { useMemo, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faBookmark,
  faPaperPlane,
  faCommentDots,
  faChevronLeft,
  faChevronRight,
  faEllipsis
} from '@fortawesome/free-solid-svg-icons';

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
  const location = useLocation();
  const statePost = location?.state?.post;

  // Resolve the post (prefer router state for demo/sample posts)
  const post = useMemo(() => {
    if (statePost) return statePost;
    return posts.find((p) => p.post_id === id);
  }, [statePost, posts, id]);

  // Hooks must always run (no early returns)
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const [likeCount, setLikeCount] = useState(() => {
    const base = Number(post?.likes ?? post?.num_likes ?? 0);
    return Number.isNaN(base) ? 0 : base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // Media carousel support
  const hasMedia = Array.isArray(post?.media) && post.media.length > 0;
  const [idx, setIdx] = useState(0);
  const media = hasMedia ? post.media[idx] : null;

  const onLike = () => {
    setLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => c + (next ? 1 : -1));
      return next;
    });
  };
  const onSave = () => setSaved((s) => !s);
  const onToggleComments = () => setShowComments((s) => !s);

  const prevMedia = (e) => {
    e.preventDefault();
    if (!hasMedia) return;
    setIdx((i) => (i - 1 + post.media.length) % post.media.length);
  };
  const nextMedia = (e) => {
    e.preventDefault();
    if (!hasMedia) return;
    setIdx((i) => (i + 1) % post.media.length);
  };

  return (
    <div className="profile-container">
      {!post ? (
        <div className="post-view" style={{ padding: 16 }}>
          <h2>Post not found</h2>
          <Link to="/">Back to Home</Link>
        </div>
      ) : (
        <article className="post-view">
          {/* Header */}
          <header className="post-header">
            <div className="ig-user">
              <img
                className="ig-avatar"
                src={post.user_avatar || 'https://i.pravatar.cc/80?u=placeholder'}
                alt={post.user_name || 'user'}
              />
              <div className="ig-user-meta">
                <div className="ig-username">{post.user_name || 'traveler'}</div>
                <div className="ig-location">
                  {post.location ? (
                    <a href={mapHrefFor(post)} target="_blank" rel="noopener noreferrer">
                      {post.location}
                    </a>
                  ) : '—'}
                </div>
              </div>
            </div>
            <button className="icon-btn" aria-label="More">
              <FontAwesomeIcon icon={faEllipsis} />
            </button>
          </header>

          {/* Media */}
          <div className="post-media-frame">
            {hasMedia ? (
              <div className="post-carousel">
                {post.media.length > 1 && (
                  <button className="carousel-btn left" onClick={prevMedia} aria-label="Previous">
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                )}

                {media?.type === 'video' ? (
                  <video
                    controls
                    className="post-media-large"
                    src={`data:video/*;base64,${media.data}`}
                  />
                ) : media?.data ? (
                  <img
                    className="post-media-large"
                    src={`data:image/*;base64,${media.data}`}
                    alt={media?.filename || post.post_name}
                  />
                ) : post.imageUrl ? (
                  <img className="post-media-large" src={post.imageUrl} alt={post.post_name} />
                ) : null}

                {post.media.length > 1 && (
                  <button className="carousel-btn right" onClick={nextMedia} aria-label="Next">
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                )}
              </div>
            ) : post?.imageUrl ? (
              <img className="post-media-large" src={post.imageUrl} alt={post.post_name} />
            ) : null}
          </div>

          {/* Actions (row across) */}
          <div className="post-actions">
            <button
              className={`icon-btn like ${liked ? 'active' : ''}`}
              aria-label="Like"
              onClick={onLike}
              title={liked ? 'Unlike' : 'Like'}
            >
              <FontAwesomeIcon icon={faHeart} />
            </button>

            <button
              className="icon-btn comment"
              aria-label="Comments"
              onClick={onToggleComments}
              title="Open comments"
            >
              <FontAwesomeIcon icon={faCommentDots} />
            </button>

            <button className="icon-btn share" aria-label="Share" title="Share">
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>

            <button
              className={`icon-btn save ${saved ? 'active' : ''}`}
              aria-label="Save"
              onClick={onSave}
              title={saved ? 'Unsave' : 'Save'}
            >
              <FontAwesomeIcon icon={faBookmark} />
            </button>
          </div>

          {/* Meta */}
          <div className="post-meta">
            <div className="ig-likes">{likeCount.toLocaleString()} likes</div>
            <div className="ig-caption">
              <span className="ig-username">{post.user_name || 'traveler'}</span>{' '}
              {post.caption || post.post_name}
            </div>
            <button className="ig-comments" onClick={onToggleComments}>
              {showComments ? 'Hide comments' : 'View all comments'}
            </button>
            <div className="ig-time">{post.time_ago || 'now'}</div>
          </div>

          {/* Comments panel (simple demo) */}
          {showComments && (
            <div className="comments-panel">
              {(post.comments?.length ? post.comments : [
                { id: 'c1', user: 'alex', text: 'So pretty!' },
                { id: 'c2', user: 'mika', text: 'Adding this to my list.' }
              ]).map((c) => (
                <div className="comment-row" key={c.id || `${c.user}-${c.text}`}>
                  <span className="comment-user">{c.user}</span> {c.text}
                </div>
              ))}
              <div className="comment-input-row">
                <input className="comment-input" placeholder="Add a comment..." />
                <button className="comment-send">Post</button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="post-footer">
            <Link to="/">← Back</Link>
          </div>
        </article>
      )}
    </div>
  );
};

export default PostPage;

