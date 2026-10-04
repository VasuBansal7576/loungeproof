import urllib.request, pathlib, hashlib, json, datetime
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
class BankText(HTMLParser):
 def __init__(self):
  super().__init__();self.parts=[];self.skipped=0
 def handle_starttag(self,tag,attrs):
  if tag in ("script","style","nav"):self.skipped+=1
 def handle_endtag(self,tag):
  if tag in ("script","style","nav"):self.skipped=max(0,self.skipped-1)
 def handle_data(self,text):
  if not self.skipped and text.strip():self.parts.append(text.strip())
sources=[
('icici-wealth','https://www.icici.bank.in/personal-banking/cards/debit-card/wealth-management-debit-card','html'),
('icici-lounges','https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/revamp-page-images/docs/pdf/debit-card-lounge-list.pdf','pdf'),
('icici-terms','https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/debit-card-approved-t-and-c.pdf','pdf'),
('hdfc-regalia-gold-2026','https://www.hdfc.bank.in/content/dam/hdfcbankpws/in/en/personal-banking/discover-products/cards/credit-cards/regalia-gold-credit-card/pdfs/lounge-t-and-cs-and-list-Regalia-Gold.pdf','pdf'),
('hdfc-check-spend','https://www.hdfc.bank.in/content/dam/hdfcbankpws/in/en/personal-banking/discover-products/cards/credit-cards/regalia-gold-credit-card/rg-domestic-lounge-netbanking-process.pdf','pdf'),
('hdfc-legacy','https://www.hdfcbank.com/personal/resources/learning-centre/pay/why-is-regalia-gold-credit-card-the-best-travel-credit-card','html'),
('axis-priority-2026','https://www.axis.bank.in/docs/default-source/default-document-library/terms-and-conditions-for-nr-priority-debit-card.pdf?sfvrsn=5da9ec52_2','pdf'),
('axis-product','https://www.axis.bank.in/cards/debit-card/priority-debit-card','html'),
('axis-lounges','https://www.axis.bank.in/docs/default-source/default-document-library/debit-card-lounge-list.pdf?sfvrsn=f43ad662_9','pdf')]
root=pathlib.Path('data/sources'); root.mkdir(parents=True,exist_ok=True)
def fetch(s):
 id,url,ext=s
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 LoungeProof source audit'})
  with urllib.request.urlopen(req,timeout=50) as response:
   data=response.read(); final=response.url
  path=root/f'{id}.{ext}'; path.write_bytes(data)
  entry={'id':id,'url':url,'finalUrl':final,'file':str(path),'sha256':hashlib.sha256(data).hexdigest(),'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'bytes':len(data)}
  if ext=='pdf':
   from pypdf import PdfReader
   reader=PdfReader(path); text='\n\n'.join(f'## Page {i+1}\n'+(p.extract_text() or '') for i,p in enumerate(reader.pages)); (root/f'{id}.txt').write_text(text); entry['pages']=len(reader.pages)
  else:
   parser=BankText();parser.feed(data.decode('utf-8',errors='replace')); (root/f'{id}.txt').write_text('\n'.join(parser.parts))
  print(id,len(data),'bytes'); return entry
 except Exception as ex:
  print(id,type(ex).__name__,str(ex)); return {'id':id,'url':url,'error':str(ex)}
results=list(ThreadPoolExecutor(max_workers=4).map(fetch,sources)); (root/'manifest.json').write_text(json.dumps(results,indent=2))
