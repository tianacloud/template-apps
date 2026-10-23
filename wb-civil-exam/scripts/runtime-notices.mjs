import {readFileSync} from 'node:fs';

// Inspect rendered modules rather than package.json development dependencies.
export function runtimeNotices(mode) {
  const notices=readFileSync(new URL('../THIRD_PARTY_NOTICES',import.meta.url),'utf8');
  return {
    name:'runtime-license-notices',
    generateBundle(_options,bundle) {
      const inputs=[];
      for(const output of Object.values(bundle)) {
        if(output.type!=='chunk')continue;
        for(const [id,info] of Object.entries(output.modules)) {
          if(info.renderedLength>0 && id.includes('/node_modules/'))
            inputs.push({file:id.split('/node_modules/').at(-1),renderedBytes:info.renderedLength});
        }
      }
      const packages=[...new Set(inputs.map(({file})=>file.startsWith('@')?file.split('/').slice(0,2).join('/'):file.split('/')[0]))].sort();
      if(packages.some(name=>name!=='@tianacloud/serverless'))throw Error('Additional bundled runtime dependency needs a license review: '+packages.join(', '));
      if(packages.length) {
        const banner='/*!\n'+notices.replaceAll('*/','* /')+'\n*/\n';
        for(const output of Object.values(bundle))if(output.type==='chunk')output.code=banner+output.code;
        this.emitFile({type:'asset',fileName:'THIRD_PARTY_NOTICES.txt',source:notices});
      }
      console.log('RUNTIME_LICENSE_AUDIT '+JSON.stringify({mode,packages,inputs,noticeIncluded:packages.length>0}));
    }
  };
}
