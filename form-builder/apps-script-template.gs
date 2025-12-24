/**
 * Google Apps Script for Form Builder
 * 
 * This script receives form submissions via POST requests
 * and automatically adds them as rows to the current spreadsheet.
 * 
 * Setup Instructions:
 * 1. Copy this entire code
 * 2. Open your Google Sheet
 * 3. Go to Extensions > Apps Script
 * 4. Delete existing code and paste this
 * 5. Save the project
 * 6. Deploy as Web App:
 *    - Click Deploy > New deployment
 *    - Select "Web app" as type
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (IMPORTANT!)
 *    - Click Deploy
 * 7. Authorize the script
 * 8. Copy the Web App URL
 * 9. Paste URL in Form Builder Settings
 */

/**
 * Handle GET requests (shows a simple info page)
 * This function is required for web app deployment
 */
function doGet(e) {
  return ContentService.createTextOutput(
    '이 웹 앱은 폼 빌더의 POST 요청만 처리합니다.\n' +
    'Form submissions are handled via POST requests only.'
  ).setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    // Get the active sheet
    var sheet = SpreadsheetApp.getActiveSheet();
    
    // Parse POST data
    var data = JSON.parse(e.postData.contents);
    
    // Create headers if this is the first submission
    if (sheet.getLastRow() === 0) {
      var headers = ['타임스탬프', '폼 제목'];
      
      // Add question titles as headers
      data.questions.forEach(function(q) {
        if (q.type === 'sum100') {
          // For sum100, create multiple headers based on the answer items
          // We look at the first answer to get the labels
          var answerItems = data.answers[q.id];
          if (Array.isArray(answerItems)) {
            answerItems.forEach(function(item) {
              headers.push(q.title + ' [' + item.label + ']');
            });
          } else {
             headers.push(q.title);
          }
        } else {
          headers.push(q.title || '제목 없음');
        }
      });
      
      sheet.appendRow(headers);
      
      // Format header row
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4A90E2');
      headerRange.setFontColor('#FFFFFF');
    }
    
    // Prepare row data
    var row = [
      new Date(data.timestamp),
      data.formTitle
    ];
    
    // Add answers for each question
    data.questions.forEach(function(q) {
      var answer = data.answers[q.id];
      
      if (q.type === 'sum100') {
        // Sum to 100 question: separate into multiple columns
        if (Array.isArray(answer)) {
          answer.forEach(function(item) {
            row.push(item.value); // Add just the number value
          });
        }
      } else if (Array.isArray(answer)) {
        // Checkbox: join array with commas
        row.push(answer.join(', '));
      } else {
        // Short answer, multiple choice
        row.push(answer || '');
      }
    });
    
    // Append row to sheet
    sheet.appendRow(row);
    
    // Auto-resize columns for better visibility
    var lastColumn = sheet.getLastColumn();
    for (var i = 1; i <= lastColumn; i++) {
      sheet.autoResizeColumn(i);
    }
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      result: 'success',
      row: sheet.getLastRow(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      error: error.toString(),
      message: 'Failed to save form submission'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Optional: Test function to verify the script works
 * Run this function from the Apps Script editor to test
 */
function testDoPost() {
  var testData = {
    timestamp: new Date().toISOString(),
    formTitle: '테스트 설문',
    formDescription: '테스트 설명',
    questions: [
      { id: 0, title: '테스트 질문 1', type: 'short' },
      { id: 1, title: '테스트 질문 2', type: 'sum100' }
    ],
    answers: {
      0: '테스트 답변',
      1: [
        { label: '항목 1', value: 25 },
        { label: '항목 2', value: 25 },
        { label: '항목 3', value: 25 },
        { label: '항목 4', value: 25 }
      ]
    }
  };
  
  var e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  var result = doPost(e);
  Logger.log(result.getContent());
}
