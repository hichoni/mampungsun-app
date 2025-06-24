# 맘풍선 (Mampungsun)

'맘풍선'은 학생들의 마음 건강을 위한 감정 일기 및 소셜 응원 플랫폼입니다. 이 프로젝트는 Firebase Studio를 통해 Next.js, Genkit, ShadCN UI를 사용하여 제작되었습니다.

---

## 🚀 최종 설정 및 배포 가이드 (Firebase App Hosting)

이 가이드는 **앱이 온라인에서 완벽하게 작동하기 위한 필수 설정**과 GitHub 연동을 통한 배포 과정을 안내합니다. 딱 한 번만 설정하면, 이후에는 코드를 push하는 것만으로 모든 것이 자동 처리됩니다.

### **Step 1: Google AI API 키 발급받기**

AI 기능을 사용하려면 Google AI Studio에서 API 키를 발급받아야 합니다. 이미 키가 있다면 이 단계는 건너뛰세요.

1.  [**Google AI Studio**](https://aistudio.google.com/app/apikey)에 방문하여 Google 계정으로 로그인하세요.
2.  **[Create API key in new project]** 버튼을 클릭하여 새 API 키를 발급받으세요.
3.  생성된 API 키(긴 문자열)를 복사해서 안전한 곳에 보관하세요. 이 키는 다른 사람에게 절대 노출되면 안 됩니다.

### **Step 2: 로컬 개발 환경 설정 (`.env.local` 파일)**

사용자님의 컴퓨터에서 앱을 개발하고 테스트할 때 필요한 설정입니다.

1.  프로젝트 최상위 경로에 `.env.local` 이라는 이름의 파일을 생성해주세요.
2.  아래 내용을 복사하여 붙여넣고, **실제 값으로 모두 교체**하세요.
    *   **Google AI API 키**: Step 1에서 발급받은 키를 입력합니다.
    *   **Firebase 설정 값**: Firebase 콘솔의 **프로젝트 설정(⚙️) > 일반** 탭 > '내 앱' 섹션에서 **구성(Config)**을 선택하면 나오는 `firebaseConfig` 객체에서 값을 찾아 복사합니다.

    ```
    # Step 1에서 발급받은 Google AI API 키를 여기에 붙여넣으세요.
    GOOGLE_API_KEY="your-google-api-key"

    # Firebase 콘솔에서 확인한 설정 값을 여기에 각각 붙여넣으세요.
    NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
    ```
**참고**: `.env.local` 파일을 수정한 후에는, 변경사항을 적용하기 위해 **개발 서버를 재시작**해야 합니다.

### **Step 3: 배포된 온라인 앱에 API 키 설정하기 (가장 중요!)**

`.env.local` 파일은 로컬 개발 환경에서만 사용됩니다. Firebase에 배포된 실제 앱에서 AI 기능을 사용하려면, 아래와 같이 API 키를 **보안 비밀(Secret)**로 딱 한 번만 등록해야 합니다.

1.  [**Google Cloud Secret Manager 페이지**](https://console.cloud.google.com/security/secret-manager)로 직접 이동합니다.
    *   만약 프로젝트를 선택하라는 화면이 나오면, 현재 작업 중인 Firebase 프로젝트(`mind-balloon`)를 선택해주세요.

2.  페이지 상단에 있는 **[+ 보안 비밀 만들기]** 버튼을 클릭합니다.

3.  정보를 입력하는 창이 뜨면 아래와 같이 입력합니다.
    *   **이름:** `GOOGLE_API_KEY` 라고 **반드시 똑같이** 입력해야 합니다. (이 이름은 `apphosting.yaml` 파일에 미리 설정되어 있습니다.)
    *   **보안 비밀 값:** Step 1에서 발급받아 `.env.local`에 넣어두었던 **실제 API 키**를 복사해서 붙여넣습니다. (따옴표는 제외하고, `AIza...`로 시작하는 긴 문자열 전체)

4.  다른 설정은 변경할 필요 없이, 페이지 맨 아래의 **[보안 비밀 만들기]** 버튼을 클릭하여 저장을 완료합니다.

**모든 설정이 끝났습니다!** 이제 `git push origin main` 명령어로 코드를 배포하면, AI 기능이 온라인에서 완벽하게 활성화됩니다.

---

### **Appendix: 데이터베이스 청소 가이드 (선택 사항)**
만약 이전에 사용하던 Firestore 데이터가 남아있어 앱이 오작동하는 경우, 아래 방법으로 데이터베이스를 깨끗하게 초기화할 수 있습니다.

1.  Firebase 콘솔에서 **Firestore Database**로 이동합니다.
2.  데이터 목록에 있는 최상위 컬렉션(예: `users`) 옆의 **점 3개(...) 메뉴**를 클릭합니다.
3.  **'컬렉션 삭제'**를 선택하고, 확인 창에 컬렉션 이름을 입력하여 삭제를 완료합니다.
4.  모든 최상위 컬렉션에 대해 이 과정을 반복하여 데이터베이스를 완전히 비웁니다.
5.  이후 교사 페이지의 **'초기 데이터 설정'** 버튼을 사용하면 새 앱에 맞는 샘플 데이터를 손쉽게 채울 수 있습니다.
