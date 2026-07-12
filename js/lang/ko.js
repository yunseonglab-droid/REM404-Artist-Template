// js/lang/ko.js
import { siteConfig } from "../site-config.js";

const { brand, version, artist } = siteConfig;

export default {
  status: {
    alignPhoto: "사진을 사각형 안에 맞춰주세요.",
    alignPhotoSub: "사진 전체가 사각형 안에<br>들어오도록 맞춰주세요.",
    avoidGlare: "사진을 사각형 안에 맞춰주세요.",
    avoidGlareSub: "빛 반사를 피해 다시 맞춰주세요.",
    targetLost: "전시 사진을 다시 비춰주세요.",
    targetLostSub: "사진 전체가 사각형 안에 들어오도록<br>거리와 빛 반사를 조정해보세요.",
    memoryFound: "기억을 찾았습니다.",
    memoryFoundSub: "잠시 후 기억을 복원합니다.",
    memoryRestored: "기억이 복원되었습니다.",
    memoryRestoredSub: "이 공간이 떠올리게 한 기억을 남겨보세요.",
    searchingMemory: "기억을 찾는 중..."
  },

  buttons: {
    leaveMemory: "기억 남기기",
    submitMemory: "기억 남기기",
    viewMemory: "다른 기억 보기",
    nextMemory: "새로운 기억 만나기",
    loadingMemory: "기억을 불러오는 중...",
    savingMemory: "기억을 저장하는 중...",
    rescanSpace: "새로운 공간 인식하기"
  },

  archive: {
    loadFailed: "기억을 불러오지 못했습니다.",
    saveFailed: "기억을 저장하지 못했습니다. 다시 시도해주세요.",
    systemLoadFailed: "기억 저장 기능을 불러오지 못했습니다. 다시 시도해주세요.",
    allReadTitle: "모든 기억을 읽었습니다.",
    allReadSub: "새로운 기억이 추가되면 다시 찾아와 주세요."
  },
  
  landing: {
  pageTitle: artist.artworkTitle,
  version: `${brand} ${version}`,
  title: artist.artworkTitle.replace(/\s*\/\s*.*/, ""),
  text: "이 작품을 카메라로 비추면,<br>작가가 준비한 또 다른 장면이 천천히 나타납니다.<br><br>감상 후 떠오른 기억이나 생각을<br>익명으로 남겨주세요.",
  notice: "이 경험은 스마트폰 카메라를 사용합니다.<br>별도의 앱 설치는 필요하지 않습니다.",
  startButton: "작품 경험 시작하기",
  loading: "작품에 접근하는 중..."
  },
  
  archiveScreen: {
  loadingText: "기억을 불러오는 중",
  archiveLabel: brand,
  formTitle: "당신의 기억",
  formQuestion: "이 공간은 당신에게 무엇을 떠올리게 했나요?",
  inputPlaceholder: "80자 이내로 남겨주세요.",
  completeTitle: "감사합니다.",
  completeText: `당신의 기억이<br>${brand}에 저장되었습니다.`,
  countLabel: "현재까지",
  countDesc: "개의 기억이<br>이곳에 남아 있습니다.",
  viewMemoryHint: "다른 사람이 남긴 익명의 기억을 읽어보세요.",
  viewerLabel: "ANONYMOUS MEMORY",
  viewerHint: "누군가가 이 공간에 남긴 기억입니다."
},
  prepare: {
  title: "기억 복원 준비 중",

  ready: "기억 스캐너 준비 완료.",
  requesting: "카메라 권한을 요청하는 중...",
  failed: "카메라를 열 수 없습니다. 다시 시도해주세요.",

  startButton: "카메라 시작하기",

  messages: [
    "기억 저장소에 접근하는 중...",
    "공간의 흔적을 불러오는 중...",
    "기억 스캐너를 초기화하는 중...",
    "이미지 인식 시스템 준비 중...",
    `${brand}와 연결하는 중...`
  ]
},
};
