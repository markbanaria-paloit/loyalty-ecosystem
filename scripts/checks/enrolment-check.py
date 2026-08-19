import json, os, urllib.request, urllib.error

# Unique per run: enrolment is one-shot per address, so a re-run against a live
# store must not collide with the members the previous run created.
RUN = os.urandom(4).hex()
def addr(name):
    return f'{name}-{RUN}@example.com'
B='http://localhost:8181'
def call(m,p,b=None,tok=None):
    r=urllib.request.Request(B+p,method=m,data=json.dumps(b).encode() if b is not None else None,
        headers={'Content-Type':'application/json',**({'Authorization':'Bearer '+tok} if tok else {})})
    with urllib.request.urlopen(r) as x:
        raw=x.read().decode(); return json.loads(raw) if raw else {}
fails=[]
def check(l,ok,d=''):
    print(('  PASS  ' if ok else '  FAIL  ')+l+(f'  [{d}]' if d else ''))
    if not ok: fails.append(l)

tok=call('POST','/api/admin/login_check',{'username':'admin','password':'admin'})['token']
tiers={t['name']:t for t in call('GET','/api/default/tier',tok=tok)['items']}
check('ladder is Tier 1 / Tier 2', sorted(tiers)==['Tier 1','Tier 2'], str(sorted(tiers)))

print('\n— A regular customer —')
r=call('POST','/api/default/member/register',{'customer':{'firstName':'Alex','lastName':'Tan',
   'email':addr('alex'),'plainPassword':'pw','agreement1':True}})
check('lands on Tier 1', r['status']['levelName']=='Tier 1', r['status']['levelName'])
check('gets exactly 250 points', r['status']['activePoints']==250, str(r['status']['activePoints']))
check('one campaign paid out', [ (p['name'],p['points']) for p in r['campaignPayouts']]==[('Welcome Bonus',250)], str(r['campaignPayouts']))

print('\n— A union member —')
u=call('POST','/api/default/member/register',{'customer':{'firstName':'Wei','lastName':'Lim',
   'email':addr('wei'),'plainPassword':'pw','agreement1':True,
   'labels':[{'key':'customerType','value':'union_member'}]}})
uid=u['customerId']
check('is admitted to Tier 2 on enrolment, with no spend',
      u['status']['levelName']=='Tier 2', u['status']['levelName'])
check('gets exactly 500 — not 750', u['status']['activePoints']==500, str(u['status']['activePoints']))
check('only the union campaign ran', [p['name'] for p in u['campaignPayouts']]==['Union Member Welcome'], str([p['name'] for p in u['campaignPayouts']]))
check('and holds it by membership, not by an admin assignment',
      u['status']['levelManuallyAssigned'] is False)

print('\n— An explicitly assigned tier survives activity (the demotion test) —')
tiers_by_name={t['name']:t for t in call('GET','/api/default/tier',tok=tok)['items']}
call('POST',f"/api/default/member/{uid}/tier",{'levelId':tiers_by_name['Tier 2']['levelId']},tok)
check('an admin can put a member on Tier 2 directly',
      call('GET',f'/api/default/member/{uid}/status',tok=tok)['levelName']=='Tier 2')
call('POST','/api/default/transaction',{'transaction':{
  'header':{'documentNumber':'POS-'+RUN,'documentType':'sell','purchasedAt':'2026-08-18T10:00:00.000Z'},
  'items':[{'sku':'X','name':'Thing','category':'merch','grossValue':50,'quantity':1}],
  'customerData':{'email':addr('wei')}}},tok)
st=call('GET',f'/api/default/member/{uid}/status',tok=tok)
check('the assigned tier is STILL held after a purchase', st['levelName']=='Tier 2', st['levelName'])
call('POST','/api/default/points/add',{'transfer':{'customer':uid,'points':9999,'comment':'x'}},tok)
st=call('GET',f'/api/default/member/{uid}/status',tok=tok)
check('and still Tier 2 after a big points grant', st['levelName']=='Tier 2', st['levelName'])

print('\n— Releasing the hold —')
st=call('POST',f'/api/default/member/{uid}/remove-manually-level',{},tok)
check('releasing the hold returns a union member to Tier 2 on membership alone',
      st['levelName']=='Tier 2' and st['levelManuallyAssigned'] is False, st['levelName'])
st=call('POST',f'/api/default/member/{uid}/tier',{'levelId':tiers['Tier 2']['levelId']},tok)
check('can be put back by explicit assignment', st['levelName']=='Tier 2')

print('\n— Enrolment is one-shot —')
try:
    call('POST','/api/default/member/register',{'customer':{'firstName':'Wei','lastName':'Lim',
       'email':addr('wei'),'plainPassword':'pw','agreement1':True}})
    check('re-registering the same email is rejected', False)
except urllib.error.HTTPError as e:
    check('re-registering the same email is rejected', e.code==400)

print('\n— Through the BFF, as the member app calls it —')
BFF='http://localhost:4000'
def bff(m,p,b=None):
    r=urllib.request.Request(BFF+p,method=m,data=json.dumps(b).encode() if b is not None else None,
        headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(r) as x:
        raw=x.read().decode(); return json.loads(raw) if raw else {}
t=bff('GET','/api/tiers')['tiers']
check('BFF serves the ladder with ranks', [(x['name'],x['rank']) for x in t]==[('Tier 1',1),('Tier 2',2)], str([(x['name'],x['rank']) for x in t]))
check('Tier 2 is gated on union membership as well as spend',
      t[1]['conditions'][0]['value']==1500, json.dumps(t[1]['conditions']))
p1=bff('POST','/api/auth/register',{'firstName':'B','lastName':'Pub','email':addr('bffpub'),'password':'ntuc-club-demo','loyaltyCardNumber':'NCB1'+RUN,'labels':[]})
check('public enrols Tier 1 with 250, settled in the register response',
      p1['account']['levelName']=='Tier 1' and p1['account']['points']==250 and p1['enrolment']['welcomePoints']==250,
      "%s / %s" % (p1['account']['levelName'], p1['account']['points']))
u1=bff('POST','/api/auth/register',{'firstName':'B','lastName':'Uni','email':addr('bffuni'),'password':'ntuc-club-demo','loyaltyCardNumber':'NCB2'+RUN,'labels':[{'key':'customerType','value':'union_member'}]})
check('union enrols straight into Tier 2 with 500, settled in the register response',
      u1['account']['levelName']=='Tier 2' and u1['account']['points']==500 and u1['enrolment']['welcomePoints']==500,
      "%s / %s" % (u1['account']['levelName'], u1['account']['points']))
check('and the BFF reports its rank from the ladder', u1['account']['levelSortOrder']==2)
personas=bff('GET','/api/demo/personas')['personas']
check('every seeded persona is discoverable',
      sorted(x['personaId'] for x in personas)==['existing_public','existing_union','spender_in_progress'],
      str(sorted(x['personaId'] for x in personas)))
prog=[x for x in personas if x['personaId']=='spender_in_progress'][0]
check('the in-progress persona is a public member still climbing',
      prog['levelName']=='Tier 1' and prog['union'] is False, prog['levelName'])
s=bff('POST','/api/demo/personas/existing_union/session')
check('resuming a persona returns a real tier and balance',
      s['account']['levelName']=='Tier 2' and s['account']['points']>0,
      "%s / %s" % (s['account']['levelName'], s['account']['points']))

print('\n'+('ALL CHECKS PASSED' if not fails else f'{len(fails)} FAILED: {fails}'))
