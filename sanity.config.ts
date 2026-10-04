import {defineConfig,defineType,defineField} from 'sanity';
import {structureTool} from 'sanity/structure';
const str=(name:string)=>defineField({name,type:'string'});
const strings=(name:string)=>defineField({name,type:'array',of:[{type:'string'}]});
const bool=(name:string)=>defineField({name,type:'boolean'});
const num=(name:string)=>defineField({name,type:'number'});
export default defineConfig({name:'loungeproof',title:'LoungeProof evidence desk',projectId:'204x480o',dataset:'production',plugins:[structureTool()],schema:{types:[
 defineType({name:'policySource',title:'Bank source',type:'document',fields:[str('id'),str('title'),defineField({name:'url',type:'url'}),str('publisher'),str('locator'),str('retrievedAt'),str('sha256'),str('role'),defineField({name:'text',type:'text'})]}),
 defineType({name:'loungePolicy',title:'Reviewed eligibility rule',type:'document',fields:[str('title'),str('card'),str('issuer'),str('validFrom'),str('reviewedAt'),str('reviewBy'),strings('accountTypes'),str('openedOnOrAfter'),bool('programRequired'),str('window'),num('releaseDay'),num('quota'),str('waiver'),str('accessMethod'),defineField({name:'spendNotes',type:'text'}),strings('sourceIds'),strings('conflictIds'),strings('notes'),defineField({name:'sourceReferences',type:'array',of:[{type:'reference',to:[{type:'policySource'}]}]}),defineField({name:'alternatives',title:'Any one of these routes qualifies (OR)',type:'array',of:[{type:'object',name:'condition',fields:[str('kind'),str('field'),num('min'),str('label')]}]})]}),
 defineType({name:'lounge',title:'Exact lounge match',type:'document',fields:[str('name'),str('card'),str('airport'),str('terminal'),str('flightType'),str('sourceId'),str('locator'),defineField({name:'sourceReference',type:'reference',to:[{type:'policySource'}]})]}),
 defineType({name:'policyConflict',title:'Source decision',type:'document',fields:[str('title'),str('card'),strings('sourceIds'),str('status'),defineField({name:'decision',type:'text'}),str('decidedAt'),defineField({name:'sourceReferences',type:'array',of:[{type:'reference',to:[{type:'policySource'}]}]})]})
]}});
