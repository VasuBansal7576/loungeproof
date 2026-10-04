import {readFile} from 'node:fs/promises';
import {createClient} from '@sanity/client';
import {corpusSchema,type Corpus} from '../src/domain.js';
export async function localCorpus():Promise<Corpus>{return corpusSchema.parse(JSON.parse(await readFile(new URL('../data/corpus.json',import.meta.url),'utf8')));}
export async function loadCorpus():Promise<{corpus:Corpus;mode:'sanity-live'|'local-snapshot';revision:string}>{
 const projectId=process.env.SANITY_PROJECT_ID;
 if(!projectId)return {corpus:await localCorpus(),mode:'local-snapshot',revision:'source-audit-2026-10-03'};
 const client=createClient({projectId,dataset:process.env.SANITY_DATASET||'production',apiVersion:'2026-10-01',useCdn:false});
 const raw:unknown=await client.fetch('{"sources":*[_type=="policySource"],"policies":*[_type=="loungePolicy"],"lounges":*[_type=="lounge"],"conflicts":*[_type=="policyConflict"]}');
 const corpus=corpusSchema.parse(raw);
 if(!corpus.policies.length)throw new Error('Sanity contains no reviewed policies. Import the corpus before running the live app.');
 return {corpus,mode:'sanity-live',revision:new Date().toISOString()};
}
