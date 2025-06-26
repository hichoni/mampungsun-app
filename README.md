# 맘풍선 (Mampungsun)

---
## ⚠️ 가장 먼저 할 일: 필수 환경 설정

이 설정을 완료하지 않으면 **앱이 절대로 동작하지 않습니다.** 아래 안내에 따라 **`.env.local`** 파일을 설정해주세요.

### **Step 1: Firebase 프로젝트 생성 및 웹 앱 등록**

1.  [Firebase 콘솔](https://console.firebase.google.com/)로 이동하여 새 프로젝트를 만들거나 기존 프로젝트를 선택합니다.
2.  프로젝트 개요(Project Overview) 페이지에서 **`</>` (웹) 아이콘**을 클릭하여 새 웹 앱을 등록합니다.
3.  앱 닉네임을 입력하고 **'앱 등록'** 버튼을 누릅니다. Firebase 호스팅 설정은 나중에 할 수 있으니 건너뛰어도 됩니다.

### **Step 2: Firebase 인증(Authentication) 활성화 (매우 중요)**

로그인 기능을 사용하려면 반드시 익명 인증을 활성화해야 합니다.

1.  Firebase 콘솔의 왼쪽 메뉴에서 **빌드(Build) > Authentication**으로 이동합니다.
2.  **'시작하기(Get started)'** 버튼을 클릭합니다.
3.  **Sign-in method** 탭에서 **'익명(Anonymous)'** 제공업체를 선택합니다.
4.  오른쪽에 나타나는 **'활성화'** 스위치를 켠 후, **'저장'** 버튼을 클릭합니다.

### **Step 3: Firebase 프로젝트 설정 값 확인하기**

1.  왼쪽 메뉴에서 **프로젝트 개요(Project Overview)** 옆의 **설정 아이콘(⚙️)**을 클릭한 후, **프로젝트 설정**을 선택합니다.
2.  **일반** 탭의 하단에 있는 **내 앱** 섹션에서 방금 등록한 웹 앱을 선택합니다.
3.  **SDK 설정 및 구성** 아래에서 **구성(Config)** 옵션을 선택합니다.
4.  아래와 같이 `firebaseConfig` 객체 안에 있는 값들을 확인합니다. 이 값들은 Step 5에서 필요합니다.
    ```javascript
    const firebaseConfig = {
      apiKey: "AIzaSy...-...", // ◀ 이 값
      authDomain: "your-project-id.firebaseapp.com", // ◀ 이 값
      projectId: "your-project-id", // ◀ 이 값
      storageBucket: "your-project-id.appspot.com", // ◀ 이 값
      messagingSenderId: "...", // ◀ 이 값
      appId: "1:...:web:..." // ◀ 이 값
    };
    ```

### **Step 4: Google AI API 키 발급받기**

AI 기능을 사용하려면 Google AI Studio에서 API 키를 발급받아야 합니다.

1.  [**Google AI Studio**](https://aistudio.google.com/app/apikey)에 방문하여 Google 계정으로 로그인하세요.
2.  **[Create API key in new project]** 버튼을 클릭하여 새 API 키를 발급받으세요.
3.  생성된 API 키(`AIza...`로 시작하는 긴 문자열)를 복사해서 안전한 곳에 보관하세요.

### **Step 5: `.env.local` 파일 생성 및 값 붙여넣기**

1.  프로젝트의 가장 바깥쪽(최상위 경로)에 `.env.local` 이라는 이름으로 새 파일을 만듭니다.
2.  아래 내용을 그대로 복사하여 새로 만든 `.env.local` 파일에 붙여넣습니다.
3.  `your-...` 로 표시된 모든 값을 Step 3과 Step 4에서 확인하고 발급받은 **실제 값으로 교체**합니다. **따옴표는 그대로 유지**해야 합니다.

    ```
    # Step 4에서 발급받은 Google AI API 키를 여기에 붙여넣으세요.
    GOOGLE_API_KEY="your-google-api-key"

    # Step 3에서 확인한 Firebase 설정 값을 여기에 각각 붙여넣으세요.
    NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
    ```
4. 파일을 저장한 후, **개발 서버를 재시작**해야 변경사항이 적용됩니다. (터미널에서 `Ctrl + C`로 서버를 끈 후 `npm run dev` 실행)

**이제 로컬 개발 환경에서 앱이 정상적으로 동작합니다!**

---

## 🚀 온라인 배포를 위한 최종 설정 (최초 1회)

로컬 개발이 완료된 후, GitHub에 코드를 올려 온라인에 앱을 배포하려면 아래 설정을 딱 한 번만 해주어야 합니다.

1.  [**Google Cloud Secret Manager 페이지**](https://console.cloud.google.com/security/secret-manager)로 이동합니다.
2.  페이지 상단에 있는 **[+ 보안 비밀 만들기]** 버튼을 클릭합니다.
3.  **이름**에는 `GOOGLE_API_KEY` 라고 **반드시 똑같이** 입력합니다.
4.  **보안 비밀 값**에는 Step 4에서 발급받은 **실제 API 키**를 붙여넣습니다.
5.  **[보안 비밀 만들기]** 버튼을 클릭하여 저장을 완료합니다.

이제 `git push origin main` 명령어로 코드를 배포하면, AI 기능이 온라인에서 완벽하게 활성화됩니다.

---

## 📖 프로젝트 소개

'맘풍선'은 학생들의 마음 건강을 위한 감정 일기 및 소셜 응원 플랫폼입니다. 이 프로젝트는 Firebase Studio를 통해 Next.js, Genkit, ShadCN UI를 사용하여 제작되었습니다.

---
### **Appendix: 데이터베이스 청소 가이드 (선택 사항)**
만약 이전에 사용하던 Firestore 데이터가 남아있어 앱이 오작동하는 경우, 아래 방법으로 데이터베이스를 깨끗하게 초기화할 수 있습니다.

1.  Firebase 콘솔에서 **Firestore Database**로 이동합니다.
2.  데이터 목록에 있는 최상위 컬렉션(예: `users`) 옆의 **점 3개(...) 메뉴**를 클릭합니다.
3.  **'컬렉션 삭제'**를 선택하고, 확인 창에 컬렉션 이름을 입력하여 삭제를 완료합니다.
4.  모든 최상위 컬렉션에 대해 이 과정을 반복하여 데이터베이스를 완전히 비웁니다.
5.  이후 교사 페이지의 **'초기 데이터 설정'** 버튼을 사용하면 새 앱에 맞는 샘플 데이터를 손쉽게 채울 수 있습니다.
