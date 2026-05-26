const fs = require('fs');

const macPackages = require('./data/mac-packages.json');

const domains = {
  "Raycast": "raycast.com",
  "Alfred": "alfredapp.com",
  "Rectangle": "rectangleapp.com",
  "Alt-Tab": "alt-tab-macos.netlify.app",
  "Maccy": "maccy.app",
  "Espanso": "espanso.org",
  "Warp": "warp.dev",
  "Alacritty": "alacritty.org",
  "OrbStack": "orbstack.dev",
  "TablePlus": "tableplus.com",
  "Arc": "arc.net",
  "IINA": "iina.io",
  "Plex Media Server": "plex.tv",
  "ImageOptim": "imageoptim.com",
  "AppCleaner": "freemacsoft.net",
  "The Unarchiver": "theunarchiver.com",
  "LuLu": "objective-see.org",
  "Stats": "github.com/exelban/stats",
  "KeepingYouAwake": "github.com/newmarcel/KeepingYouAwake",
  "Keka": "keka.io",
  "Scroll Reverser": "pilotmoon.com/scrollreverser",
  "htop": "htop.dev",
  "jq": "jqlang.github.io/jq",
  "tldr": "tldr.sh",
  "tree": "github.com/nodatime/nodatime", 
  "fzf": "github.com/junegunn/fzf",
  "neofetch": "github.com/dylanaraps/neofetch",
  "wget": "gnu.org/software/wget",
  "OpenEmu": "openemu.org",
  "RPCS3": "rpcs3.net"
};

let updated = 0;

for (let pkg of macPackages) {
  if (pkg.name === 'Slack') {
    pkg.logoUrl = '/images/logos/slacktechnologies-slack.png';
    updated++;
  } else if (pkg.name === 'Visual Studio 2022') {
    pkg.logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/59/Visual_Studio_Icon_2019.svg';
  } else if (pkg.logoUrl && pkg.logoUrl.includes('logo.clearbit.com')) {
    if (domains[pkg.name]) {
      pkg.logoUrl = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domains[pkg.name]}&size=128`;
      updated++;
    }
  }
}

fs.writeFileSync('./data/mac-packages.json', JSON.stringify(macPackages, null, 2));
console.log(`Updated ${updated} broken logos.`);
