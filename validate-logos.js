const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const macPackages = require('./data/mac-packages.json');

const checkUrl = (urlStr) => {
  return new Promise((resolve) => {
    if (urlStr.startsWith('/images/logos/')) {
      const localPath = path.join(__dirname, 'public', urlStr);
      resolve({ url: urlStr, exists: fs.existsSync(localPath) });
      return;
    }

    const mod = urlStr.startsWith('https') ? https : http;
    const req = mod.get(urlStr, (res) => {
      resolve({ url: urlStr, exists: res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302 });
    });
    req.on('error', () => resolve({ url: urlStr, exists: false }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ url: urlStr, exists: false });
    });
  });
};

(async () => {
  const results = [];
  for (const pkg of macPackages) {
    if (!pkg.logoUrl) {
      console.log(`Missing completely: ${pkg.name}`);
    } else {
      const res = await checkUrl(pkg.logoUrl);
      if (!res.exists) {
        console.log(`Broken: ${pkg.name} -> ${pkg.logoUrl}`);
      }
    }
  }
  console.log("Validation complete.");
})();
