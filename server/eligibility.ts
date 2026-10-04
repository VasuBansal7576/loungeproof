import type {Corpus,Facts,Policy,Trace,Verdict} from '../src/domain.js';
const iso=(d:Date)=>d.toISOString().slice(0,10);
const date=(s:string)=>new Date(`${s}T00:00:00Z`);
const rupees=(n:number)=>`₹${n.toLocaleString('en-IN')}`;
export function spendPeriod(travelDate:string,window:Policy['window']){
 const d=date(travelDate),y=d.getUTCFullYear(),m=d.getUTCMonth();
 const endMonth=window==='previous-quarter'?Math.floor(m/3)*3:m;
 const from=iso(new Date(Date.UTC(y,endMonth-3,1))),to=iso(new Date(Date.UTC(y,endMonth,0)));
 return {from,to,label:`${from} to ${to}`};
}
export function evaluate(f:Facts,c:Corpus):Verdict{
 const fallbackPeriod=spendPeriod(f.travelDate,'previous-quarter');
 const out:Verdict={status:'needs-info',title:'A few facts are missing',summary:'I need the exact card and applicable policy before checking your benefit.',questions:[],trace:[],period:fallbackPeriod,remaining:null,policy:null,lounges:[],loungeStatus:'unverified',sources:[],conflicts:[],caveats:['These are published benefit conditions, not a live approval from your bank.','Your spend and visit count are supplied by you. Lounge capacity and entry validation remain with the operator.']};
 const finish=(status:Verdict['status'],title:string,summary:string)=>({...out,status,title,summary});
 if(f.card==='unknown'){out.questions.push('What is the exact bank, card name, and network printed on your card?');return out;}
 if(f.card==='icici-wealth-visa'){out.questions.push('Can ICICI confirm the lounge terms for your Visa Signature variant? The reviewed FAQ explicitly describes World / Mastercard.');return finish('needs-confirmation','Confirm the card variant','I cannot apply World / Mastercard rules to a Visa Signature card.');}
 const candidates=c.policies.filter(p=>p.card===f.card && p.validFrom<=f.travelDate);
 if(!candidates.length)return finish('needs-confirmation','No reviewed policy for this date','This date predates the policies in the pilot. I will not extend current terms backwards.');
 if(f.card==='icici-wealth-world' && f.accountType==='unknown'){out.questions.push('Is this an individual savings, salary, or family savings account?');return out;}
 const p=candidates.filter(p=>p.accountTypes.includes(f.accountType)).sort((a,b)=>b.validFrom.localeCompare(a.validFrom))[0];
 if(!p)return finish('needs-confirmation','Account terms need review','There is no reviewed policy matching this account type.');
 out.policy=p;out.period=spendPeriod(f.travelDate,p.window);out.conflicts=c.conflicts.filter(x=>p.conflictIds.includes(x._id));
 const ids=new Set([...p.sourceIds,...out.conflicts.flatMap(x=>x.sourceIds)]);out.sources=c.sources.filter(s=>ids.has(s.id));
 out.trace.push({label:'Applicable policy',state:'pass',detail:`${p.title}. Effective ${p.validFrom}; reviewed ${p.reviewedAt}.`,sourceId:p.sourceIds[0]});
 if(out.conflicts.some(x=>x.status==='unresolved'))return finish('conflict','The sources disagree','This rule needs an editorial decision before I can give a benefit answer.');
 if(f.travelDate>p.reviewBy)return finish('needs-confirmation','Policy needs a fresh check',`The reviewed source covers this pilot through ${p.reviewBy}. Refresh the bank terms for a later trip.`);
 if(f.country!=='India')return finish('needs-confirmation','Outside the pilot coverage','The pilot evaluates access within India. Overseas lounge benefits need a separate reviewed policy.');
 if(p.openedOnOrAfter){
  if(!f.openedOn)out.questions.push('When was the savings account opened? This FAQ scopes the benefit to accounts opened on or after 1 August 2025.');
  else if(f.openedOn<p.openedOnOrAfter)return finish('needs-confirmation','Older account needs its own policy','The reviewed FAQ is explicitly scoped to newer savings accounts. Older account terms are not established here.');
 }
 if(f.openedOn && f.openedOn>f.travelDate)return finish('needs-info','Check the opening date','The supplied opening date is after the travel date.');
 if(p.programRequired){
  if(f.programMaintained===null)out.questions.push('Are you enrolled in the Wealth Management programme?');
  else if(!f.programMaintained)return finish('needs-confirmation','Programme scope is not established','These terms apply to Wealth Management programme members. Ask the bank for your current account terms.');
 }
 if(out.questions.length)return out;
 if(p.window==='previous-three-months' && date(f.travelDate).getUTCDate()<p.releaseDay){
  out.trace.push({label:'Monthly eligibility refresh',state:'unknown',detail:`On the 1st, the previous month's eligibility carries over; a fresh three-month spend window activates on day ${p.releaseDay}. Confirm the carried-over bank status for this trip.`,sourceId:'axis-lounges'});
  return finish('needs-confirmation','Confirm the carried-over monthly status','The trip is before this month’s eligibility refresh. Newly supplied three-month spending does not establish the previous month’s bank status.');
 }
 const checks:('pass'|'fail'|'unknown')[]=[];
 let conditionalWaiver=false;
 if(p.waiver!=='none'){
  if(!f.openedOn)out.questions.push('When was this card issued? A new-card exception may apply even with low spend.');
  else{
   const opened=date(f.openedOn),trip=date(f.travelDate);
   if(p.waiver==='issue-month-plus-three'){
    const until=iso(new Date(Date.UTC(opened.getUTCFullYear(),opened.getUTCMonth()+4,0)));
    const pass=f.travelDate<=until && f.travelDate>=f.openedOn;
    checks.push(pass?'pass':'fail');out.trace.push({label:'New-card exception',state:pass?'pass':'info',detail:pass?`Spend waived through ${until}: issue month plus three calendar months.`:`New-card spend waiver ended ${until}.`,sourceId:p.sourceIds[0]});
   }else{
    const from=date(out.period.from),to=date(out.period.to);
    conditionalWaiver=opened.getUTCMonth()===to.getUTCMonth() && opened>=from && opened<=to && trip>to;
    if(conditionalWaiver)out.trace.push({label:'Possible new-card exception',state:'unknown',detail:'The terms say cards opened in the last month of the previous quarter may be exempted. Bank confirmation is needed; this is not an automatic approval.',sourceId:p.sourceIds[0]});
   }
  }
 }
 for(const rule of p.alternatives){
  const value=rule.kind==='family'?f.familyEligibilityMaintained:f[rule.field];
  const state=value===null?'unknown':rule.kind==='family'?(value===true?'pass':'fail'):(typeof value==='number' && value>=rule.min?'pass':'fail');
  checks.push(state);
  const detail=rule.kind==='family'?(value===null?'Confirm 1.5× programme eligibility at the family ID level.':`Family programme eligibility: ${value===true?'maintained':'not maintained'}.`):`${value===null?'Not supplied':typeof value==='number'?rupees(value):'Unknown'} / ${rupees(rule.min)} required${rule.field==='eligibleSpend'?` in ${out.period.label}`:''}.`;
  out.trace.push({label:rule.label,state,detail,sourceId:p.sourceIds[0]});
 }
 const qualifies=checks.includes('pass');
 if(!qualifies){
  if(conditionalWaiver)return finish('needs-confirmation','Confirm the new-card exception','Your normal spend route is not established. The bank may waive it for this new-card cohort; verify your entitlement in NetBanking.');
  if(checks.includes('unknown') || out.questions.length){out.questions.push('Supply the missing qualifying route, or confirm that it is not met.');return out;}
  return finish('not-qualified','Benefit conditions not met',`None of the reviewed qualification routes is met for ${out.period.label}. ${p.spendNotes}`);
 }
 // Missing issue date is irrelevant when an independently verified spend route passes.
 out.questions=[];
 if(p.releaseDay>1 && date(f.travelDate).getUTCMonth()%3===0 && date(f.travelDate).getUTCDate()<p.releaseDay){
  out.trace.push({label:'Quarter activation delay',state:'unknown',detail:`Published access starts on day ${p.releaseDay} of the month following quarter end. Verify any carried-over entitlement with the bank.`,sourceId:p.sourceIds[0]});
  return finish('needs-confirmation','Wait for the quarter to activate','You meet a qualification route, but this trip is before the published activation day.');
 }
 if(f.visitsUsed===null){out.questions.push(`How many complimentary visits have you used in this calendar quarter? The limit is ${p.quota}.`);return finish('needs-info','Qualification route met; check your visits','Your spending or programme route passes. Remaining entitlement still needs your visit count.');}
 out.remaining=Math.max(0,p.quota-f.visitsUsed);out.trace.push({label:'Quarterly visit allowance',state:out.remaining>0?'pass':'fail',detail:`${f.visitsUsed} used out of ${p.quota}; ${out.remaining} remaining.`,sourceId:p.sourceIds[0]});
 if(!out.remaining)return finish('not-qualified','Quarterly allowance used','You meet a qualification route, but the supplied visit count uses the full complimentary quota.');
 if(f.guests>0){out.questions.push('Does each companion have a separate verified entitlement? This pilot has not reviewed guest or child admission rules.');return finish('needs-confirmation','Your benefit passes; guests need confirmation','A personal visit allowance does not establish complimentary admission for accompanying guests.');}
 out.lounges=c.lounges.filter(l=>l.card===f.card && l.airport===f.airport && l.terminal===f.terminal && l.flightType===f.flightType);
 out.loungeStatus=out.lounges.length?'listed':'unverified';
 for(const l of out.lounges){const source=c.sources.find(s=>s.id===l.sourceId);if(source&&!out.sources.some(s=>s.id===source.id))out.sources.push(source);}
 if(!out.lounges.length)out.caveats.push('This exact airport, terminal, and flight section has not been verified in the pilot directory. Check the bank list before travelling.');
 out.trace.push({label:'Exact lounge match',state:out.lounges.length?'pass':'unknown',detail:out.lounges.length?out.lounges.map(l=>`${l.name} • ${l.airport} ${l.terminal} ${l.flightType} • ${l.locator}`).join('; '):'No reviewed directory match for this exact terminal and flight section.',sourceId:out.lounges[0]?.sourceId});
 out.trace.push({label:'Entry method',state:'info',detail:p.accessMethod,sourceId:p.sourceIds[0]});
 return finish('qualified','Published benefit conditions met',`You have ${out.remaining} of ${p.quota} quarterly visits remaining under the supplied facts. ${out.lounges.length?'Your selected terminal has a listed lounge.':'The exact lounge remains unverified.'}`);
}
