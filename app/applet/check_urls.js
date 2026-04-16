import https from 'https';

const urls = [
  'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?auto=format&fit=crop&q=80&w=800', // Alface
  'https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?auto=format&fit=crop&q=80&w=800', // Ovos
  'https://images.unsplash.com/photo-1585247226801-bc613c441316?auto=format&fit=crop&q=80&w=800'  // Feijao
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(`${url} - Status: ${res.statusCode}`);
  }).on('error', (e) => {
    console.error(`${url} - Error: ${e.message}`);
  });
});
