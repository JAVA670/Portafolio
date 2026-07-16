# Your media goes here

Drop your own files in this folder, then reference them from `index.html`
with relative paths like `assets/film-01.mp4`.

Suggested naming (matches the comments in index.html):

| File | Used for | Referenced in index.html as |
| --- | --- | --- |
| hero.mp4 | Hero background film (muted, looping) | hero <video> <source src> |
| hero-poster.jpg | Still shown before the hero video loads | hero <img id="hero-fallback"> |
| film-01.mp4 … film-06.mp4 | The film that plays in each pop-up player | each card data-video="..." |
| thumb-01.jpg … thumb-06.jpg | Thumbnail still for each project | each card <img class="card-img" src> |

Export tips for smooth playback:
- H.264 MP4, ~6–8 Mbps for background/hero, up to ~12 Mbps for feature films.
- Keep the hero clip short (10–15s) since it loops.
- Thumbnails ~1600px wide JPGs, quality 80.
