const axios = require('axios');
const fs = require('fs');

const run = async () => {
  const log = (msg) => fs.appendFileSync('api_test_result.txt', msg + '\n');
  
  try {
    log('Fetching templates...');
    const res = await axios.get('http://localhost:5000/api/templates');
    log(`Status: ${res.status}`);
    log(`Count: ${res.data.count}`);
    
    if (res.data.data.length > 0) {
      const id = res.data.data[0]._id;
      log(`Fetching ID: ${id}`);
      const single = await axios.get(`http://localhost:5000/api/templates/${id}`);
      log(`Single Status: ${single.status}`);
      log(`Name: ${single.data.data.name}`);
    } else {
      log('No templates found.');
    }
  } catch (e) {
    log(`Error: ${e.message}`);
    if (e.response) log(`Response: ${JSON.stringify(e.response.data)}`);
  }
};

run();
