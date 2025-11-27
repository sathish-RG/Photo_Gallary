const axios = require('axios');

const testApi = async () => {
  try {
    console.log('Fetching all templates...');
    const res = await axios.get('http://localhost:5000/api/templates');
    console.log(`Found ${res.data.count} templates.`);

    if (res.data.data.length > 0) {
      const firstId = res.data.data[0]._id;
      console.log(`Fetching template with ID: ${firstId}`);
      
      const singleRes = await axios.get(`http://localhost:5000/api/templates/${firstId}`);
      console.log('Success! Template Name:', singleRes.data.data.name);
    } else {
      console.log('No templates to test with.');
    }
  } catch (err) {
    console.error('API Error:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
  }
};

testApi();
