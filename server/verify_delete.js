const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_URL = 'http://localhost:5000/api';
const TEST_USER = {
  username: 'delete_test_user_' + Date.now(),
  email: `delete_test_${Date.now()}@example.com`,
  password: 'password123'
};

async function runTest() {
  try {
    console.log('1. Registering user...');
    let token;
    try {
      const regRes = await axios.post(`${API_URL}/auth/register`, TEST_USER);
      token = regRes.data.token;
    } catch (e) {
      console.log('User might exist, logging in...');
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      token = loginRes.data.token;
    }
    console.log('Token obtained.');

    console.log('2. Uploading metadata (simulating Cloudinary upload)...');
    const mediaData = {
      mediaUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      fileSize: 12345,
      fileName: 'test_delete.jpg',
      caption: 'To be deleted'
    };

    const uploadRes = await axios.post(`${API_URL}/media`, mediaData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const mediaId = uploadRes.data.data._id;
    console.log(`Media uploaded with ID: ${mediaId}`);

    console.log('3. Deleting media...');
    await axios.delete(`${API_URL}/media/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Delete request successful.');

    console.log('4. Verifying deletion...');
    try {
      await axios.delete(`${API_URL}/media/${mediaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.error('ERROR: Media still exists (should have returned 404)');
    } catch (e) {
      if (e.response && e.response.status === 404) {
        console.log('SUCCESS: Media not found (404) as expected.');
      } else {
        console.error('Unexpected error during verification:', e.message);
      }
    }

  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
}

runTest();
