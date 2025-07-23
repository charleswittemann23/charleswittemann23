const axios = require('axios');
require('dotenv').config()
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const authCode = process.env.AUTH_CODE; // or pass it dynamically




async function getTokens() {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: redirectUri,
  });

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', params.toString(), {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    console.log('Access Token:', response.data.access_token);
    console.log('Refresh Token:', response.data.refresh_token);
  } catch (error) {
    console.error('Error getting tokens:', error.response?.data || error.message);
  }
}

getTokens();