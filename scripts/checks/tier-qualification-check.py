import datetime, json, os, time, urllib.request, urllib.error
def now():
    # Fresh per call: a purchase must land inside the member's qualification
    # period, which only opens when they register.
    return datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z')
B='http://localhost:8181'; RUN=os.urandom(4).hex()
def call(m,p,b=None,tok=None):
    r=urllib.request.Request(B+p,method=m,data=json.dumps(b).encode() if b is not None else None,
      headers={'Content-Type':'application/json',**({'Authorization':'Bearer '+tok} if tok else {})})
    with urllib.request.urlopen(r) as x:
        raw=x.read().decode(); return json.loads(raw) if raw else {}
fails=[]
def check(l,ok,d=''):
    print(('  PASS  ' if ok else '  FAIL  ')+l+(f'  [{d}]' if d else '')); 
    if not ok: fails.append(l)
def addr(n): return f'{n}-{RUN}@example.com'
def buy(email, amount, n):
    call('POST','/api/default/transaction',{'transaction':{
      'header':{'documentNumber':f'T-{RUN}-{n}','documentType':'sell','purchasedAt':now()},
      'items':[{'sku':'X','name':'Thing','category':'electronics','grossValue':amount,'quantity':1}],
      'customerData':{'email':email}}},tok)

tok=call('POST','/api/admin/login_check',{'username':'admin','password':'admin'})['token']
tiers={t['name']:t for t in call('GET','/api/default/tier',tok=tok)['items']}
sid=call('GET','/api/default/tierSet',tok=tok)['items'][0]['tierSetId']
print('Tier 2 gate:', tiers['Tier 2']['conditions'], tiers['Tier 2'].get('requiredLabels'))

print('\n— A union member is admitted to Tier 2 outright —')
u=call('POST','/api/default/member/register',{'customer':{'firstName':'U','lastName':'M',
  'email':addr('union'),'plainPassword':'pw','agreement1':True,
  'labels':[{'key':'customerType','value':'union_member'}]}})
uid=u['customerId']
check('union member is admitted to Tier 2 outright, with 500 pts',
      u['status']['levelName']=='Tier 2' and u['status']['activePoints']==500,
      f"{u['status']['levelName']} / {u['status']['activePoints']}")
buy(addr('union'), 1400, 'u1')
st=call('GET',f'/api/default/member/{uid}/status',tok=tok)
check('stays Tier 2 regardless of spend', st['levelName']=='Tier 2', st['levelName'])
buy(addr('union'), 200, 'u2')
st=call('GET',f'/api/default/member/{uid}/status',tok=tok)
check('and still Tier 2 past $1,500', st['levelName']=='Tier 2', st['levelName'])

print('\n— A public member gets there by spending —')
p=call('POST','/api/default/member/register',{'customer':{'firstName':'P','lastName':'M',
  'email':addr('pub'),'plainPassword':'pw','agreement1':True}})
pid=p['customerId']
check('public member starts on Tier 1 with 250 pts',
      p['status']['levelName']=='Tier 1' and p['status']['activePoints']==250,
      f"{p['status']['levelName']} / {p['status']['activePoints']}")
buy(addr('pub'), 5000, 'p1')
st=call('GET',f'/api/default/member/{pid}/status',tok=tok)
check('a public member reaches Tier 2 by spending past $1,500', st['levelName']=='Tier 2', st['levelName'])

print('\n— Progress API (the spec shape) —')
# A member still short of the threshold — the only state with progress to report.
climbing=call('POST','/api/default/member/register',{'customer':{'firstName':'C','lastName':'M',
  'email':addr('climb'),'plainPassword':'pw','agreement1':True}})['customerId']
buy(addr('climb'), 750, 'c1')
pr=call('GET',f'/api/default/member/{climbing}/tierSet/{sid}',tok=tok)
check('reports the next tier and its goal',
      pr['nextTierName']=='Tier 2' and pr['nextTierCurrentProgress'][0]['valueGoal']==1500,
      json.dumps(pr['nextTierCurrentProgress']))
check('no tier is reported as out of reach — spend is open to everyone',
      pr.get('nextTierEligible', True) is True)
check('reports the next recalculation date', bool(pr['nextRecalculationAt']), pr['nextRecalculationAt'])
check('halfway spend reports 50% progress', pr['currentProgress']==50.0, str(pr['currentProgress']))

print('\n— The seeded Tier 2 persona —')
grace=[m for m in call('GET','/api/default/member',tok=tok)['items'] if m['email']=='grace@example.com'][0]
check('Grace holds Tier 2 on real spend, not assignment',
      grace['levelName']=='Tier 2' and grace['levelManuallyAssigned'] is False, grace['levelName'])

print('\n— The annual period does not unseat a union member —')
st=call('GET',f'/api/default/member/{uid}/status',tok=tok)
check('union member is Tier 2 before recalculation', st['levelName']=='Tier 2')
time.sleep(0.05)  # so the new period starts strictly after the purchases
call('POST','/api/default/tier/recalculate-periods',{'member':uid},tok)
st=call('GET',f'/api/default/member/{uid}/status',tok=tok)
check('keeps Tier 2 through recalculation — membership does not reset', st['levelName']=='Tier 2', st['levelName'])

print('\n'+('ALL CHECKS PASSED' if not fails else f'{len(fails)} FAILED: {fails}'))
