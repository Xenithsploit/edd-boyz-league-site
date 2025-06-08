import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(list);
    });

    return () => unsubscribe();
  }, [postId]);

  if (comments.length === 0) {
    return <p className="text-sm text-gray-400 italic">No comments yet.</p>;
  }

  return (
    <div className="mt-2 space-y-2">
      {comments.map(comment => (
        <div key={comment.id} className="flex items-start space-x-3">
          {comment.profilePic ? (
            <img
              src={comment.profilePic}
              alt="User"
              className="w-8 h-8 rounded-full border border-yellow-400"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs border border-gray-500">
              {comment.author?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div className="bg-gray-800 text-white p-2 rounded-lg max-w-sm">
            <p className="text-sm font-semibold text-yellow-400">{comment.author}</p>
            <p className="text-sm">{comment.text}</p>
            <p className="text-xs text-gray-400 mt-1">
              {comment.timestamp?.toDate?.().toLocaleString() || 'Just now'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
