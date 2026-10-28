/**
 * Learner Feedback backend (Google Apps Script, bound to a Google Sheet).
 *
 * Setup (once):
 *  1. Create a Google Sheet called "Learner Feedback - TADO, Caesar".
 *  2. Extensions > Apps Script, paste this file, save.
 *  3. Run setup() once from the editor and approve the permissions.
 *     It creates the Responses sheet and a random ADMIN_KEY (see Executions log,
 *     or Project Settings > Script properties). Keep that key private.
 *  4. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 *  5. Copy the web app URL into feedback/config.js (endpoint).
 *
 * The learner form posts {action:'submit'}; the report page posts {action:'list', key}.
 */

const SHEET = 'Responses';
const PROGRAMS = ['UEEIC0013', 'UEEIC0038']; // unit codes, keep in step with programs in config.js
const QIDS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'overall']; // keep in step with config.js
const HEADERS = ['Received (server)', 'Response ID', 'Program', 'Unit', 'Anonymous', 'Name', 'Device ID',
  'Client time', 'Time zone'].concat(QIDS).concat(['Worked well', 'Would change', 'User agent',
  'Payload SHA-256', 'Hash check', 'Signature', 'Payload JSON', 'Status']);
const MAX_BODY = 60000;

function setup() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) sh = ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ADMIN_KEY')) {
    props.setProperty('ADMIN_KEY', Utilities.getUuid().replace(/-/g, '').slice(0, 20));
  }
  Logger.log('ADMIN_KEY: ' + props.getProperty('ADMIN_KEY'));
}

function doGet() {
  return json({ ok: true, service: 'learner-feedback', time: new Date().toISOString() });
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw || raw.length > MAX_BODY) return json({ ok: false, error: 'Request too large or empty.' });
    const body = JSON.parse(raw);
    if (body.action === 'submit') return submit(body);
    if (body.action === 'list') return list(body);
    return json({ ok: false, error: 'Unknown action.' });
  } catch (err) {
    return json({ ok: false, error: 'Server error: ' + err.message });
  }
}

function submit(body) {
  if (body.hp) return json({ ok: true, id: 'ignored', received: new Date().toISOString() }); // honeypot
  const p = JSON.parse(body.payload);
  if (!/^[0-9a-f-]{36}$/i.test(p.id || '')) return json({ ok: false, error: 'Invalid response ID.' });
  if (PROGRAMS.indexOf(p.program) < 0) return json({ ok: false, error: 'Invalid unit code.' });
  if (p.consent !== true) return json({ ok: false, error: 'Consent missing.' });
  const signature = String(body.signature || '');
  if (signature && !/^data:image\/(png|jpeg);base64,/.test(signature)) return json({ ok: false, error: 'Invalid signature.' });

  const serverHash = sha256(body.payload);
  const sigOk = !signature || sha256(signature) === p.signatureSha256;
  const hashCheck = serverHash === body.hash && sigOk ? 'OK' : 'MISMATCH';

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET);
    if (!sh) throw new Error('Run setup() first.');
    // Duplicate protection: offline retries resend the same response ID.
    const found = sh.getRange('B:B').createTextFinder(p.id).matchEntireCell(true).findNext();
    if (found) {
      const prev = sh.getRange(found.getRow(), 1).getValue();
      return json({ ok: true, id: p.id, duplicate: true, received: new Date(prev).toISOString(), hash: serverHash });
    }
    const received = new Date();
    const a = p.answers || {}, c = p.comments || {};
    const row = [received, p.id, p.program, p.unit, p.anonymous ? 'Yes' : 'No', clean(p.name, 80), clean(p.deviceId, 20),
      clean(p.clientTime, 40), clean(p.tz, 60)]
      .concat(QIDS.map(function (q) { return a[q] === undefined ? '' : a[q]; }))
      .concat([clean(c.good, 1500), clean(c.change, 1500), clean(p.ua, 200), serverHash, hashCheck, signature,
        body.payload, 'Active']);
    sh.appendRow(row);
    return json({ ok: true, id: p.id, received: received.toISOString(), hash: serverHash, hashCheck: hashCheck });
  } finally {
    lock.releaseLock();
  }
}

function list(body) {
  const key = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!key || body.key !== key) {
    Utilities.sleep(800); // slows down guessing
    return json({ ok: false, error: 'Wrong admin key.' });
  }
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET);
  const values = sh.getDataRange().getValues();
  const head = values.shift();
  const col = function (name) { return head.indexOf(name); };
  const iRec = col('Received (server)'), iProg = col('Program'), iHash = col('Payload SHA-256'),
    iChk = col('Hash check'), iSig = col('Signature'), iJson = col('Payload JSON'), iStat = col('Status');
  const rows = values
    .filter(function (r) { return r[iJson] && (!body.program || r[iProg] === body.program); })
    .map(function (r) {
      return {
        received: r[iRec] instanceof Date ? r[iRec].toISOString() : String(r[iRec]),
        payload: String(r[iJson]), hash: String(r[iHash]), hashCheck: String(r[iChk]),
        signature: String(r[iSig] || ''), status: String(r[iStat] || 'Active')
      };
    });
  return json({ ok: true, rows: rows, generated: new Date().toISOString() });
}

function sha256(str) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function clean(v, max) {
  let s = String(v == null ? '' : v).slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // stop formula injection in the sheet
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
