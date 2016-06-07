# Minesweeper

**Toy app built with Electron**

## Usage detailed on <a href='https://manur.github.io/blog/2016/06/06/a-modern-minesweeper-clone/'>author's blog</a>


## Build instructions

### Development
```
cd desktop
npm install --save-dev
npm start
```

### Production
```
cd desktop

./node_modules/browserify/bin/cmd.js deps.js -o bundle.js && \

./node_modules/electron-packager/cli.js .  \
  --platform=darwin \
  --arch=x64 \
  --ignore=.git  \
  --overwrite \
  --icon=images/icon.icns \
  --out=dist && \

./node_modules/appdmg/bin/appdmg.js build.json dist/Minesweeper-darwin-x64/Minesweeper.dmg
```

#### License [CC0 (Public Domain)](LICENSE.md)
