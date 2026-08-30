# face

A lightweight, no-framework scroll sequence for GitHub Pages. Scroll through the page to move from the first portrait to the last; the canvas keeps every image centered and contained in the viewport. Its stable small-viewport stage avoids geometry jumps when mobile browser chrome appears or disappears.

## Local preview

From this directory, run `python3 -m http.server 8000`, then open <http://localhost:8000>.

## GitHub Pages

This `face` directory can be the root of its own repository: commit and push it, then choose **Settings → Pages → Deploy from a branch** and select the repository root. For a monorepo, publish or copy these contents to the configured repository root or `/docs` folder, or deploy the directory with a GitHub Actions Pages workflow. Relative asset paths are intentional so project pages work correctly.

## Customize

Edit `FRAME_FILES` at the top of `script.js` to change the frame files or their order. Adjust `--scroll-height` in `styles.css` (currently `700vh`) to tune the amount of travel. Images are copied into `assets/frames/`; the original JPGs at the project root are kept unchanged.
