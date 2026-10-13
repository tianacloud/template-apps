"""Generate independent probability references with mpmath at 80 decimal places."""
import json
from pathlib import Path
import mpmath as mp

mp.mp.dps = 80
def tcdf(z, df):
    z, df = mp.mpf(z), mp.mpf(df)
    beta = mp.betainc(df / 2, mp.mpf('0.5'), 0, df / (df + z*z), regularized=True) / 2
    return beta if z < 0 else 1-beta
def sf(x, model):
    return tcdf((mp.mpf(model['mean'])-x)/mp.mpf(model['scale']),model['df'])
def mass(k, model):
    e = model['conditionOffset'] or 0
    if k <= e or k < 1: return mp.mpf(0)
    return (sf(mp.mpf(k)-mp.mpf('0.5'),model)-sf(mp.mpf(k)+mp.mpf('0.5'),model))/sf(mp.mpf(e)+mp.mpf('0.5'),model)
normal = lambda z: (1+mp.erf(z/mp.sqrt(2)))/2
q = {h: normal((mp.mpf(h)+mp.mpf('0.5')-mp.mpf('12.4'))/mp.mpf('2.4'))-normal((mp.mpf(h)-mp.mpf('0.5')-mp.mpf('12.4'))/mp.mpf('2.4')) for h in range(6,21)}
qsum = sum(q.values()); q = {h:v/qsum for h,v in q.items()}
models = []
for mu, n, std in [('28',4,'0.816496580927726'),('31.25',12,'6.5'),('3.5',4,'1.1')]:
    models.append({'mean':float(mu),'sampleStd':float(std),'scale':float(max(mp.mpf(std),2)*mp.sqrt(1+mp.mpf(1)/n)),'df':n-1,'n':n,'conditionOffset':None})
models += [{**models[0],'conditionOffset':40},{**models[0],'conditionOffset':100000}]
references = []
for model in models:
    e = model['conditionOffset'] or 0
    v = sum(weight*sf(mp.mpf(max(h,e+1))-mp.mpf('0.5'),model)/sf(mp.mpf(e)+mp.mpf('0.5'),model) for h,weight in q.items())
    for k in sorted(set([1,10,25,28,31,40,80,1000,e+1,e+12])):
        references.append({'model':model,'k':k,'mass':float(mass(k,model))})
    for o in [0,4,16,28,max(0,e-12),e+10]:
        references.append({'model':model,'o':o,'ovulationMass':float(sum(weight*mass(o+h,model) for h,weight in q.items())/v)})
Path(__file__).with_name('probability-reference.json').write_text(json.dumps(references,indent=2)+'\n')
