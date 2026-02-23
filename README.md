# CYVL ARCADE

Retro arcade hub at [cyvl.world](https://cyvl.world). Hosted on Vercel, auto-deploys on push to `master`.

## Project Structure

```
index.html                          # Arcade hub / launcher page
shared/
  arcade.css                        # Shared CSS (colors, CRT overlay, fonts)
  arcade.js                         # Game registry + card renderer + audio
  arcade-nav.js                     # Back-to-arcade nav (include in every game)
games/
  infrastructure-wars/
    index.html                      # Infrastructure Wars game
  <your-game>/
    index.html                      # Add new games here
```

## Adding a New Game

### 1. Create the game folder

```bash
mkdir -p games/<game-name>
```

### 2. Add your game file

Place your game's `index.html` in `games/<game-name>/index.html`.

Add this line inside `<body>` before your game content:

```html
<script src="/shared/arcade-nav.js"></script>
```

This injects an `[ESC] ARCADE` back button and binds the Escape key to return to the hub.

### 3. Register the game in the arcade

Edit `shared/arcade.js` and add an entry to the `ARCADE_GAMES` array:

```js
{
  id: 'your-game-name',
  title: 'YOUR GAME TITLE',
  subtitle: 'A short tagline',
  description: 'One sentence about the game.',
  path: '/games/your-game-name/',
  tags: ['GENRE', 'DESKTOP'],
  colors: { primary: '#00e5ff', secondary: '#00ff88', accent: '#ff6600' }
}
```

### 4. Deploy

```bash
cd ~/projects/cyvl-world
git add -A
git commit -m "Add <game-name> to arcade"
git push
```

Vercel auto-deploys on push to `master`. The site will update within ~30 seconds.

## Local Preview

```bash
npx serve .
```

Then open `http://localhost:3000`.

## Tech Stack

- Pure HTML/CSS/JS — no frameworks, no build step
- Vercel static hosting
- GitHub repo: https://github.com/roadgnar/cyvl-world
