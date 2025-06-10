import React, { useState } from 'react';
import { db } from '../firebase';
import { useUser } from '../contexts/UserContext';
import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

const CommentInput = ({ postId }) => {
  const { user } = useUser();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleComment = async () => {
    if (!text.trim() || !user) return;

    setSubmitting(true);
    try {
      const commentRef = collection(db, 'posts', postId, 'comments');
      await addDoc(commentRef, {
        text,
        author: user.username || user.displayName || 'Anonymous',
        profilePic: user.profilePic || null,
        userId: user.uid,
        timestamp: serverTimestamp()
      });
      setText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-2 flex items-center space-x-2">
      <input
        type="text"
        placeholder="Write a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-grow px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
      <button
        onClick={handleComment}
       // disabled={!user || !text.trim() || submitting}
        className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Posting...' : 'Post'}
      </button>
    </div>
  );
};

export default CommentInput;
