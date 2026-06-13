// VM-tipset 2026
// Google Sheets: publicera apps-script.gs som Web App och klistra in URL här.
const API_URL = "https://script.google.com/macros/s/AKfycbw8hIRx5YANF3QzZBmwXbcmX_KyGI22y3LGJtPJ7CLCsQDVjBUtdddSA1Bratl6cPOg/exec";

// Resultat-API: om du har en API-endpoint som returnerar JSON kan du klistra in den här.
// Förväntat format: [{id:"66456904", home_score:2, away_score:0, status:"Complete"}, ...]
// Alternativt låter du Apps Script hämta resultat via funktionen fetchResultsFromProvider().
const RESULT_API_URL = "";

const MATCHES = [
  ['66456904','2026-06-11 21:00','A','Mexico','South Africa'],['66456906','2026-06-12 04:00','A','South Korea','Czechia'],
  ['66456916','2026-06-12 21:00','B','Canada','Bosnia and Herzegovina'],['66456940','2026-06-13 03:00','D','United States','Paraguay'],
  ['66456918','2026-06-13 21:00','B','Qatar','Switzerland'],['66456928','2026-06-14 00:00','C','Brazil','Morocco'],['66456930','2026-06-14 03:00','C','Haiti','Scotland'],
  ['66456942','2026-06-14 06:00','D','Australia','Turkey'],['66457070','2026-06-14 19:00','E','Germany','Curacao'],['66456968','2026-06-14 22:00','F','Netherlands','Japan'],['66457072','2026-06-15 01:00','E','Ivory Coast','Ecuador'],['66456970','2026-06-15 04:00','F','Sweden','Tunisia'],
  ['66456994','2026-06-15 18:00','H','Spain','Cape Verde'],['66456982','2026-06-15 21:00','G','Belgium','Egypt'],['66456996','2026-06-16 00:00','H','Saudi Arabia','Uruguay'],['66456984','2026-06-16 03:00','G','Iran','New Zealand'],
  ['66457006','2026-06-16 21:00','I','France','Senegal'],['66457008','2026-06-17 00:00','I','Iraq','Norway'],['66457018','2026-06-17 03:00','J','Argentina','Algeria'],
  ['66457020','2026-06-17 06:00','J','Austria','Jordan'],['66457030','2026-06-17 19:00','K','Portugal','DR Congo'],['66457042','2026-06-17 22:00','L','England','Croatia'],['66457044','2026-06-18 01:00','L','Ghana','Panama'],['66457032','2026-06-18 04:00','K','Uzbekistan','Colombia'],
  ['66456910','2026-06-18 18:00','A','Czechia','South Africa'],['66456922','2026-06-18 21:00','B','Switzerland','Bosnia and Herzegovina'],['66456920','2026-06-19 00:00','B','Canada','Qatar'],['66456908','2026-06-19 03:00','A','Mexico','South Korea'],
  ['66456944','2026-06-19 21:00','D','United States','Australia'],['66456934','2026-06-20 00:00','C','Scotland','Morocco'],['66456932','2026-06-20 02:30','C','Brazil','Haiti'],['66456946','2026-06-20 05:00','D','Turkey','Paraguay'],
  ['66456972','2026-06-20 19:00','F','Netherlands','Sweden'],['66457074','2026-06-20 22:00','E','Germany','Ivory Coast'],['66457076','2026-06-21 02:00','E','Ecuador','Curacao'],['66456974','2026-06-21 06:00','F','Tunisia','Japan'],
  ['66456998','2026-06-21 18:00','H','Spain','Saudi Arabia'],['66456986','2026-06-21 21:00','G','Belgium','Iran'],['66457000','2026-06-22 00:00','H','Uruguay','Cape Verde'],['66456988','2026-06-22 03:00','G','New Zealand','Egypt'],
  ['66457022','2026-06-22 19:00','J','Argentina','Austria'],['66457010','2026-06-22 23:00','I','France','Iraq'],['66457012','2026-06-23 02:00','I','Norway','Senegal'],['66457024','2026-06-23 05:00','J','Jordan','Algeria'],
  ['66457034','2026-06-23 19:00','K','Portugal','Uzbekistan'],['66457046','2026-06-23 22:00','L','England','Ghana'],['66457048','2026-06-24 01:00','L','Panama','Croatia'],['66457036','2026-06-24 04:00','K','Colombia','DR Congo'],
  ['66456924','2026-06-24 21:00','B','Switzerland','Canada'],['66456926','2026-06-24 21:00','B','Bosnia and Herzegovina','Qatar'],['66456936','2026-06-25 00:00','C','Scotland','Brazil'],['66456938','2026-06-25 00:00','C','Morocco','Haiti'],['66456912','2026-06-25 03:00','A','Czechia','Mexico'],['66456914','2026-06-25 03:00','A','South Africa','South Korea'],
  ['66457078','2026-06-25 22:00','E','Ecuador','Germany'],['66457080','2026-06-25 22:00','E','Curacao','Ivory Coast'],['66456976','2026-06-26 01:00','F','Tunisia','Netherlands'],['66456978','2026-06-26 01:00','F','Japan','Sweden'],['66456948','2026-06-26 04:00','D','Turkey','United States'],['66456950','2026-06-26 04:00','D','Paraguay','Australia'],
  ['66457014','2026-06-26 21:00','I','Norway','France'],['66457016','2026-06-26 21:00','I','Senegal','Iraq'],['66457002','2026-06-27 02:00','H','Uruguay','Spain'],['66457004','2026-06-27 02:00','H','Cape Verde','Saudi Arabia'],['66456990','2026-06-27 05:00','G','New Zealand','Belgium'],['66456992','2026-06-27 05:00','G','Egypt','Iran'],
  ['66457050','2026-06-27 23:00','L','Panama','England'],['66457052','2026-06-27 23:00','L','Croatia','Ghana'],['66457038','2026-06-28 01:30','K','Colombia','Portugal'],['66457040','2026-06-28 01:30','K','DR Congo','Uzbekistan'],['66457026','2026-06-28 04:00','J','Jordan','Argentina'],['66457028','2026-06-28 04:00','J','Algeria','Austria']
].map(([id,date,group,home,away])=>({id,date,group,home,away}));


