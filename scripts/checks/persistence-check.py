"""Does Postgres actually buy us what in-memory could not?

Two properties, and nothing else matters if these fail:
  1. State survives a restart of the service.
  2. Two instances of the service agree, because they share one database.
"""
import json, os, subprocess, time, urllib.request

def kill_port(port):
    """Kill whatever holds the port.

    `pkill -f mock-openloyalty` matches the npm wrapper, not the tsx child that
    actually binds — so the old listener survives, the replacement fails to bind
    and dies, and every assertion afterwards is measuring the wrong process.
    """
    out=subprocess.run(['lsof','-ti',f':{port}'],capture_output=True,text=True).stdout.split()
    for pid in out:
        subprocess.run(['kill','-9',pid],capture_output=True)
    time.sleep(2)

def start(port):
    # Env is inherited explicitly: DATABASE_URL decides whether this test is
    # testing anything at all.
    return subprocess.Popen(['npm','run','dev','--workspace','apps/mock-openloyalty'],
        env=dict(os.environ, PORT=str(port)), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

A='http://localhost:8181'; B='http://localhost:8182'
if not os.environ.get('DATABASE_URL'):
    raise SystemExit('DATABASE_URL is not set — this test would prove nothing.')
RUN=os.urandom(3).hex()
fails=[]
def check(l,ok,d=''):
    print(('  PASS  ' if ok else '  FAIL  ')+l+(f'  [{d}]' if d else ''))
    if not ok: fails.append(l)
def call(base,m,p,b=None,tok=None):
    r=urllib.request.Request(base+p,method=m,data=json.dumps(b).encode() if b is not None else None,
      headers={'Content-Type':'application/json',**({'Authorization':'Bearer '+tok} if tok else {})})
    with urllib.request.urlopen(r) as x:
        raw=x.read().decode(); return json.loads(raw) if raw else {}
def wait(base, secs=40):
    for _ in range(secs*2):
        try:
            urllib.request.urlopen(base+'/api/healthcheck', timeout=2); return True
        except Exception: time.sleep(0.5)
    return False

tok=lambda base: call(base,'POST','/api/admin/login_check',{'username':'admin','password':'admin'})['token']

print('— A member registered now must outlive the process —')
email=f'durable-{RUN}@example.com'
reg=call(A,'POST','/api/default/member/register',{'customer':{'firstName':'Dura','lastName':'Ble',
  'email':email,'plainPassword':'pw','agreement1':True,
  'labels':[{'key':'customerType','value':'union_member'}]}})
cid=reg['customerId']
check('registered, admitted to Tier 2 with 500 pts',
      reg['status']['levelName']=='Tier 2' and reg['status']['activePoints']==500,
      f"{reg['status']['levelName']} / {reg['status']['activePoints']}")

kill_port(8181); start(8181)
check('service came back up', wait(A))
st=call(A,'GET',f'/api/default/member/{cid}/status',tok=tok(A))
check('the member survived the restart, with tier and points intact',
      st['levelName']=='Tier 2' and st['activePoints']==500,
      f"{st['levelName']} / {st['activePoints']}")

print('\n— Two instances, one database, one truth —')
kill_port(8182); start(8182)
check('second instance came up on :8182', wait(B))
for name, base in (('A', A), ('B', B)):
    hc=call(base,'GET','/api/healthcheck')
    check(f'instance {name} is backed by postgres', hc.get('storage')=='postgres', hc.get('storage'))
email2=f'shared-{RUN}@example.com'
call(A,'POST','/api/default/member/register',{'customer':{'firstName':'Sha','lastName':'Red',
  'email':email2,'plainPassword':'pw','agreement1':True}})
seen=[m for m in call(B,'GET','/api/default/member',tok=tok(B))['items'] if m['email']==email2]
check('a member written to instance A is visible on instance B',
      len(seen)==1 and seen[0]['activePoints']==250,
      f"{seen[0]['levelName']}/{seen[0]['activePoints']}" if seen else 'NOT FOUND')

# A till publishing to one instance must move points the other instance reports.
call(B,'POST','/api/default/transaction',{'transaction':{
  'header':{'documentNumber':f'X-{RUN}','documentType':'sell','purchasedAt':'2026-08-18T06:00:00.000Z'},
  'items':[{'sku':'S','name':'Spend','category':'general','grossValue':60,'quantity':1}],
  'customerData':{'email':email2}}}, tok(B))
after=[m for m in call(A,'GET','/api/default/member',tok=tok(A))['items'] if m['email']==email2][0]
check('a sale published to B is reflected by A', after['activePoints']==310, str(after['activePoints']))

print('\n— Reset returns a clean programme —')
call(A,'POST','/api/default/admin/reset',{},tok(A))
members=call(A,'GET','/api/default/member',tok=tok(A))['items']
check('reset reseeds to the three demo personas', len(members)==3, str(len(members)))

kill_port(8182)
print('\n'+('ALL CHECKS PASSED' if not fails else f'{len(fails)} FAILED: {fails}'))
