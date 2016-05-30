# Minesweeper

**Toy app built with Electron**

## Building

```
npm install --save-dev
```

```
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
