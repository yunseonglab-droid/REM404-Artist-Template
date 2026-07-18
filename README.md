# Artist Archive Template

An exhibition-ready WebAR template for artists. Visitors scan a printed work,
reveal an AR image, and can leave an anonymous response for later visitors.
It keeps the same interaction model while separating each artist's branding
and data.

## What is included

- MindAR + A-Frame image-recognition experience (two artwork targets)
- staged image reveal, haptics, and separate reveal/archive sounds
- Korean and English visitor interface
- Firebase Firestore anonymous-memory archive
- artist admin, statistics, debug, and archive-management pages

## Create an artist's edition

1. Open `js/site-config.js` and set `siteId`, `brand`, artist name, artwork
   title, version, collection names, and an admin password.
2. Create a **new Firebase project** for that artist. Paste its Web App config
   into `siteConfig.firebase`. Configure Firestore Security Rules before making
   the site public.
3. Follow `assets/REPLACE_ASSETS.md` to replace the AR targets, reveal images,
   and sounds. The existing media are samples only and must not ship as another
   artist's work.
4. Edit `js/lang/ko.js` and `js/lang/en.js` if the exhibition needs its own
   curatorial language.
5. Deploy the folder to Firebase Hosting and test from the final printed works.

## Firebase Hosting

This repository is connected to the Firebase project `rem404archive-01`.

```bash
firebase login
firebase deploy --only hosting
```

The deployed site is available at:

- https://rem404archive-01.web.app
- https://rem404archive-01.firebaseapp.com

The `firebase.json` file excludes repository metadata and applies immediate
revalidation to HTML, JavaScript, and CSS so site updates appear promptly.

## Important security note

The admin password in `js/site-config.js` is a convenience gate only: a
static-site password can be read by anyone. Use Firebase Authentication and
proper Firestore Security Rules for real access control. Never store server
secrets in this repository.

## Main files

| Purpose | File |
| --- | --- |
| Per-artist settings | `js/site-config.js` |
| Visitor landing page | `index.html` |
| WebAR experience | `ar.html`, `js/ar.js` |
| Firestore integration | `js/firebase.js` |
| Admin dashboard | `admin.html` |
