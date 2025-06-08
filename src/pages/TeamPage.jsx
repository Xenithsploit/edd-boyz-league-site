// src/pages/TeamPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, query, orderBy, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { useUser } from '../contexts/UserContext';
import CommentInput from '../components/CommentInput';
import CommentList from '../components/CommentList';

const teams = [
  { name: 'Auburn Tigers', slug: 'auburn' },
  { name: 'Florida Gators', slug: 'florida' },
  { name: 'Florida State Seminoles', slug: 'floridastate' },
  { name: 'Houston Cougars', slug: 'houston' },
  { name: 'LSU Tigers', slug: 'lsu' },
  { name: 'Miami Hurricanes', slug: 'miami' },
  { name: 'North Carolina Tarheels', slug: 'northcarolina' },
  { name: 'Notre Dame Fighting Irish', slug: 'notredame' },
  { name: 'Ole Miss Rebels', slug: 'olemiss' },
  { name: 'Oregon Ducks', slug: 'oregon' },
  { name: 'Penn State Nittany Lions', slug: 'pennstate' },
  { name: 'South Carolina Gamecocks', slug: 'southcarolina' },
  { name: 'Texas Tech Red Raiders', slug: 'texastech' },
  { name: 'UCLA Bruins', slug: 'ucla' },
  { name: 'Washington Huskies', slug: 'washington' },
];

const TeamPage = () => {
  const { teamSlug } = useParams();
  const { user } = useUser();
  const [posts, setPosts] = useState([]);

  const teamInfo = teams.find(team => team.slug.toLowerCase() === teamSlug.toLowerCase());
  const teamName = teamInfo?.name || teamSlug;

  const getTeamLogo = async (slug) => {
    try {
      const logoRef = ref(storage, `team_logos/${slug}.png`);
      return await getDownloadURL(logoRef);
    } catch {
      return null;
    }
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

    await updateDoc(postRef, {
      likes: (post.likes || 0) + likeChange,
      dislikes: (post.dislikes || 0) + dislikeChange,
      voters: { ...post.voters, [user.uid]: voteType },
    });
  };

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('team', '==', teamSlug),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const logoUrl = await getTeamLogo(teamSlug);
          return { id: docSnap.id, ...data, logoUrl };
        })
      );
      setPosts(postList);
    });

    return () => unsubscribe();
  }, [teamSlug]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-red-600 drop-shadow">
        {teamName} Team Page
      </h1>

      <h2 className="text-xl font-semibold mb-4 text-gray-100 bg-black py-2 px-4 rounded shadow inline-block">
        Recent Posts
      </h2>

      {posts.length > 0 ? (
        posts.map((post) => (
          <div
            key={post.id}
            className="flex flex-col space-y-2 p-4 border border-gray-700 rounded-lg mb-6 bg-gray-950 text-white shadow-xl"
          >
            <div className="flex items-start space-x-4">
              {post.logoUrl && (
                <img src={post.logoUrl} alt={`${post.team} logo`} className="w-10 h-10 object-cover rounded border border-red-600" />
              )}
              {post.profilePic && (
                <img src={post.profilePic} alt="Profile" className="w-10 h-10 rounded-full border border-yellow-400" />
              )}
              <div>
                <p className="font-semibold">
                  {post.author}{' '}
                  <span className="text-sm text-gray-400 ml-2">
                    ({post.timestamp
                      ? post.timestamp.toDate?.()
                        ? post.timestamp.toDate().toLocaleString()
                        : new Date(post.time).toLocaleString()
                      : 'Unknown date'})
                  </span>
                </p>
                <p className="mb-2">{post.content}</p>

                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <button
                    onClick={() => handleVote(post.id, 'like')}
                    className={`hover:text-green-400 transition ${
                      post.voters?.[user?.uid] === 'like' ? 'font-bold text-green-500' : ''
                    }`}
                    disabled={!user}
                  >
                    👍 {post.likes || 0}
                  </button>
                  <button
                    onClick={() => handleVote(post.id, 'dislike')}
                    className={`hover:text-red-400 transition ${
                      post.voters?.[user?.uid] === 'dislike' ? 'font-bold text-red-500' : ''
                    }`}
                    disabled={!user}
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
        ))
      ) : (
        <p className="text-center text-gray-400 italic">No posts yet for this team.</p>
      )}
    </div>
  );
};

export default TeamPage;