const $ = s => document.querySelector(s);
const store = { get:k=>JSON.parse(localStorage.getItem(k)||'null'), set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)) };
let state = {
  players: store.get('players') || [],
  predictions: store.get('predictions') || [],
  bonus: store.get('bonus') || [],
  results: store.get('results') || {},
  actualBonus: store.get('actualBonus') || {}
};
function saveLocal(){ Object.entries(state).forEach(([k,v])=>store.set(k,v)); }
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2400); }
function playerKey(){ const email=$('#playerEmail').value.trim().toLowerCase(); const name=$('#playerName').value.trim(); return email || name.toLowerCase(); }
function ensurePlayer(){ const name=$('#playerName').value.trim(); if(!name) throw new Error('Skriv ditt namn först.'); const id=playerKey(); const existing=state.players.find(p=>p.id===id); if(existing){ existing.name=name; existing.email=$('#playerEmail').value.trim(); } else state.players.push({id,name,email:$('#playerEmail').value.trim(),created_at:new Date().toISOString()}); return id; }
function outcome(h,a){ if(h===''||a===''||h==null||a==null) return ''; h=Number(h); a=Number(a); return h>a?'1':h<a?'2':'X'; }
function norm(s){ return (s||'').trim().toLowerCase(); }
function apiEnabled(){ return API_URL && API_URL.startsWith('http'); }
async function api(action,payload={}){
  if(!apiEnabled()) return null;
  const res=await fetch(API_URL,{method:'POST',body:JSON.stringify({action,payload}),headers:{'Content-Type':'text/plain'}});
  const data=await res.json();
  if(data && data.ok===false) throw new Error(data.error || 'Fel från backend');
  return data;
}
function mergeCloud(data){
  if(!data) return;
  ['players','predictions','bonus','results','actualBonus'].forEach(k=>{ if(data[k] !== undefined) state[k]=data[k]; });
  saveLocal(); renderAll();
}
async function loadCloud(){
  if(!apiEnabled()){ toast('Ingen Google Sheets-URL är inlagd i app.js'); return; }
  const data=await api('getAll'); mergeCloud(data); toast('Hämtade sparad data');
}
async function saveCloud(){ if(apiEnabled()) await api('saveAll',state); }

