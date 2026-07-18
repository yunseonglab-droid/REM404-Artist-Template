# ART ARCHIVE v1.1.0 릴리스 노트

## Firebase Hosting 전환

- 독립 Firebase 프로젝트 `rem404archive-01`의 Hosting에 사이트를 배포했습니다.
- 새 서비스 주소는 `https://rem404archive-01.web.app`입니다.
- GitHub Pages와 별개로 Firebase에서 사이트를 운영하고 다시 배포할 수 있습니다.
- HTML, JavaScript, CSS 변경 사항이 방문자에게 빠르게 반영되도록 캐시 정책을 설정했습니다.

## 화면 및 운영 안정화

- 인트로 영상이 준비되지 않은 동안 검은 화면이 잠깐 나타나는 현상을 제거했습니다.
- 추후 `video/intro.mp4`를 추가하고 설정을 켜면 인트로 영상을 다시 사용할 수 있습니다.
- 관리자 인증 비밀번호를 `2489`로 적용했습니다.
- 실제 Firebase 공개 주소에서 메인 화면과 관리자 인증 동작을 확인했습니다.

## 확인된 사항

- 방문자 기억 데이터 조회가 정상 작동합니다.
- Firestore의 `debugLogs` 조회는 현재 보안 규칙에 의해 제한되어 관리자 화면의 오류 수가 `--`로 표시될 수 있습니다.
- 관리자 비밀번호는 정적 웹사이트의 간단한 화면 잠금 기능입니다. 정식 서비스 전에는 Firebase Authentication 기반 관리자 인증을 추가하는 것을 권장합니다.
