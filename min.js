let t=0,e=0,n=[],r=[],o=0,s=[];const u=(e,n=document)=>{const r=n.querySelector(e);return{get val(){return r},get class(){return r.classList},html:(e,...n)=>{let o=[e[0],n.map(((t,n)=>[t,e[n+1]]))].flat(1/0),s=[],c=[];o.forEach((e=>{if(void 0===e)return;if("function"!=typeof e)return s.push(e+"");const n=t++;c.push((()=>e(u(`#u${n}`)))),s.push(`<div id="u${n}"></div>`)})),r.innerHTML=s.join(""),c.forEach((t=>t()))},q:t=>u(t,r),on:(t,e)=>r.addEventListener(t,e)}},c=t=>{const u=e++;return n[u]=n[u]??t,r[u]=r[u]??new Set,{get val(){return r[u].add(o-1),n[u]},set val(t){n[u]=t,e=u+1,r[u].forEach((t=>s[t]()))}}},a=t=>{const e=o++;s[e]=()=>{o=e+1,t()},t()};export{u as q,c as store,a as watch};
