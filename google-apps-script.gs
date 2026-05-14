/**
 * @OnlyCurrentDoc
 */

function doPost(e) {
  try {
    // Access the first sheet safely
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0]; 
    
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (f) {
      // Fallback if data comes in as parameters
      data = e.parameter;
    }
    
    // Validate required fields
    if (!data.name || !data.latitude) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Missing required data'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Append the data: Name, Admission ID, Join, Exit, Lat, Lng, Date
    sheet.appendRow([
      data.name || '',
      data.admissionId || '',
      data.joiningDate || '',
      data.exitDate || '',
      data.latitude || '',
      data.longitude || '',
      new Date().toLocaleString()
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
