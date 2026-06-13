/**
 * Google Apps Script backend för VM-tipset.
 *
 * Setup:
 * 1) Skapa ett Google Sheet.
 * 2) Extensions > Apps Script.
 * 3) Klistra in denna fil.
 * 4) Ändra SPREADSHEET_ID nedan.
 * 5) Deploy > New deployment > Web app.
 *    Execute as: Me
 *    Who has access: Anyone with the link
 * 6) Klistra in Web App URL i API_URL i app.js.
 *
 * Resultat-API:
 * - Manuell resultatadmin fungerar direkt.
 * - För automatisk hämtning: lägg en endpoint i Script Properties:
 *   RESULT_API_URL = https://din-endpoint.se/results
 *   Den ska returnera JSON: [{id, home_score, away_score, status}]
 */
const SPREADSHEET_ID = 'KListra_in_ditt_Google_Sheet_ID_här';

function doPost(e) {
  const body = JSON.parse(e.postData.contents || '{}');
  if (body.action === 'saveAll') return json(saveAll(body.payload || {}));
  if (body.action === 'getAll') return json(getAll());
  if (body.action === 'fetchResults') return json(fetchResultsFromProvider());
  return json({ ok:false, error:'Unknown action: ' + body.action });
}
function doGet() { return json(getAll()); }
function json(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function ss(){ return SpreadsheetApp.openById(SPREADSHEET_ID); }
function sheet(name, headers){ const s=ss().getSheetByName(name) || ss().insertSheet(name); if(s.getLastRow()===0) s.appendRow(headers); return s; }
function write(name, headers, rows){ const s=sheet(name,headers); s.clear(); s.appendRow(headers); if(rows.length) s.getRange(2,1,rows.length,headers.length).setValues(rows); }
function read(name){ const s=ss().getSheetByName(name); if(!s || s.getLastRow()<2) return []; const values=s.getDataRange().getValues(); const headers=values.shift(); return values.map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]]))); }

function saveAll(data){
  write('Players',['player_id','name','email','created_at'], (data.players||[]).map(p=>[p.id,p.name,p.email,p.created_at]));
  write('Predictions',['player_id','match_id','tip_1x2','pred_home','pred_away','submitted_at'], (data.predictions||[]).map(p=>[p.player_id,p.match_id,p.tip_1x2,p.pred_home,p.pred_away,p.submitted_at]));
  write('Bonus',['player_id','finalist1','finalist2','topScorer'], (data.bonus||[]).map(b=>[b.player_id,b.finalist1,b.finalist2,b.topScorer]));
  const results = data.results || {};
  write('Results',['match_id','home_score','away_score','status'], Object.keys(results).map(id=>[id,results[id].home_score,results[id].away_score,results[id].status]));
  const a=data.actualBonus||{};
  write('ActualBonus',['finalist1','finalist2','topScorer'], [[a.finalist1||'',a.finalist2||'',a.topScorer||'']]);
  writeScoreboard_(data);
  return {ok:true};
}

function getAll(){
  const players = read('Players').map(p=>({id:String(p.player_id), name:p.name, email:p.email, created_at:p.created_at}));
  const predictions = read('Predictions').map(p=>({player_id:String(p.player_id), match_id:String(p.match_id), tip_1x2:p.tip_1x2, pred_home:p.pred_home, pred_away:p.pred_away, submitted_at:p.submitted_at}));
  const bonus = read('Bonus').map(b=>({player_id:String(b.player_id), finalist1:b.finalist1, finalist2:b.finalist2, topScorer:b.topScorer}));
  const results = {};
  read('Results').forEach(r=>{ results[String(r.match_id)] = {home_score:r.home_score, away_score:r.away_score, status:r.status}; });
  const actual = read('ActualBonus')[0] || {};
  return {ok:true, players, predictions, bonus, results, actualBonus:{finalist1:actual.finalist1||'', finalist2:actual.finalist2||'', topScorer:actual.topScorer||''}};
}

function fetchResultsFromProvider(){
  const url = PropertiesService.getScriptProperties().getProperty('RESULT_API_URL');
  if(!url) return {ok:false, error:'RESULT_API_URL saknas i Script Properties. Använd manuell admin eller lägg in en API-endpoint.'};
  const res = UrlFetchApp.fetch(url, {muteHttpExceptions:true});
  const data = JSON.parse(res.getContentText());
  const rows = Array.isArray(data) ? data : (data.results || []);
  const current = getAll();
  rows.forEach(x=>{
    const id = String(x.id || x.match_id || x.game_id || '');
    if(!id) return;
    const hs = x.home_score ?? x.homeScore ?? x.score_home;
    const as = x.away_score ?? x.awayScore ?? x.score_away;
    if(hs !== null && hs !== undefined && as !== null && as !== undefined){
      current.results[id] = {home_score:hs, away_score:as, status:x.status || 'Complete'};
    }
  });
  saveAll(current);
  return {ok:true, results: rows};
}

function writeScoreboard_(data){
  // Poäng beräknas främst i frontend. Den här fliken gör bara datan lättare att se.
  const players = data.players || [];
  write('Scoreboard',['player_id','name','note'], players.map(p=>[p.id,p.name,'Poäng visas i webappen. Kör uppdatering där.']));
}
