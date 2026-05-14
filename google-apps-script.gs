/**
 * Google Apps Script to handle form submissions and save to Google Sheets.
 * 
 * Instructions:
 * 1. Open a Google Sheet.
 * 2. Click on 'Extensions' > 'Apps Script'.
 * 3. Delete any code in the editor and paste this code.
 * 4. Create header row in your sheet: Name, Admission ID, Joining Date, Exit Date, Latitude, Longitude, Timestamp.
 * 5. Click 'Deploy' > 'New deployment'.
 * 6. Select 'Web app'.
 * 7. Set 'Execute as' to 'Me'.
 * 8. Set 'Who has access' to 'Anyone'.
 * 9. Copy the Web App URL and use it in your frontend code for submissions.
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.name || !data.latitude || !data.longitude) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Missing required data'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Append the data
    sheet.appendRow([
      data.name,
      data.admissionId,
      data.joiningDate,
      data.exitDate,
      data.latitude,
      data.longitude,
      new Date()
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Test function to verify script manually
function testScript() {
  const mockData = {
    postData: {
      contents: JSON.stringify({
        name: "Test User",
        admissionId: "TEST-123",
        joiningDate: "2024-01-01",
        exitDate: "2024-12-31",
        latitude: 12.3456,
        longitude: 78.9101
      })
    }
  };
  doPost(mockData);
}
