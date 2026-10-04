import {z} from 'zod';
export const dateSchema=z.iso.date();
export const cardSchema=z.enum(['icici-wealth-world','icici-wealth-visa','hdfc-regalia-gold','axis-priority','unknown']);
export const factsSchema=z.object({
  card:cardSchema, travelDate:dateSchema,
  country:z.enum(['India','other']).default('India'),airport:z.string().max(100).default('DEL'),terminal:z.string().max(30).default('T3'),flightType:z.enum(['domestic','international']).default('domestic'),
  accountType:z.enum(['savings','salary','family-savings','unknown']).default('unknown'),openedOn:dateSchema.nullable().default(null),
  programMaintained:z.boolean().nullable().default(null),familyEligibilityMaintained:z.boolean().nullable().default(null),
  eligibleSpend:z.number().finite().min(0).max(1e10).nullable().default(null),balance:z.number().finite().min(0).max(1e10).nullable().default(null),relationship:z.number().finite().min(0).max(1e10).nullable().default(null),
  visitsUsed:z.number().int().min(0).max(1000).nullable().default(null),guests:z.number().int().min(0).max(20).default(0),
  question:z.string().max(1800).default('Can I use my lounge benefit?')
}).strict();
export type Facts=z.infer<typeof factsSchema>;
export const amountFields=['eligibleSpend','balance','relationship'] as const;
const conditionSchema=z.discriminatedUnion('kind',[
  z.object({kind:z.literal('amount'),field:z.enum(amountFields),min:z.number().nonnegative(),label:z.string()}),
  z.object({kind:z.literal('family'),label:z.string()})
]);
export const sourceSchema=z.object({id:z.string(),title:z.string(),url:z.url(),publisher:z.string(),locator:z.string(),retrievedAt:z.string(),sha256:z.string(),role:z.enum(['current','historical','directory'])});
export type Source=z.infer<typeof sourceSchema>;
export const policySchema=z.object({
  _id:z.string(),_type:z.literal('loungePolicy'),card:z.enum(['icici-wealth-world','hdfc-regalia-gold','axis-priority']),title:z.string(),issuer:z.string(),
  validFrom:dateSchema,reviewedAt:dateSchema,reviewBy:dateSchema,
  accountTypes:z.array(z.enum(['savings','salary','family-savings','unknown'])),openedOnOrAfter:dateSchema.nullable(),programRequired:z.boolean(),
  window:z.enum(['previous-quarter','previous-three-months']),releaseDay:z.number().int().min(1).max(31),quota:z.number().int().positive(),
  alternatives:z.array(conditionSchema).min(1),waiver:z.enum(['none','issue-month-plus-three','last-month-next-quarter-conditional']),
  accessMethod:z.string(),spendNotes:z.string(),sourceIds:z.array(z.string()).min(1),conflictIds:z.array(z.string()),
  notes:z.array(z.string())
});
export type Policy=z.infer<typeof policySchema>;
export const loungeSchema=z.object({_id:z.string(),_type:z.literal('lounge'),card:z.enum(['icici-wealth-world','hdfc-regalia-gold','axis-priority']),airport:z.string(),terminal:z.string(),flightType:z.enum(['domestic','international']),name:z.string(),sourceId:z.string(),locator:z.string()});
export type Lounge=z.infer<typeof loungeSchema>;
export const conflictSchema=z.object({_id:z.string(),_type:z.literal('policyConflict'),card:cardSchema,title:z.string(),sourceIds:z.array(z.string()),status:z.enum(['resolved','unresolved']),decision:z.string(),decidedAt:dateSchema});
export type Conflict=z.infer<typeof conflictSchema>;
export const corpusSchema=z.object({sources:z.array(sourceSchema),policies:z.array(policySchema),lounges:z.array(loungeSchema),conflicts:z.array(conflictSchema)});
export type Corpus=z.infer<typeof corpusSchema>;
export const traceSchema=z.object({label:z.string(),state:z.enum(['pass','fail','unknown','info']),detail:z.string(),sourceId:z.string().optional()});
export type Trace=z.infer<typeof traceSchema>;
export const verdictSchema=z.object({status:z.enum(['qualified','not-qualified','needs-info','needs-confirmation','conflict']),title:z.string(),summary:z.string(),questions:z.array(z.string()),trace:z.array(traceSchema),period:z.object({from:z.string(),to:z.string(),label:z.string()}),remaining:z.number().nullable(),policy:policySchema.nullable(),lounges:z.array(loungeSchema),loungeStatus:z.enum(['listed','unverified']),sources:z.array(sourceSchema),conflicts:z.array(conflictSchema),caveats:z.array(z.string())});
export type Verdict=z.infer<typeof verdictSchema>;
export const answerSchema=z.object({verdict:verdictSchema,dataMode:z.string(),agent:z.object({status:z.string(),answer:z.string().optional(),citations:z.array(z.string()).optional(),toolCalls:z.array(z.string()).optional()}).optional(),context:z.object({status:z.string(),tools:z.array(z.string()).optional()}).optional(),durationMs:z.number()});
export const metaSchema=z.object({corpus:corpusSchema,dataMode:z.string(),contextConfigured:z.boolean(),agentProvider:z.string(),tests:z.object({passed:z.number(),total:z.number()}).nullable()});
export const errorSchema=z.object({error:z.string()});
