import {factsSchema,type Facts,type Verdict} from '../src/domain.js';
const hdfc=factsSchema.parse({card:'hdfc-regalia-gold',travelDate:'2026-10-10',openedOn:'2025-02-10',eligibleSpend:65000,visitsUsed:1});
const icici=factsSchema.parse({...hdfc,card:'icici-wealth-world',accountType:'savings',openedOn:'2025-09-01',programMaintained:true,eligibleSpend:0,balance:1200000,relationship:0});
const axis=factsSchema.parse({...hdfc,card:'axis-priority',openedOn:'2025-01-15',eligibleSpend:12000,visitsUsed:0});
type Case={name:string;facts:Facts;expected:Verdict['status'];sourceIds:string[];period?:{from:string;to:string};remaining?:number;listed?:boolean};
function make(name:string,base:Facts,change:Partial<Facts>,expected:Verdict['status'],sourceIds:string[],extra:Pick<Case,'period'|'remaining'|'listed'>={}):Case{return {name,facts:factsSchema.parse({...base,...change}),expected,sourceIds,...extra};}
export const cases:Case[]=[
 make('HDFC: 65k spend in preceding quarter qualifies',hdfc,{},'qualified',['hdfc-regalia-gold-2026'],{remaining:2,period:{from:'2026-07-01',to:'2026-09-30'},listed:false}),
 make('HDFC: exact 60k threshold',hdfc,{eligibleSpend:60000},'qualified',['hdfc-regalia-gold-2026']),
 make('HDFC: 59,999 misses dated spend threshold',hdfc,{eligibleSpend:59999},'not-qualified',['hdfc-regalia-gold-2026']),
 make('HDFC: no spend despite legacy annual marketing',hdfc,{eligibleSpend:0},'not-qualified',['hdfc-regalia-gold-2026','hdfc-legacy']),
 make('HDFC: all three visits used',hdfc,{visitsUsed:3},'not-qualified',['hdfc-regalia-gold-2026'],{remaining:0}),
 make('HDFC: missing count does not invent remaining visits',hdfc,{visitsUsed:null},'needs-info',['hdfc-regalia-gold-2026']),
 make('HDFC: September issue is only a possible exemption',hdfc,{openedOn:'2026-09-05',eligibleSpend:0},'needs-confirmation',['hdfc-regalia-gold-2026']),
 make('HDFC: August issue has no last-month exception',hdfc,{openedOn:'2026-08-05',eligibleSpend:0},'not-qualified',['hdfc-regalia-gold-2026']),
 make('HDFC: missing issue date is irrelevant if spend passes',hdfc,{openedOn:null},'qualified',['hdfc-regalia-gold-2026']),
 make('HDFC: missing issue date matters if spend fails',hdfc,{openedOn:null,eligibleSpend:0},'needs-info',['hdfc-regalia-gold-2026']),
 make('HDFC: last-month issue exception is not carried to another quarter',hdfc,{travelDate:'2026-10-15',openedOn:'2026-06-05',eligibleSpend:0},'not-qualified',['hdfc-regalia-gold-2026']),
 make('HDFC: pre-July trip cannot borrow current rule',hdfc,{travelDate:'2026-06-15'},'needs-confirmation',[]),
 make('HDFC: guests need independent entitlement',hdfc,{guests:1},'needs-confirmation',['hdfc-regalia-gold-2026']),
 make('HDFC: future trip after review horizon requires refresh',hdfc,{travelDate:'2027-01-02'},'needs-confirmation',['hdfc-regalia-gold-2026']),
 make('ICICI: deposits route qualifies with zero spend',icici,{},'qualified',['icici-wealth'],{remaining:1}),
 make('ICICI: relationship route qualifies with low deposits',icici,{balance:0,relationship:5000000},'qualified',['icici-wealth']),
 make('ICICI: spend alone qualifies with unknown other routes',icici,{eligibleSpend:10000,balance:null,relationship:null},'qualified',['icici-wealth']),
 make('ICICI: unknown balance must not turn OR into false',icici,{balance:null,relationship:0},'needs-info',['icici-wealth']),
 make('ICICI: salary cannot borrow savings balance route',icici,{accountType:'salary',balance:10000000,relationship:10000000},'not-qualified',['icici-wealth']),
 make('ICICI: salary spend threshold qualifies',icici,{accountType:'salary',eligibleSpend:10000},'qualified',['icici-wealth']),
 make('ICICI: Visa scope is never guessed',icici,{card:'icici-wealth-visa'},'needs-confirmation',[]),
 make('ICICI: pre-August account not covered by FAQ',icici,{openedOn:'2025-07-31'},'needs-confirmation',['icici-wealth']),
 make('ICICI: account opening date required for scope',icici,{openedOn:null},'needs-info',['icici-wealth']),
 make('ICICI: account type must be asked',icici,{accountType:'unknown'},'needs-info',[]),
 make('ICICI: quarter release on October fifth',icici,{travelDate:'2026-10-05'},'qualified',['icici-wealth']),
 make('ICICI: October fourth needs activation confirmation',icici,{travelDate:'2026-10-04'},'needs-confirmation',['icici-wealth']),
 make('ICICI: family programme route can qualify',icici,{accountType:'family-savings',familyEligibilityMaintained:true},'qualified',['icici-wealth']),
 make('ICICI: family cannot borrow individual relationship values',icici,{accountType:'family-savings',familyEligibilityMaintained:false},'not-qualified',['icici-wealth']),
 make('Axis: previous three full months and exact DEL T3 lounge',axis,{},'qualified',['axis-priority-2026','axis-lounges'],{period:{from:'2026-07-01',to:'2026-09-30'},remaining:2,listed:true}),
 make('Axis: rolling window for November would differ from quarter',axis,{travelDate:'2026-10-20',eligibleSpend:9999},'not-qualified',['axis-priority-2026']),
 make('Axis: first-day status carries from previous month',axis,{travelDate:'2026-10-01'},'needs-confirmation',['axis-lounges']),
 make('Axis: exact ten-thousand threshold',axis,{eligibleSpend:10000},'qualified',['axis-priority-2026']),
 make('Axis: July issue waiver lasts through October',axis,{openedOn:'2026-07-12',eligibleSpend:0},'qualified',['axis-priority-2026']),
 make('Axis: June issue waiver expired after September',axis,{openedOn:'2026-06-12',eligibleSpend:0},'not-qualified',['axis-priority-2026']),
 make('Axis: BLR T1 domestic is listed',axis,{airport:'BLR',terminal:'T1'},'qualified',['axis-lounges'],{listed:true}),
 make('Axis: BLR T2 domestic not inferred from T2 international',axis,{airport:'BLR',terminal:'T2'},'qualified',['axis-priority-2026'],{listed:false}),
 make('Axis: outside India requires another policy',axis,{country:'other'},'needs-confirmation',['axis-priority-2026']),
 make('Unknown card triggers exact variant question',axis,{card:'unknown'},'needs-info',[])
];
