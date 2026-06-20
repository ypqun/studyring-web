# 스터디링 (StudyRing)

스터디 그룹을 만들고 초대 링크로 친구를 초대해 함께 학습하는 웹 기반 스터디 관리 플랫폼입니다.

회원가입/로그인, 스터디 생성·수정·삭제, 초대 링크, 목표 관리, 일정 관리, 출석 체크·출석률까지 PRD의 모든 핵심 기능을 담았습니다.

**기술 스택**: React + Vite, React Router, Firebase (Authentication + Firestore), GitHub Pages

---

## 1. 로컬에서 실행하기

```bash
npm install
npm run dev
```

다만 아래 2번 Firebase 설정을 먼저 끝내야 회원가입/로그인이 동작합니다.

---

## 2. Firebase 설정 (필수)

이 프로젝트는 백엔드 서버 없이 Firebase를 데이터베이스 겸 인증 서버로 사용합니다. **본인 명의의 무료 Firebase 프로젝트가 필요**합니다.

### 2-1. 프로젝트 생성
1. [Firebase 콘솔](https://console.firebase.google.com/)에서 Google 계정으로 로그인 후 **프로젝트 추가**
2. 프로젝트 이름 입력 (예: `studyring`) → Google Analytics는 꺼도 무방 → 만들기

### 2-2. 웹 앱 등록 및 설정값 받기
1. 프로젝트 개요 화면에서 `</>` (웹) 아이콘 클릭
2. 앱 닉네임 입력 → "Firebase Hosting 설정"은 체크하지 않음 → 앱 등록
3. 화면에 나오는 `firebaseConfig` 객체를 복사

### 2-3. 코드에 설정값 붙여넣기
`src/lib/firebase.js` 파일을 열어 아래 부분을 본인의 값으로 교체하세요.

```js
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
}
```

### 2-4. Authentication 활성화
1. 콘솔 왼쪽 메뉴 **빌드 > Authentication > 시작하기**
2. **로그인 방법** 탭 → **이메일/비밀번호** 선택 → 사용 설정 → 저장

> 참고: PRD는 "아이디/비밀번호"로 가입하는 방식이라, 내부적으로는 입력한 아이디를 `아이디@studyring.local` 형식의 가짜 이메일로 변환해 Firebase Authentication에 사용합니다. 사용자에게는 항상 "아이디"로만 보입니다.

### 2-5. Firestore Database 생성
1. 콘솔 왼쪽 메뉴 **빌드 > Firestore Database > 데이터베이스 만들기**
2. 위치는 `asia-northeast3 (서울)` 권장
3. 보안 규칙은 일단 **테스트 모드**로 시작 (또는 아래 2-6 진행)

### 2-6. 보안 규칙 적용 (권장)
저장소에 포함된 `firestore.rules` 파일 내용을 그대로 복사해서, 콘솔의 **Firestore Database > 규칙** 탭에 붙여넣고 **게시**하세요. 로그인한 스터디 멤버만 해당 스터디 데이터를 읽고 쓸 수 있도록 제한합니다.

---

## 3. GitHub Pages 배포하기

### 3-1. 저장소 만들기
GitHub에 새 저장소(예: `studyring`)를 만들고, 이 프로젝트 폴더 전체를 푸시합니다.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/내깃헙아이디/studyring.git
git push -u origin main
```

### 3-2. 경로 설정 확인
저장소 이름이 `studyring`이 아니라면 아래 두 곳을 저장소 이름에 맞게 수정해야 합니다.

- `vite.config.js` → `base: '/저장소이름/'`
- `package.json` → `"homepage": "https://내깃헙아이디.github.io/저장소이름"`

### 3-3. GitHub Pages 활성화
1. GitHub 저장소 → **Settings > Pages**
2. **Source**를 **GitHub Actions**로 선택

저장소에 포함된 `.github/workflows/deploy.yml`이 `main` 브랜치에 푸시될 때마다 자동으로 빌드하고 배포합니다. Actions 탭에서 진행 상황을 볼 수 있고, 완료 후 `https://내깃헙아이디.github.io/저장소이름/` 으로 접속하면 됩니다.

### (참고) 수동 배포하는 방법
GitHub Actions 대신 `gh-pages` 패키지로 직접 배포할 수도 있습니다.

```bash
npm run deploy
```

---

## 4. 폴더 구조

```
src/
  contexts/        # 로그인 상태 관리 (AuthContext)
  lib/              # Firebase 초기화, Firestore CRUD 함수 모음
  components/       # 재사용 컴포넌트 (목표/일정/출석 탭 등)
  pages/            # 라우트별 페이지 (로그인, 대시보드, 스터디 상세, 초대 참여)
firestore.rules      # Firebase 콘솔에 붙여넣을 보안 규칙
.github/workflows/   # GitHub Pages 자동 배포 워크플로우
```

## 5. 핵심 기능 매핑 (PRD 대조)

| PRD 기능 | 구현 위치 |
|---|---|
| 회원가입/로그인/로그아웃 | `pages/AuthPage.jsx`, `contexts/AuthContext.jsx` |
| 스터디 생성/수정/삭제 | `pages/DashboardPage.jsx`, `pages/StudyDetailPage.jsx` |
| 초대 링크 생성/공유/참여 | `lib/studyApi.js`(inviteCode), `pages/JoinPage.jsx` |
| 목표 등록/수정/삭제/완료 | `components/GoalsTab.jsx` |
| 일정 등록/수정/삭제/조회(전체·오늘) | `components/ScheduleTab.jsx` |
| 출석 등록/현황 조회/출석률 계산 | `components/ScheduleTab.jsx`(체크), `components/AttendanceTab.jsx`(현황·통계) |

## 알아두면 좋은 점

- Firestore 무료 등급(Spark 플랜)으로 충분히 운영 가능한 규모의 프로젝트입니다.
- 출석은 "일정"마다 멤버가 직접 출석 버튼을 눌러 체크하는 방식이며, 출석 현황 탭에서 멤버별 출석률이 자동 계산됩니다.
- 초대 링크는 스터디마다 고유한 코드(`/join/:code`)로 발급되며, 같은 멤버가 다시 접속하면 자동으로 "이동하기"로 안내합니다.
