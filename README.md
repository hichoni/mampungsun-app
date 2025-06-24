# 맘풍선 (Mampungsun)

'맘풍선'은 학생들의 마음 건강을 위한 감정 일기 및 소셜 응원 플랫폼입니다. 이 프로젝트는 Firebase Studio를 통해 Next.js, Genkit, ShadCN UI를 사용하여 제작되었습니다.

---

## 🚀 필수 설정 및 배포 가이드 (Firebase App Hosting)

이 가이드는 **앱이 정상적으로 작동하기 위한 필수 설정**과 GitHub 연동을 통한 배포 과정을 안내합니다.

### **Step 1: Firebase 프로젝트 설정 (매우 중요!)**

이 앱의 AI 기능과 실시간 데이터베이스 연동을 위해서는 **두 가지 Firebase 기능 활성화**와 **API 키 설정**이 반드시 필요합니다.

#### 1-1. Google AI API 키 발급받기
AI 기능을 사용하려면 Google AI Studio에서 API 키를 발급받아야 합니다.

1.  [**Google AI Studio**](https://aistudio.google.com/app/apikey)에 방문하여 Google 계정으로 로그인하세요.
2.  **[Create API key in new project]** 버튼을 클릭하여 새 API 키를 발급받으세요.
3.  생성된 API 키(긴 문자열)를 복사해두세요. 이 키는 다른 사람에게 노출되면 안 됩니다.

#### 1-2. Firebase Firestore Database 활성화하기
학생들의 데이터(일기, 댓글 등)를 모든 기기에서 실시간으로 동기화하기 위해 Firestore 데이터베이스를 사용합니다.

1.  **Firebase 콘솔**에서 **빌드 > Firestore Database** 메뉴로 이동합니다.
2.  **[데이터베이스 만들기]** 버튼을 클릭합니다.
3.  **프로덕션 모드**에서 시작을 선택하고 [다음]을 누릅니다.
4.  Cloud Firestore 위치를 선택하고(보통 기본값 사용) **[사용 설정]**을 클릭합니다.
5.  (선택 사항) 만약 이전에 사용하던 데이터가 남아있다면, [데이터베이스 청소 가이드](#-데이터베이스-청소-가이드-선택-사항)를 참고하여 깨끗하게 비워주세요.

#### 1-3. Firebase 웹 앱 설정 및 키 확인
Firebase와 앱을 연동하기 위한 설정 정보가 필요합니다.

1.  Firebase 콘솔에서 **프로젝트 설정(⚙️) > 일반** 탭으로 이동합니다.
2.  '내 앱' 섹션에 웹 앱이 없다면 새로 등록합니다. (`</>` 아이콘 클릭)
3.  앱을 선택한 후, **Firebase SDK 스니펫** 섹션에서 **구성(Config)** 라디오 버튼을 선택하면 `firebaseConfig` 객체 값을 확인할 수 있습니다.

#### 1-4. `.env.local` 파일에 모든 키 입력하기 (로컬 개발용)

1.  프로젝트 최상위 경로에 있는 `.env.local` 파일을 열어주세요.
2.  아래 내용을 복사하여 붙여넣고, 위 단계들에서 얻은 실제 값으로 모두 교체하세요. 이 파일은 `.gitignore`에 의해 GitHub에 올라가지 않으므로 안전합니다.

    ```
    # 1-1 단계에서 발급받은 Google AI API 키를 여기에 붙여넣으세요.
    GOOGLE_API_KEY="your-google-api-key"

    # 1-3 단계에서 확인한 Firebase 설정 값을 여기에 각각 붙여넣으세요.
    NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
    ```
**참고**: `.env.local` 파일을 수정한 후에는, 변경사항을 적용하기 위해 **개발 서버를 재시작**해야 합니다.

### **Step 2: 배포된 앱에 API 키 설정하기 (AI 기능 활성화)**

`.env.local` 파일은 로컬 개발 환경에서만 사용됩니다. Firebase에 배포된 실제 앱에서 AI 기능을 사용하려면, 아래와 같이 API 키를 **보안 비밀(Secret)**로 등록해야 합니다.

1.  **Firebase 콘솔**에서 **빌드 > 앱 호스팅** 메뉴로 이동합니다.
2.  GitHub과 연결된 백엔드를 찾아 **관리** 링크를 클릭합니다.
3.  페이지 상단의 **보안 비밀** 탭을 선택합니다.
4.  **[보안 비밀 추가]** 버튼을 클릭합니다.
    *   **보안 비밀 이름**: `GOOGLE_API_KEY` 라고 정확히 입력합니다. (매우 중요!)
    *   **보안 비밀 값**: 1-1 단계에서 발급받은 Google AI API 키를 붙여넣습니다.
5.  **[보안 비밀 추가]** 버튼을 눌러 저장합니다.
6.  **새로 배포하기**: 보안 비밀은 다음 배포부터 적용됩니다. 코드를 `git push`하여 새 배포를 실행하면, AI 기능이 온라인에서 활성화됩니다.

---

### **Appendix: 데이터베이스 청소 가이드 (선택 사항)**
만약 이전에 사용하던 Firestore 데이터가 남아있어 앱이 오작동하는 경우, 아래 방법으로 데이터베이스를 깨끗하게 초기화할 수 있습니다.

1.  Firebase 콘솔에서 **Firestore Database**로 이동합니다.
2.  데이터 목록에 있는 최상위 컬렉션(예: `users`) 옆의 **점 3개(...) 메뉴**를 클릭합니다.
3.  **'컬렉션 삭제'**를 선택하고, 확인 창에 컬렉션 이름을 입력하여 삭제를 완료합니다.
4.  모든 최상위 컬렉션에 대해 이 과정을 반복하여 데이터베이스를 완전히 비웁니다.
5.  이후 교사 페이지의 **'초기 데이터 설정'** 버튼을 사용하면 새 앱에 맞는 샘플 데이터를 손쉽게 채울 수 있습니다.
