import {getCliClient} from 'sanity/cli';
import {readFile} from 'node:fs/promises';
import {corpusSchema} from '../src/domain.ts';
const c=corpusSchema.parse(JSON.parse(await readFile(new URL('../data/corpus.json',import.meta.url),'utf8')));
const client=getCliClient({apiVersion:'2026-10-01'});
let tx=client.transaction();
for(const s of c.sources){
 const text=await readFile(new URL(`../data/sources/${s.id}.txt`,import.meta.url),'utf8');
 tx=tx.createOrReplace({...s,_id:`source-${s.id}`,_type:'policySource',text});
}
for(const p of c.policies)tx=tx.createOrReplace({...p,sourceReferences:p.sourceIds.map((id,i)=>({_type:'reference',_key:`source-${i}`,_ref:`source-${id}`})),alternatives:p.alternatives.map((a,i)=>({...a,_key:`route-${i}`}))});
for(const l of c.lounges)tx=tx.createOrReplace({...l,sourceReference:{_type:'reference',_ref:`source-${l.sourceId}`}});
for(const x of c.conflicts)tx=tx.createOrReplace({...x,sourceReferences:x.sourceIds.map((id,i)=>({_type:'reference',_key:`source-${i}`,_ref:`source-${id}`}))});
await tx.commit();console.log(`Imported ${c.sources.length} sources, ${c.policies.length} reviewed policies, ${c.lounges.length} exact lounges and ${c.conflicts.length} source decisions.`);