function renderMatches(){
  const wrap=$('#matches'); wrap.innerHTML='';
  const byGroup = MATCHES.reduce((a,m)=>((a[m.group]??=[]).push(m),a),{});
  Object.keys(byGroup).sort().forEach(g=>{
    const div=document.createElement('div'); div.className='match-group'; div.innerHTML=`<h3 class="group-heading">Grupp ${g}</h3>`;
    byGroup[g].forEach(m=> div.appendChild(matchRow(m,false)) ); wrap.appendChild(div);
  });
  fillPlayerData();
}
function predictionInputs(prefix,m,vals={}){
  return `<div class="prediction-box">
    <label>Hemma<input data-${prefix}h="${m.id}" type="number" min="0" inputmode="numeric" placeholder="0" value="${vals.home ?? ''}"></label>
    <span class="dash">–</span>
    <label>Borta<input data-${prefix}a="${m.id}" type="number" min="0" inputmode="numeric" placeholder="0" value="${vals.away ?? ''}"></label>
  </div>`;
}
function matchRow(m,admin){
  const r=state.results[m.id]||{}; const div=document.createElement('div'); div.className=admin?'match-row admin-row':'match-row';
  div.innerHTML=`<div><div class="date">${m.date}</div><div class="result-pill">Grupp ${m.group}</div></div><div class="teams">${m.home} – ${m.away}</div>`;
  if(admin){
    div.innerHTML += `${predictionInputs('r',m,{home:r.home_score,away:r.away_score})}<select data-status="${m.id}"><option value="Scheduled" ${r.status!=='Complete'?'selected':''}>Ej spelad</option><option value="Complete" ${r.status==='Complete'?'selected':''}>Spelad</option></select><span class="result-pill">${r.status==='Complete'?'Poäng räknas':'Poäng räknas ej'}</span>`;
  } else {
    div.innerHTML += `<label>1/X/2<select class="tip-select" data-tip="${m.id}"><option value="">Välj</option><option value="1">1 - ${m.home}</option><option value="X">X - oavgjort</option><option value="2">2 - ${m.away}</option></select></label>${predictionInputs('p',m)}<span class="result-pill ${r.status==='Complete'?'played':''}">Resultat: ${r.status==='Complete'?`${r.home_score}–${r.away_score}`:'ej spelad'}</span>`;
  }
  return div;
}
function renderAdmin(){
  const wrap=$('#resultsAdmin'); wrap.innerHTML=''; MATCHES.forEach(m=>wrap.appendChild(matchRow(m,true)));
  $('#actualFinalist1').value=state.actualBonus.finalist1||''; $('#actualFinalist2').value=state.actualBonus.finalist2||''; $('#actualTopScorer').value=state.actualBonus.topScorer||'';
}
function fillPlayerData(){
  const id=playerKey(); if(!id) return;
  document.querySelectorAll('[data-tip]').forEach(x=>x.value=''); document.querySelectorAll('[data-ph],[data-pa]').forEach(x=>x.value='');
  state.predictions.filter(p=>p.player_id===id).forEach(p=>{ const tip=document.querySelector(`[data-tip="${p.match_id}"]`); if(tip) tip.value=p.tip_1x2; const ph=document.querySelector(`[data-ph="${p.match_id}"]`); const pa=document.querySelector(`[data-pa="${p.match_id}"]`); if(ph) ph.value=p.pred_home; if(pa) pa.value=p.pred_away; });
  const b=state.bonus.find(x=>x.player_id===id); if(b){ $('#finalist1').value=b.finalist1||''; $('#finalist2').value=b.finalist2||''; $('#topScorer').value=b.topScorer||''; }
}
function scorePlayer(player){
  let matchPts=0;
  state.predictions.filter(p=>p.player_id===player.id).forEach(p=>{ const r=state.results[p.match_id]; if(!r || r.status!=='Complete') return; if(p.tip_1x2===outcome(r.home_score,r.away_score)) matchPts += 2; if(Number(p.pred_home)===Number(r.home_score) && Number(p.pred_away)===Number(r.away_score)) matchPts += 5; });
  let bonusPts=0; const b=state.bonus.find(x=>x.player_id===player.id);
  if(b){ const finals=[norm(state.actualBonus.finalist1),norm(state.actualBonus.finalist2)].filter(Boolean); if(finals.includes(norm(b.finalist1))) bonusPts += 7; if(norm(b.finalist2)!==norm(b.finalist1) && finals.includes(norm(b.finalist2))) bonusPts += 7; if(norm(b.topScorer) && norm(b.topScorer)===norm(state.actualBonus.topScorer)) bonusPts += 7; }
  return {matchPts,bonusPts,total:matchPts+bonusPts};
}
function renderScoreboard(){
  const body=$('#scoreboardBody'); body.innerHTML=''; const rows=state.players.map(p=>({p,...scorePlayer(p)})).sort((a,b)=>b.total-a.total || b.matchPts-a.matchPts);
  rows.forEach((r,i)=>{ body.innerHTML += `<tr><td>${i+1}</td><td>${r.p.name}</td><td>${r.matchPts}</td><td>${r.bonusPts}</td><td><strong>${r.total}</strong></td></tr>`; });
  if(!rows.length) body.innerHTML='<tr><td colspan="5">Inga spelare ännu.</td></tr>';
}
function renderDataPreview(){ $('#dataPreview').textContent=JSON.stringify(state,null,2); }
function renderAll(){ renderMatches(); renderAdmin(); renderScoreboard(); renderDataPreview(); }

