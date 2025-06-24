# 맘풍선 (Mampungsun)

'맘풍선'은 학생들의 마음 건강을 위한 감정 일기 및 소셜 응원 플랫폼입니다. 이 프로젝트는 Firebase Studio를 통해 Next.js, Genkit, ShadCN UI를 사용하여 제작되었습니다.

---

## 🚀 배포 가이드 (Firebase App Hosting)

이 가이드는 GitHub과 연동된 Firebase 앱 호스팅을 사용하여 애플리케이션을 배포하는 과정을 안내합니다.

### Step 1: Firebase 프로젝트 및 환경 변수 설정

1.  **Firebase 프로젝트 생성**: 아직 없다면 [Firebase 콘솔](https://console.firebase.google.com/)에서 새 프로젝트를 만드세요.
2.  **웹 앱 등록 및 키 확인**:
    *   프로젝트 설정(⚙️) > 일반 탭으로 이동합니다.
    *   '내 앱' 섹션에서 웹 앱을 등록하고, Firebase SDK 스니펫에서 `firebaseConfig` 객체 값을 확인합니다.
3.  **`.env.local` 파일 생성**:
    *   프로젝트 최상위 경로에 `.env.local` 파일을 새로 만듭니다.
    *   아래 내용을 복사하여 붙여넣고, `your-firebase-config-value` 부분을 2단계에서 확인한 실제 값으로 교체합니다. 이 파일은 `.gitignore`에 의해 GitHub에 올라가지 않으므로 안전합니다.

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
    ```

### Step 2: GitHub과 앱 호스팅 연동

1.  **앱 호스팅 대시보드로 이동**: Firebase 콘솔에서 **빌드 > 앱 호스팅** 메뉴로 이동합니다.
2.  **GitHub 저장소 연결**: '시작하기'를 누르고 화면 안내에 따라 GitHub 계정을 인증한 후, 이 프로젝트의 저장소를 선택합니다.
3.  **백엔드 설정**: 배포할 브랜치(예: `main`)를 선택하고, 앱의 루트 디렉토리는 `/`로 둡니다.
4.  **자동 배포**: 설정이 완료되면 Firebase가 첫 배포를 시작합니다. 이제부터 설정된 브랜치에 코드를 푸시할 때마다 자동으로 새 버전이 배포됩니다.

### 다음 단계: Mock 데이터에서 Firestore로 전환하기

현재 이 앱은 임시 데이터를 사용합니다. 실제 서비스를 위해서는 **Firestore** 데이터베이스를 사용해야 합니다.

1.  **Firestore 활성화**: Firebase 콘솔의 **빌드 > Firestore Database**에서 데이터베이스를 생성합니다.
2.  **코드 수정**: `src/lib/data.ts` 와 `localStorage`를 사용하는 로직을 찾아 Firestore에서 데이터를 읽고 쓰는 코드로 교체하는 작업이 필요합니다.
