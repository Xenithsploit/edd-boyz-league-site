export const getEmbedUrl = (url) => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  }

  if (url.includes('tiktok.com')) {
    return url.replace('/video/', '/embed/');
  }

  if (url.includes('twitch.tv/videos/')) {
    const videoId = url.split('/videos/')[1];
    return `https://player.twitch.tv/?video=${videoId}&parent=localhost`; // Change parent to your domain in production
  }

  {vod.type === 'twitch' && (
  <iframe
    src={formatTwitchEmbed(vod.url)}
    width="640"
    height="360"
    allowFullScreen
    frameBorder="0"
  />
)}


  return null;
};
