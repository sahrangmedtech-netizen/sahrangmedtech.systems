const SPREADSHEET_ID = '1Li65TZfIFCv8lCflxrV8lADlMPUQZaZnNCROCCMEszM';
const SHEET_NAME = 'Responses';
const SECRET_TOKEN = 'BIG_SMOKE_FROM_LOS_SANTOS_CJ_CATALINA_IN_THEIR_HUT';

function doGet() {
  return ContentService
    .createTextOutput('OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};

    if ((params._hp || '').trim() !== '') {
      return jsonResponse({ success: false, error: 'spam' });
    }

    if (params.token !== SECRET_TOKEN) {
      return jsonResponse({ success: false, error: 'forbidden' });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet not found: ' + SHEET_NAME);

    const timestampIst = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');

    sheet.appendRow([
      timestampIst,
      params.first_name || '',
      params.last_name || '',
      params.email || '',
      params.phone || '',
      params.city || '',
      params.linkedin_url || '',
      params.portfolio_url || '',
      params.position_display || params.position || '',
      params.employment_type || '',
      params.hear_about || '',
      params.degree || '',
      params.field_of_study || '',
      params.institution || '',
      params.graduation_year || '',
      params.cgpa || '',
      params.experience_years || '',
      params.current_role || '',
      params.current_organisation || '',
      params.skills_technologies || '',
      params.why_sahrang || '',
      params.relevant_project_or_experience || '',
      params.additional_information || '',
      params.earliest_start_date || '',
      params.notice_period || '',
      params.resume_link || ''
    ]);

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
