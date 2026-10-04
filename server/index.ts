import 'dotenv/config';
import express from 'express';
import {createServer as createViteServer} from 'vite';
import {readFile} from 'node:fs/promises';
import {factsSchema} from '../src/domain.js';
import {loadCorpus} from './corpus.js';
import {evaluate} from './eligibility.js';
import {contextProbe} from './context.js';
import {explainWithAgent} from './agent.js';
const app=express();app.disable('x-powered-by');app.use(express.json({limit:'16kb'}));
app.use('/api',(req,res,next)=>{
 const origin=req.get('origin');if(origin&&!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)){res.status(403).json({error:'Only the local app may call this demonstration service.'});return;}
 res.set('Cache-Control','no-store');next();
});
app.get('/api/meta',async(_req,res)=>{
 try{const {corpus,mode}=await loadCorpus();let tests=null;try{const raw=JSON.parse(await readFile('reports/evaluation.json','utf8'));tests={passed:raw.passed,total:raw.total};}catch{/* Evaluation has not run yet. */}
 res.json({corpus,dataMode:mode,contextConfigured:Boolean(process.env.SANITY_CONTEXT_URL&&process.env.SANITY_CONTEXT_TOKEN),agentProvider:'Codex CLI',tests});
 }catch{res.status(503).json({error:'The Sanity policy dataset is unavailable. No silent snapshot fallback is used.'});}
});
let agentActive=false;
async function check(req:express.Request,res:express.Response,withAgent:boolean){
 const parsed=factsSchema.safeParse(req.body);if(!parsed.success){res.status(400).json({error:'Check the supplied dates, numbers, and card fields.',details:parsed.error.flatten()});return;}
 if(withAgent&&agentActive){res.status(429).json({error:'An evidence agent is already running. Please wait for it to finish.'});return;}
 const start=Date.now();
 try{
  const {corpus,mode}=await loadCorpus(),verdict=evaluate(parsed.data,corpus);
  if(!withAgent){res.json({verdict,dataMode:mode,durationMs:Date.now()-start});return;}
  agentActive=true;
  const context=await contextProbe();
  if(context.status!=='live')throw new Error('The Sanity Context endpoint is not ready.');
  const agent=await explainWithAgent(parsed.data,verdict);
  res.json({verdict,dataMode:mode,context,agent,durationMs:Date.now()-start});
 }catch(e){res.status(503).json({error:e instanceof Error?e.message:'The evidence service could not complete this check.'});}
 finally{if(withAgent)agentActive=false;}
}
app.post('/api/check',(req,res)=>void check(req,res,false));app.post('/api/agent',(req,res)=>void check(req,res,true));
if(process.env.NODE_ENV==='production')app.use(express.static('dist'));
else{const vite=await createViteServer({server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares);}
app.use((error:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{res.status(400).json({error:'Invalid request body.'});});
const port=Number(process.env.PORT||4317);const server=app.listen(port,'127.0.0.1');server.on('listening',()=>console.log(`LoungeProof ready at http://127.0.0.1:${port}`));server.on('error',error=>{console.error('Local server could not start:',error.message);process.exitCode=1;});
