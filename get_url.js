const https = require('https');
const options = {
  hostname: 'in.pinterest.com',
  path: '/pin/616711742747899369/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};
https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/https:\/\/[^\s\'\"<>]+\.mp4/g);
    if(matches) console.log([...new Set(matches)]);
    else console.log('No matches');
  });
}).on('error', err => console.error(err));
