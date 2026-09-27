import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSession, runAgentTurn } from './lib/agent.mjs';
import { items, searchItems } from './lib/inventory.mjs';

const root=fileURLToPath(new URL('.',import.meta.url));
const publicRoot=resolve(root,'public');
const claimsPath=resolve(root,'.local','claims.json');
const sessions=new Map();
let claims=[];
try { claims=JSON.parse(await readFile(claimsPath,'utf8')); } catch(error) { if(error.code!=='ENOENT') console.warn('Could not load saved demo claims. Starting empty.'); }
function send(res,status,value) {res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));}
async function jsonBody(req) {let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>12000)throw Object.assign(new Error('Request is too large.'),{status:413});}try{return JSON.parse(text);}catch{throw Object.assign(new Error('Invalid JSON request.'),{status:400});}}
function authorized(req) {const expected=process.env.STAFF_TOKEN;const actual=req.headers.authorization?.replace(/^Bearer /,'');if(!expected||!actual)return false;const a=Buffer.from(actual);const b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b);}
let saving=Promise.resolve();
function saveClaims(){saving=saving.then(async()=>{await mkdir(resolve(root,'.local'),{recursive:true});await writeFile(claimsPath,JSON.stringify(claims,null,2));});return saving;}
function fallbackTurn(session, message) {
  // Keeps the fictional demo usable if Gemini is temporarily rate-limited or unavailable.
  // It uses the same public-only inventory and still leaves ownership to staff review.
  if (!session.candidates.length) {
    if (session.evidence.at(-1)?.message !== message.trim()) session.evidence.push({message:message.trim(),createdAt:new Date().toISOString()});
    session.candidates=searchItems(message); session.candidates.forEach(item=>session.candidateIds.add(item.id));
    return {message:session.candidates.length ? 'I found a possible match. Describe any identifying marks, accessories, or contents only the owner would know, and I’ll prepare a claim for staff review.' : 'I could not find a close match yet. Tell me the item type, where you last had it, and about when.',candidates:session.candidates,activity:['Searched fictional inventory in demo fallback.'],claimDraft:null};
  }
  const item=session.candidates[0];
  session.claimDraft={itemId:item.id};
  return {message:'I prepared a claim draft for staff review. Please click Submit claim to send your original description and identifying details to staff. This does not confirm ownership.',candidates:session.candidates,activity:['Prepared a claim draft in demo fallback.'],claimDraft:session.claimDraft};
}
const server=createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    // Browser callers must come from this server; CLI evaluation has no Origin.
    if(req.headers.origin && req.headers.origin!==`http://${req.headers.host}` && req.headers.origin!==`https://${req.headers.host}`)return send(res,403,{error:'Cross-origin requests are not permitted.'});
    if(req.method==='GET'&&url.pathname==='/api/health')return send(res,200,{ok:true,model:process.env.GEMINI_MODEL||'gemini-3.1-flash-lite',configured:Boolean(process.env.GEMINI_API_KEY)});
    if(req.method==='POST'&&url.pathname==='/api/chat'){
      const body=await jsonBody(req);
      if(typeof body.message!=='string'||!body.message.trim()||body.message.length>4000)return send(res,400,{error:'Enter a message of 1–4000 characters.'});
      let session=body.sessionId?sessions.get(body.sessionId):null;
      if(body.sessionId&&!session)return send(res,404,{error:'Session expired. Start a new chat.'});
      if(!session){session=createSession();sessions.set(session.id,session);}
      if(session.busy)return send(res,409,{error:'Wait for the current reply before sending another message.'});
      session.busy=true;
      try {const result=await runAgentTurn(session,body.message);const {trace,model,...safe}=result;return send(res,200,{sessionId:session.id,...safe});}
      catch(error){
        if (!error.status || error.status >= 500) return send(res,200,{sessionId:session.id,...fallbackTurn(session,body.message)});
        return send(res,error.status,{error:error.name==='TimeoutError'?'Gemini took too long. Please retry.':error.message,sessionId:session.id});
      }
      finally{session.busy=false;}
    }
    if(req.method==='POST'&&url.pathname==='/api/claims'){
      const body=await jsonBody(req);const session=sessions.get(body.sessionId);
      if(!session)return send(res,404,{error:'Session expired. Start a new chat.'});
      if(session.busy)return send(res,409,{error:'Wait for the current reply before submitting.'});
      if(!session.claimDraft||session.claimDraft.itemId!==body.itemId||!session.candidateIds.has(body.itemId))return send(res,400,{error:'Provide identifying details in chat and prepare a claim before submitting.'});
      const existing=claims.find(claim=>claim.sessionId===session.id&&claim.itemId===body.itemId);
      if(existing)return send(res,200,{claimId:existing.id,status:'pending_review'});
      const claim={id:randomUUID(),sessionId:session.id,itemId:body.itemId,status:'pending_review',createdAt:new Date().toISOString(),evidence:structuredClone(session.evidence)};
      claims.push(claim);await saveClaims();return send(res,201,{claimId:claim.id,status:'pending_review'});
    }
    if(req.method==='GET'&&url.pathname==='/api/staff/claims'){
      if(!authorized(req))return send(res,401,{error:'A valid staff token is required.'});
      return send(res,200,{claims:claims.map(({sessionId,...claim})=>({...claim,claimId:claim.id,item:items.find(item=>item.id===claim.itemId)}))});
    }
    if(url.pathname.startsWith('/api/'))return send(res,404,{error:'Endpoint not found.'});
    if(req.method!=='GET'&&req.method!=='HEAD')return send(res,405,{error:'Method not allowed.'});
    const paths={'/':'index.html','/index.html':'index.html','/styles.css':'styles.css','/app.js':'app.js'};
    const filename=paths[url.pathname];if(!filename)return send(res,404,{error:'Page not found.'});
    const contents=await readFile(resolve(publicRoot,filename));
    const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
    res.writeHead(200,{'Content-Type':types[extname(filename)],'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'; connect-src 'self'; frame-ancestors 'none'"});res.end(req.method==='HEAD'?undefined:contents);
  }catch(error){send(res,error.status||500,{error:error.status?error.message:'The server could not complete this request. Please retry.'});}
});
const port=Number(process.env.PORT||3000);
server.listen(port,'127.0.0.1',()=>console.log(`Back to Bucky: http://127.0.0.1:${port}`));
setInterval(()=>{for(const [id,session] of sessions)if(!session.busy&&Date.now()-session.createdAt>4*60*60*1000)sessions.delete(id);},60*1000).unref();
