// src/pages/VODsPage.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const getEmbedUrl = (url) => {
  try {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtube.com')
        ? new URL(url).searchParams.get('v')
        : url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Twitch VODs
    if (url.includes('twitch.tv/videos/')) {
      const videoId = url.split('/videos/')[1];
      return `https://player.twitch.tv/?video=${videoId}&parent=edd-boyz-network.web.app`;
    }

    // Twitch Clips (user + direct link)
    const match =
      url.match(/clip\/([a-zA-Z0-9-_]+)/) || // user clip URL
      url.match(/clips\.twitch\.tv\/([a-zA-Z0-9-_]+)/); // direct clip URL
    if (match) {
      const clipId = match[1];
      return `https://clips.twitch.tv/embed?clip=${clipId}&parent=edd-boyz-network.web.app&parent=localhost`;
    }

    // TikTok (not embeddable via iframe reliably)
    if (url.includes('tiktok.com')) {
      return null;
    }

    return null;
  } catch (error) {
    console.warn('Invalid VOD URL:', url);
  
}
};

const VODsPage = () => {
  const [vods, setVods] = useState([]);

  useEffect(() => {
    const fetchVODs = async () => {
      const q = query(collection(db, 'vods'), where('approved', '==', true));
      const snapshot = await getDocs(q);
      const vodList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVods(vodList.reverse());
    };

    fetchVODs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Game Highlights & VODs</h1>

      {vods.length === 0 ? (
        <p className="text-center text-gray-500 italic">No VODs available yet.</p>
      ) : (
        vods.map((vod) => {
          const embedUrl = getEmbedUrl(vod.url);

          return (
            <div key={vod.id} className="mb-10">
              <h2 className="text-xl font-semibold mb-2">{vod.title || 'Untitled VOD'}</h2>
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="360"
                  frameBorder="0"
                  allowFullScreen
                  title={vod.title}
                  className="rounded-lg shadow"
                ></iframe>
              ) : (
                <div className="text-red-500 text-sm">
                  ⚠️ Unsupported or unembeddable link: <a href={vod.url} className="underline" target="_blank" rel="noopener noreferrer">{vod.url}</a>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default VODsPage;
