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

## 작가 전시 만들기

1. 이 저장소를 새 GitHub 저장소의 기본 전시틀로 복제합니다.
2. `assets/REPLACE_ASSETS.md` 안내에 따라 인식 이미지, 공개 이미지와
   사운드를 교체합니다. 샘플 미디어는 다른 작가의 전시에 사용하지 않습니다.
3. GitHub Pages를 켠 뒤 생성된 관객용 주소와 QR이 정상 동작하는지 확인합니다.
4. REM404 관리자 앱에서 `전시 등록하기`를 누르고 해당 QR 또는 GitHub Pages
   주소를 등록합니다. 작가 계정의 요청은 전체 관리자 승인 후 활성화됩니다.
5. 이후 전시명, 영문명, 전시 기간과 설명은 REM404 앱에서 수정합니다.
   관객 페이지는 Firebase의 공개 설정을 즉시 읽고, GitHub Actions가 10분마다
   `js/exhibition-snapshot.js`에 마지막 설정을 자동 커밋합니다.

앱이나 정적 파일에 GitHub 개인 액세스 토큰을 넣지 마세요. 자동 커밋은 각
저장소에 한정된 GitHub Actions의 `GITHUB_TOKEN`만 사용합니다.

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
| REM404 connection and fallback settings | `js/site-config.js`, `js/exhibition-config.js` |
| Automatically committed metadata snapshot | `js/exhibition-snapshot.js` |
| Visitor landing page | `index.html` |
| WebAR experience | `ar.html`, `js/ar.js` |
| Firestore integration | `js/firebase.js` |
| Admin dashboard | `admin.html` |
