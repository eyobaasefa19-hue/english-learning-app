(() => {
"use strict";
const $=id=>document.getElementById(id);
const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v??fallback}catch(_){return fallback}};
const count=(key)=>Array.isArray(read(key,[]))?read(key,[]).length:0;
const setText=(id,value)=>{const el=$(id);if(el)el.textContent=String(value)};
const setBar=(id,value,max)=>{const el=$(id);if(el)el.style.width=`${Math.max(0,Math.min(100,max?value/max*100:0))}%`};
const localDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
function streak(days){
 const set=new Set(days),today=new Date(),key=localDate(today);
 let cursor=new Date(today); if(!set.has(key))cursor.setDate(cursor.getDate()-1);
 let n=0;while(set.has(localDate(cursor))&&n<365){n++;cursor.setDate(cursor.getDate()-1)}return n;
}
function render(){
 const activity=read("eyoblingua_activity_days_v3",[]);
 const completed=read("eyoblingua_completed_lessons_v2",[]);
 const grammar=read("eyoblingua_grammar_completed_v16",[]);
 const learned=read("eyoblingua_dictionary_learned_v1",[]);
 const saved=read("eyoblingua_dictionary_saved_v1",[]);
 const history=read("eyoblingua_quiz_history_v1",[]);
 const validHistory=Array.isArray(history)?history.filter(x=>x&&Number.isFinite(Number(x.percent))):[];
 setText("dash-streak",streak(activity));setText("dash-active-days",activity.length);
 setText("dash-quiz-count",validHistory.length);setText("dash-learned-words",learned.length);
 setText("dash-lesson-label",`${completed.length} / 82`);setBar("dash-lesson-bar",completed.length,82);
 setText("dash-grammar-label",`${grammar.length} / 33`);setBar("dash-grammar-bar",grammar.length,33);
 setText("dash-vocab-label",learned.length);setBar("dash-vocab-bar",learned.length,90);
 setText("dash-saved-label",saved.length);
 const week=$("dash-week");
 if(week){const today=new Date(),days=[];for(let i=6;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);const key=localDate(d);days.push({key,label:["እሑድ","ሰኞ","ማክሰኞ","ረቡዕ","ሐሙስ","ዓርብ","ቅዳሜ"][d.getDay()],active:activity.includes(key)})}
 week.innerHTML=days.map(x=>`<div class="week-day"><div class="week-bar-wrap"><span class="week-bar ${x.active?"is-active":""}" style="height:${x.active?100:12}%"></span></div><small>${x.label}</small></div>`).join("")}
 const hist=$("dash-quiz-history");
 if(hist){if(!validHistory.length)hist.innerHTML='<p class="dashboard-empty">ገና የፈተና ውጤት የለም። ፈተና ከወሰድክ በኋላ እዚህ ይታያል።</p>';else hist.innerHTML=validHistory.slice(0,5).map(x=>{const date=new Date(x.date);const label=Number.isNaN(date.getTime())?"ቀን አልታወቀም":date.toLocaleDateString("am-ET",{year:"numeric",month:"short",day:"numeric"});return `<div class="quiz-history-row"><span>${label}</span><b>${Number(x.percent)}%</b><small>${Number(x.score)||0} / ${Number(x.total)||0}</small></div>`}).join("")}
}
$("refresh-dashboard")?.addEventListener("click",render);
render();
})();