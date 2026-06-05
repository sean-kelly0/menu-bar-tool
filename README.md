# AssignmentBar

A macOS menu bar app for tracking assignments and deadlines. Lives in your menu bar and drops down a panel when clicked.

## Requirements

- macOS (Apple Silicon or Intel)
- [Node.js](https://nodejs.org) (v18+)

## Build

```bash
./build.sh
```

This installs dependencies and produces a `.dmg` and `.zip` in the `dist/` folder.

## Run without building

```bash
npm install
npm start
```

## Notes

- App data (assignments) is stored in `~/Library/Application Support/assignment-bar/assignments.json`
- The app hides from the Dock and lives only in the menu bar
- If launching from a VS Code terminal, the app handles the `ELECTRON_RUN_AS_NODE` env var automatically
