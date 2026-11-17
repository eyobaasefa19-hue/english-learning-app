(() => {
"use strict";
const cfg = window.EYOBLINGUA_SUPABASE || {};
const $ = id => document.getElementById(id);
const status = message => { const el=$("cloud-status"); if(el) el.textContent=message; };
const sayError = error => {
  const msg = error && error.message ? error.message : String(error || "Unknown error");
  status("⚠️ " + msg);
};
let client=null, user=null, syncing=false;
const META_KEY="eyoblingua_cloud_sync_meta_v1";
const DATA_TABLE="user_learning_data";
const DATA_ID="main";
const safeParse=(v,fallback)=>{try{return v?JSON.parse(v):fallback}catch(_){return fallback}};
function localSnapshot(){
  const data={};
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(key && key.startsWith("eyoblingua_")) data[key]=localStorage.getItem(key);
  }
  return data;
}
function applySnapshot(data){
  if(!data || typeof data!=="object" || Array.isArray(data)) return;
  Object.entries(data).forEach(([key,value])=>{
    if(key.startsWith("eyoblingua_") && typeof value==="string"){
      try{localStorage.setItem(key,value)}catch(_){}
    }
  });
  try{localStorage.setItem(META_KEY,JSON.stringify({lastLocalChange:Date.now(),lastSynced:Date.now()}))}catch(_){}
}
function localMeta(){return safeParse(localStorage.getItem(META_KEY),{});}
function markLocalChange(){
  try{localStorage.setItem(META_KEY,JSON.stringify({...localMeta(),lastLocalChange:Date.now(),pending:true}))}catch(_){}
}
function updateSessionUI(){
  const form=$("cloud-account-form"), session=$("cloud-session"), warning=$("cloud-config-warning");
  if(form) form.hidden=!!user;
  if(session) session.hidden=!user;
  if(warning) warning.hidden=!!client;
  if(user && $("cloud-user-label")) $("cloud-user-label").textContent="የገባህበት Email፦ "+user.email;
}
async function loadSdk(){
  if(window.supabase?.createClient) return true;
  if(!navigator.onLine) return false;
  return new Promise(resolve=>{
    const script=document.createElement("script");
    script.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload=()=>resolve(!!window.supabase?.createClient);
    script.onerror=()=>resolve(false);
    document.head.appendChild(script);
  });
}
async function init(){
  if(!cfg.url || !cfg.anonKey){
    updateSessionUI(); status("Local/Offline ሁነታ ዝግጁ ነው። Supabase ገና አልተዋቀረም።");
    return;
  }
  if(!await loadSdk()){status("ኢንተርኔት የለም፤ Local/Offline ሁነታ እየሰራ ነው።");return;}
  try{
    client=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    const {data,error}=await client.auth.getSession(); if(error) throw error;
    user=data.session?.user||null; updateSessionUI();
    if(user){status("Cloud ተገናኝቷል። Sync እየተደረገ ነው…"); await syncData();}
    else status("Supabase ዝግጁ ነው። ግባ ወይም አዲስ መለያ ፍጠር።");
    client.auth.onAuthStateChange((_event,session)=>{
      user=session?.user||null; updateSessionUI();
      if(user) setTimeout(()=>syncData(),0);
      else status("ከመለያው ወጥተሃል።");
    });
  }catch(error){sayError(error);}
}
async function signUp(){
  if(!client){status("መጀመሪያ Supabase URL እና key አስገባ።");return;}
  const email=$("cloud-email")?.value.trim(), password=$("cloud-password")?.value;
  if(!email || !password || password.length<8){status("ትክክለኛ Email እና ቢያንስ 8 ቁምፊ Password አስገባ።");return;}
  try{status("መለያ እየተፈጠረ ነው…");const {data,error}=await client.auth.signUp({email,password});if(error)throw error;
    user=data.session?.user||null;updateSessionUI();
    status(user?"መለያ ተፈጥሯል።":"የማረጋገጫ Email ተልኳል፤ Emailህን አረጋግጥ።");
    if(user) await syncData();
  }catch(error){sayError(error);}
}
async function signIn(){
  if(!client){status("መጀመሪያ Supabase URL እና key አስገባ።");return;}
  const email=$("cloud-email")?.value.trim(), password=$("cloud-password")?.value;
  if(!email||!password){status("Email እና Password አስገባ።");return;}
  try{status("በመለያህ እየገባህ ነው…");const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;user=data.user;updateSessionUI();await syncData();}
  catch(error){sayError(error);}
}
async function resetPassword(){
  if(!client){status("Supabase ገና አልተዋቀረም።");return;}
  const email=$("cloud-email")?.value.trim();if(!email){status("የEmail አድራሻህን መጀመሪያ አስገባ።");return;}
  try{const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(error)throw error;status("የPassword መቀየሪያ መመሪያ ወደ Emailህ ተልኳል።");}
  catch(error){sayError(error);}
}
async function syncData(){
  if(!client||!user||syncing)return;
  if(!navigator.onLine){status("Offline ነህ። መረጃው በስልክህ ተጠብቋል፤ ኢንተርኔት ሲመለስ Sync ይሞከራል።");return;}
  syncing=true;
  try{
    const {data:remote,error:readError}=await client.from(DATA_TABLE).select("data,updated_at").eq("user_id",user.id).eq("id",DATA_ID).maybeSingle();
    if(readError)throw readError;
    const meta=localMeta(), local=localSnapshot();
    if(!remote){
      const {error}=await client.from(DATA_TABLE).upsert({user_id:user.id,id:DATA_ID,data:local,updated_at:new Date().toISOString()},{onConflict:"user_id,id"});if(error)throw error;
    }else{
      const localChanged=Number(meta.lastLocalChange||0);
      const remoteChanged=Date.parse(remote.updated_at||"")||0;
      if(localChanged>remoteChanged || meta.pending || (!meta.lastSynced && Object.keys(local).length>0)){
        const {error}=await client.from(DATA_TABLE).upsert({user_id:user.id,id:DATA_ID,data:local,updated_at:new Date().toISOString()},{onConflict:"user_id,id"});if(error)throw error;
      }else if(remote.data){applySnapshot(remote.data);}
    }
    localStorage.setItem(META_KEY,JSON.stringify({lastLocalChange:Math.max(Number(meta.lastLocalChange||0),Date.now()),lastSynced:Date.now(),pending:false}));
    status("✅ Cloud Sync ተሳክቷል። መረጃህ ተመሳስሏል።");
    window.dispatchEvent(new CustomEvent("eyoblingua:cloud-sync-complete"));
  }catch(error){sayError(error);}
  finally{syncing=false;}
}
async function signOut(){
  if(!client)return;
  try{const {error}=await client.auth.signOut();if(error)throw error;user=null;updateSessionUI();status("ከመለያው ወጥተሃል። የአካባቢ መረጃህ አልተሰረዘም።");}
  catch(error){sayError(error);}
}
$("cloud-signup")?.addEventListener("click",signUp);
$("cloud-signin")?.addEventListener("click",signIn);
$("cloud-reset-password")?.addEventListener("click",resetPassword);
$("cloud-sync")?.addEventListener("click",syncData);
$("cloud-signout")?.addEventListener("click",signOut);
window.addEventListener("online",()=>{if(user)syncData();});
window.addEventListener("storage",event=>{if(event.key?.startsWith("eyoblingua_") && event.key!==META_KEY){markLocalChange();if(user&&navigator.onLine)syncData();}});
document.addEventListener("change",event=>{
  if(event.target && (event.target.matches("input,select,textarea"))) {markLocalChange();}
});
const originalSetItem=Storage.prototype.setItem;
Storage.prototype.setItem=function(key,value){originalSetItem.call(this,key,value);if(typeof key==="string"&&key.startsWith("eyoblingua_")&&key!==META_KEY)markLocalChange();};
const originalRemoveItem=Storage.prototype.removeItem;
Storage.prototype.removeItem=function(key){originalRemoveItem.call(this,key);if(typeof key==="string"&&key.startsWith("eyoblingua_")&&key!==META_KEY)markLocalChange();};
init();
})();