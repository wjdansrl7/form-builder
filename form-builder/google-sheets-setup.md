# Google Sheets 연동 설정 가이드

Google Sheets를 사용하여 여러 사람의 설문 응답을 자동으로 수집하고 관리할 수 있습니다.

## 📋 단계별 설정 방법

### 1단계: Google Sheets 생성

1. [Google Sheets](https://sheets.google.com)에 접속
2. 새 스프레드시트 생성
3. 원하는 이름으로 변경 (예: "설문 응답 수집")

### 2단계: Apps Script 설정

1. 상단 메뉴에서 **확장 프로그램** > **Apps Script** 클릭
2. 기존 코드를 모두 삭제
3. 아래의 코드를 복사하여 붙여넣기:

```javascript
function doPost(e) {
  try {
    // 현재 활성 시트 가져오기
    var sheet = SpreadsheetApp.getActiveSheet();
    
    // POST 데이터 파싱
    var data = JSON.parse(e.postData.contents);
    
    // 첫 번째 행에 헤더가 없으면 생성
    if (sheet.getLastRow() === 0) {
      var headers = ['타임스탬프', '폼 제목'];
      
      // 질문 제목을 헤더에 추가
      data.questions.forEach(function(q) {
        headers.push(q.title || '제목 없음');
      });
      
      sheet.appendRow(headers);
    }
    
    // 응답 데이터 준비
    var row = [
      new Date(data.timestamp),
      data.formTitle
    ];
    
    // 각 질문의 응답 추가
    data.questions.forEach(function(q) {
      var answer = data.answers[q.id];
      
      if (q.type === 'sum100') {
        // 합계 100점 질문: "항목1:30, 항목2:40, ..." 형식
        var sum100Text = answer.map(function(item) {
          return item.label + ':' + item.value;
        }).join(', ');
        row.push(sum100Text);
      } else if (Array.isArray(answer)) {
        // 체크박스: 배열을 쉼표로 연결
        row.push(answer.join(', '));
      } else {
        // 단답형, 객관식
        row.push(answer || '');
      }
    });
    
    // 시트에 행 추가
    sheet.appendRow(row);
    
    // 성공 응답
    return ContentService.createTextOutput(JSON.stringify({
      result: 'success',
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // 오류 응답
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. 파일 이름을 "FormSubmission"으로 변경 (선택사항)
5. **저장** 버튼 클릭 (💾 아이콘)

### 3단계: 웹 앱으로 배포

1. Apps Script 에디터 상단에서 **배포** > **새 배포** 클릭
2. 설정:
   - **유형 선택**: "웹 앱" 선택
   - **설명**: "설문 응답 수집" (선택사항)
   - **다음 사용자로 실행**: "나"
   - **액세스 권한**: "**모든 사용자**" 선택 ⚠️ 중요!
3. **배포** 버튼 클릭
4. 권한 승인:
   - "액세스 권한 부여" 클릭
   - Google 계정 선택
   - "고급" 클릭 > "프로젝트명(안전하지 않음)으로 이동" 클릭
   - "허용" 클릭

### 4단계: 웹 앱 URL 복사

1. 배포 완료 후 **웹 앱 URL**이 표시됩니다
2. URL 복사 (형식: `https://script.google.com/macros/s/...`)
3. "완료" 클릭

### 5단계: 폼 빌더에 URL 설정

1. 폼 빌더로 돌아가기
2. 상단 **⚙️ 설정** 버튼 클릭
3. 복사한 URL을 입력란에 붙여넣기
4. **저장** 버튼 클릭

## ✅ 테스트하기

1. 폼 빌더에서 **미리보기** 클릭
2. 설문 작성 후 **제출하기**
3. Google Sheets로 이동하여 응답이 추가되었는지 확인

## 📊 응답 확인

- Google Sheets를 열면 각 행에 제출된 응답이 표시됩니다
- 타임스탬프, 폼 제목, 각 질문별 응답이 열로 구성됩니다
- 합계 100점 질문은 "항목:점수" 형식으로 저장됩니다

## 🔧 재배포 (코드 수정 시)

코드를 수정한 경우:
1. Apps Script에서 **배포** > **배포 관리** 클릭
2. 활성 배포 옆의 연필 아이콘 클릭
3. **버전**: "새 버전" 선택
4. **배포** 클릭
5. URL은 동일하게 유지됩니다 (폼 빌더 설정 변경 불필요)

## ⚠️ 주의사항

- **모든 사용자**로 액세스 권한을 설정해야 합니다 (본인만 선택 시 작동하지 않음)
- URL은 안전하게 보관하세요 (누구나 이 URL로 데이터를 전송할 수 있습니다)
- 스프레드시트를 다른 사람과 공유하려면 Google Sheets의 공유 설정을 사용하세요

## 🔧 문제 해결

### "다음 스크립트 함수(doGet)를 찾을 수 없습니다" 오류

이 오류가 발생하면 Apps Script 코드에 `doGet` 함수가 없는 것입니다.

**해결 방법**:
1. Apps Script 에디터로 돌아가기
2. [apps-script-template.gs](file:///C:/Users/HQN/.gemini/antigravity/scratch/form-builder/apps-script-template.gs) 파일의 **전체 코드**를 다시 복사
3. 기존 코드를 모두 삭제하고 새로 붙여넣기
4. 저장 후 다시 배포

최신 템플릿에는 `doGet` 함수가 포함되어 있습니다.

### 배포 후에도 데이터가 저장되지 않는 경우

1. **액세스 권한 확인**: "모든 사용자"로 설정했는지 확인
2. **URL 확인**: 웹 앱 URL이 올바르게 복사되었는지 확인
3. **브라우저 콘솔 확인**: F12 > Console 탭에서 오류 메시지 확인
4. **Apps Script 로그**: Apps Script 에디터 > 실행 > 실행 로그 확인

## 💡 팁

- **데이터 분석**: Google Sheets의 차트 기능으로 응답을 시각화할 수 있습니다
- **자동 정리**: Apps Script로 응답을 자동으로 정리하거나 다른 시트로 복사할 수 있습니다
- **알림 설정**: 새 응답이 제출될 때 이메일 알림을 받을 수 있습니다

---

문제가 발생하면 Apps Script 에디터에서 **실행** > **실행 로그**를 확인하세요!
