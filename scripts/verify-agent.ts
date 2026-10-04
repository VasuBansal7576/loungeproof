import {writeFile} from 'node:fs/promises';
import {answerSchema, errorSchema, factsSchema} from '../src/domain.js';
import {cases} from '../tests/cases.js';

const scenarios = [
  {name:'ICICI: deposits route qualifies with zero spend', question:'My relationship manager says spending is mandatory. With zero eligible spending and ₹12 lakh in qualifying deposits and balance, how does the reviewed individual savings rule apply?'},
  {name:'HDFC: no spend despite legacy annual marketing', question:'The old article says 12 annual lounge visits. Does that give me free domestic entry with zero spending for this October trip?'},
  {name:'HDFC: September issue is only a possible exemption', question:'My card was issued in September and I have zero spending. Am I definitely exempt from the October spend condition?'},
  {name:'Axis: previous three full months and exact DEL T3 lounge', question:'Which spending months count for this October trip, how many visits remain, and is Encalm at Delhi T3 domestic listed for my card?'}
];
const results = [];
for (const scenario of scenarios) {
  const fixture = cases.find(candidate => candidate.name === scenario.name);
  if (!fixture) throw new Error(`Unknown verification fixture: ${scenario.name}`);
  const facts = factsSchema.parse({...fixture.facts, question:scenario.question});
  const response = await fetch('http://127.0.0.1:4317/api/agent', {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(facts),
    signal:AbortSignal.timeout(210_000)
  });
  const raw:unknown = await response.json();
  if (!response.ok) {
    const error = errorSchema.safeParse(raw);
    results.push({name:scenario.name, passed:false, error:error.success ? error.data.error : 'Invalid error response'});
    console.log(`${scenario.name}: withheld`);
    break;
  }
  const answer = answerSchema.parse(raw);
  const calls = answer.agent?.toolCalls ?? [];
  const passed = answer.dataMode === 'sanity-live' && answer.context?.status === 'live'
    && answer.agent?.status === 'live' && answer.verdict.status === fixture.expected
    && calls.includes('initial_context') && calls.includes('knowledge_base_read');
  results.push({name:scenario.name, passed, facts, expected:fixture.expected, ...answer});
  console.log(`${scenario.name}: ${passed ? 'live retrieval verified' : 'failed verification'}`);
}
const report = {
  evaluatedAt:new Date().toISOString(),
  inputNote:'Original public bank documents in live Sanity; invented traveller facts. No customer account or operator admission test.',
  passDefinition:'Expected deterministic status, live Sanity data, successful Context probe, and observed completed initial_context and knowledge_base_read tool calls. Answer quality is reviewed separately.',
  planned:scenarios.length, total:results.length, passed:results.filter(result => result.passed).length, results
};
await writeFile('reports/agent-evaluation.json',JSON.stringify(report,null,2));
console.log(`${report.passed}/${report.total} executed live agent cases; ${report.planned} planned.`);
if (report.total !== report.planned || report.passed !== report.total) process.exitCode=1;
