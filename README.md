# Nina 18 — digital birthday invitation

A single mobile-first page (Serbian, Latin script) for Nina's 18th birthday. Plain HTML/CSS/JS with no build step, hosted on GitHub Pages.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page content, including all visible text, and the link-preview meta tags |
| `style.css` | Styles |
| `script.js` | Countdown, RSVP/map links, confetti. **Event config is at the top.** |
| `assets/og-image.jpg` | 1200×630 link-preview image (WhatsApp/Viber/Instagram) |
| `assets/favicon.svg` | Tab icon |

## Before sending the link: replace the placeholders

The date and time are still placeholders. Update them in these places:

1. **`index.html`**, in the "Gde i kada" section: the visible date and time (and the RSVP deadline, "do 30. novembra", if it changes).
2. **`index.html`** `<head>`: the `description` meta tag (it repeats the date and time).
3. **`script.js`** `CONFIG`: `start`/`end` (keep the `+01:00` offset for winter dates or use `+02:00` for summer), plus `phone` and `mapQuery` if they change.

The preview image doesn't show the date, so it doesn't need regenerating.

## Publish on GitHub Pages

1. Create a GitHub repo named `nina-pozivnica` and push this folder to it.
2. In the repo, go to **Settings → Pages → Build and deployment**, set Source to *Deploy from a branch*, and choose branch `main` and folder `/ (root)`.
3. The site appears at `https://<username>.github.io/nina-pozivnica/`.
4. **Important:** `og:url`, `og:image` and `twitter:image` in `index.html` must be absolute URLs. They currently point to `https://gdope.github.io/nina-pozivnica/`. If your username or repo name differs, change them, or the link preview won't show an image.

## Testing the link preview

- Paste the URL into <https://www.opengraph.xyz/> to check the preview.
- WhatsApp caches previews per URL. If you sent the link before fixing something, add `?v=2` to the end to get a fresh preview.

## Local preview

Open `index.html` directly in a browser, or run `python -m http.server` in this folder and visit <http://localhost:8000>.
