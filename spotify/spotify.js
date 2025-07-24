require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

async function refreshAccessToken() {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await axios.post('https://accounts.spotify.com/api/token', params.toString(), {
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data.access_token;
}

async function getRecentlyPlayed(accessToken) {
  const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=2', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data.items;
}

function formatTracksMarkdown(tracks) {
  if (!tracks.length) return 'No recently played tracks found.';

  return tracks
    .map(({ track }, index) => {
      const artists = track.artists.map(artist => artist.name).join(', ');
      const albumImage = track.album.images.length
        ? track.album.images[track.album.images.length - 1].url
        : '';

      return `${index + 1}. <img src="${albumImage}" alt="Album Cover" width="48" height="48" /> [${track.name}](${track.external_urls.spotify}) — ${artists}`;
    })
    .join('\n');
}



function updateReadme(content) {
  const readmePath = path.resolve(process.cwd(), 'README.md');
  const readme = fs.readFileSync(readmePath, 'utf-8');
  const newReadme = readme.replace(
    /<!--SPOTIFY_START-->[\s\S]*<!--SPOTIFY_END-->/,
    `<!--SPOTIFY_START-->\n${content}\n<!--SPOTIFY_END-->`
  );

  const timestamp =  new Date().toLocaleString();
  const time_sync_ReadMe = newReadme.replace(/(## 🎧 Recently Played Tracks \(Last Updated at: )[^\)]*\)/,
    `$1${timestamp})`)


  fs.writeFileSync(readmePath, time_sync_ReadMe, 'utf-8');
  console.log('README.md updated successfully.');
}

async function main() {
  try {
    const accessToken = await refreshAccessToken();
    const recentlyPlayed = await getRecentlyPlayed(accessToken);
    const markdown = formatTracksMarkdown(recentlyPlayed);
    updateReadme(markdown);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

main();
