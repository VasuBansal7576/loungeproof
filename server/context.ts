import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
export async function contextProbe(){
 const url=process.env.SANITY_CONTEXT_URL,token=process.env.SANITY_CONTEXT_TOKEN;
 if(!url||!token)return {status:'not-configured',tools:[]};
 const endpoint=new URL(url);
 if(endpoint.protocol!=='https:'||endpoint.hostname!=='api.sanity.io')throw new Error('Context endpoint must be an official Sanity HTTPS endpoint.');
 const client=new Client({name:'loungeproof',version:'0.1.0'});
 try{
  await client.connect(new StreamableHTTPClientTransport(endpoint,{requestInit:{headers:{Authorization:`Bearer ${token}`}}}));
  const list=await client.listTools();const tools=list.tools.map(t=>t.name);
  if(!tools.includes('knowledge_base_read'))throw new Error('The configured endpoint does not serve a Knowledge Base.');
  const result=await client.callTool({name:'initial_context',arguments:{}},undefined,{timeout:30000});
  if(result.isError)throw new Error('Sanity initial_context returned an error.');
  return {status:'live',tools};
 }finally{await client.close();}
}
