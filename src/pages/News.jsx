// src/pages/News.jsx
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useUser } from '../contexts/UserContext';
import CommentInput from '../components/CommentInput';
import CommentList from '../components/CommentList';

const News = () => {
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postList);
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!auth.currentUser) return alert('You must be logged in to post!');

    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : null;

    if (!userData || !userData.team) {
      alert('No team assigned. Please contact the admin!');
      return;
    }

    await addDoc(collection(db, 'posts'), {
      content,
      author: userData.username || auth.currentUser.displayName,
      profilePic: userData.profilePic || null,
      team: userData.team,
      timestamp: serverTimestamp(),
      likes: 0,
      dislikes: 0,
      voters: {},
    });

    setContent('');
  };

  const handleVote = async (postId, voteType) => {
    if (!user) return;

    const postRef = doc(db, 'posts', postId);
    const snapshot = await getDoc(postRef);
    if (!snapshot.exists()) return;

    const post = snapshot.data();
    const currentVote = post.voters?.[user.uid] || null;

    if (currentVote === voteType) return;

    let likeChange = 0;
    let dislikeChange = 0;

    if (voteType === 'like') {
      likeChange = 1;
      if (currentVote === 'dislike') dislikeChange = -1;
    } else {
      dislikeChange = 1;
      if (currentVote === 'like') likeChange = -1;
    }

    const updatedVoters = { ...post.voters, [user.uid]: voteType };

    await updateDoc(postRef, {
      likes: (post.likes || 0) + likeChange,
      dislikes: (post.dislikes || 0) + dislikeChange,
      voters: updatedVoters,
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-center text-red-500 drop-shadow mb-6">🔥 League News</h1>

      {user ? (
        <div className="mb-8 bg-gray-900 p-4 rounded-lg shadow-lg">
          <textarea
            rows="4"
            className="w-full p-3 rounded bg-black text-white border border-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Post your game recap, trash talk, or update..."
          />
          <button
            onClick={handlePost}
            className="mt-3 w-full bg-red-600 text-white py-2 rounded hover:bg-red-500 transition"
          >
            Post
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-400 italic mb-6">Login to post updates!</p>
      )}

      {posts.map((post) => (
        <div
          key={post.id}
          className="flex flex-col space-y-2 p-4 border border-red-600 bg-black text-white rounded-lg mb-6 shadow-2xl"
        >
          <div className="flex items-start space-x-4">
            {post.profilePic && (
              <img src={post.profilePic} alt="Profile" className="w-10 h-10 rounded-full" />
            )}
            <div>
              <p className="font-semibold text-red-400">
                {post.author}
                <span className="text-sm text-gray-400 ml-2">
                  ({post.timestamp?.toDate?.() ? post.timestamp.toDate().toLocaleString() : 'Unknown date'})
                </span>
              </p>
              <p className="mb-2 text-gray-200">{post.content}</p>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm sm:text-base">
                <button
                  onClick={() => handleVote(post.id, 'like')}
                  disabled={!user}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-all duration-150 
                    ${post.voters?.[user?.uid] === 'like' 
                      ? 'bg-green-600 text-white border-green-700' 
                      : 'bg-gray-800 text-gray-300 hover:bg-green-500 hover:text-white border-gray-700'}`}
                >
                  👍 {post.likes || 0}
                </button>
                <button
                  onClick={() => handleVote(post.id, 'dislike')}
                  disabled={!user}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-all duration-150 
                    ${post.voters?.[user?.uid] === 'dislike' 
                      ? 'bg-red-600 text-white border-red-700' 
                      : 'bg-gray-800 text-gray-300 hover:bg-red-500 hover:text-white border-gray-700'}`}
                >
                  👎 {post.dislikes || 0}
                </button>
              </div>
            </div>
          </div>

          <div className="ml-12 mt-2">
            <CommentInput postId={post.id} />
            <CommentList postId={post.id} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default News;