async function fetchResults(){
  try{
    let data=null;
    if(RESULT_API_URL){
      const res=await fetch(RESULT_API_URL); data=await res.json();
    } else if(apiEnabled()) {
      data=await api('fetchResults');
    } else {
      toast('Lägg in API_URL eller RESULT_API_URL först'); return;
    }
    const rows = Array.isArray(data) ? data : (data.results || []);
    let updated=0;
    rows.forEach(x=>{
      const id=String(x.id || x.match_id || x.game_id || '');
      if(!id) return;
      const hs=x.home_score ?? x.homeScore ?? x.score_home;
      const as=x.away_score ?? x.awayScore ?? x.score_away;
      const status=x.status || x.state || (hs!=null && as!=null ? 'Complete':'Scheduled');
      if(hs!=null && as!=null){ state.results[id]={home_score:Number(hs),away_score:Number(as),status:String(status).toLowerCase().includes('complete')||String(status).toLowerCase().includes('finished')?'Complete':status}; updated++; }
    });
    saveLocal(); await saveCloud(); renderAll(); toast(`Hämtade ${updated} resultat`);
  }catch(e){ toast('Kunde inte hämta resultat: '+e.message); }
}

document.querySelectorAll('.tab').forEach(btn=>btn.onclick=()=>{ document.querySelectorAll('.tab,.view').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); $('#'+btn.dataset.view).classList.add('active'); renderAll(); });
$('#savePredictions').onclick=async()=>{ try{ const pid=ensurePlayer(); state.predictions=state.predictions.filter(p=>p.player_id!==pid); MATCHES.forEach(m=>{ const tip=document.querySelector(`[data-tip="${m.id}"]`).value; const ph=document.querySelector(`[data-ph="${m.id}"]`).value; const pa=document.querySelector(`[data-pa="${m.id}"]`).value; if(tip || ph!=='' || pa!=='') state.predictions.push({player_id:pid,match_id:m.id,tip_1x2:tip,pred_home:ph,pred_away:pa,submitted_at:new Date().toISOString()}); }); saveLocal(); await saveCloud(); renderScoreboard(); toast('Tips sparade!'); }catch(e){toast(e.message)} };
$('#saveBonus').onclick=async()=>{ try{ const pid=ensurePlayer(); state.bonus=state.bonus.filter(b=>b.player_id!==pid); state.bonus.push({player_id:pid,finalist1:$('#finalist1').value,finalist2:$('#finalist2').value,topScorer:$('#topScorer').value}); saveLocal(); await saveCloud(); renderScoreboard(); toast('Bonus sparad!'); }catch(e){toast(e.message)} };
$('#saveResults').onclick=async()=>{ MATCHES.forEach(m=>{ const hs=document.querySelector(`[data-rh="${m.id}"]`).value; const as=document.querySelector(`[data-ra="${m.id}"]`).value; const status=document.querySelector(`[data-status="${m.id}"]`).value; state.results[m.id]={home_score:hs,away_score:as,status}; }); saveLocal(); await saveCloud(); renderAll(); toast('Resultat sparade!'); };
$('#saveActualBonus').onclick=async()=>{ state.actualBonus={finalist1:$('#actualFinalist1').value,finalist2:$('#actualFinalist2').value,topScorer:$('#actualTopScorer').value}; saveLocal(); await saveCloud(); renderScoreboard(); toast('Faktisk bonus sparad!'); };
$('#refreshScoreboard').onclick=()=>renderScoreboard();
$('#fetchResults').onclick=fetchResults; $('#fetchResultsAdmin').onclick=fetchResults;
$('#loadCloud').onclick=loadCloud; $('#loadCloudData').onclick=loadCloud;
$('#exportJson').onclick=()=>{ renderDataPreview(); navigator.clipboard?.writeText(JSON.stringify(state,null,2)); toast('Data visas nedan och kopierades om möjligt'); };
$('#clearLocal').onclick=()=>{ if(confirm('Rensa lokal data i denna webbläsare?')){ localStorage.clear(); location.reload(); } };
['#playerName','#playerEmail'].forEach(s=>$(s).addEventListener('change',fillPlayerData));
renderAll();
