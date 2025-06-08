import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const getEmbedUrl = (url) => {
  try {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtube.com')
        ? new URL(url).searchParams.get('v')
        : url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes('tiktok.com')) {
      return url.includes('/video/')
        ? `https://www.tiktok.com/embed${new URL(url).pathname}`
        : null;
    }

    if (url.includes('twitch.tv/videos/')) {
      const videoId = url.split('/videos/')[1];
      return `https://player.twitch.tv/?video=${videoId}&parent=localhost`; // change to prod domain
    }

    return null;
  } catch (error) {
    console.warn('Invalid VOD URL:', url);
    return null;
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
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-yellow-400 drop-shadow">
        Game Highlights & VODs
      </h1>

      {vods.length === 0 ? (
        <p className="text-center text-gray-400 italic">No VODs available yet.</p>
      ) : (
        vods.map((vod) => {
          const embedUrl = getEmbedUrl(vod.url);

          return (
            <div key={vod.id} className="mb-10 bg-gray-950 p-4 rounded shadow-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-2 text-red-500">
                {vod.title || 'Untitled VOD'}
              </h2>
              {embedUrl ? (
                <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    src={embedUrl}
                    title={vod.title}
                    frameBorder="0"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                  ></iframe>
                </div>
              ) : (
                <p className="text-yellow-400">
                  ⚠️ Invalid or unsupported video URL: <br />
                  <span className="text-sm break-words">{vod.url}</span>
                </p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default VODsPage;
