// D3 v7 creates the network. Each node has a fixed home position.
// The pointer causes a small, smoothly damped displacement: no constant drifting.
const svg = d3.select('.network');
const hero = document.querySelector('.hero');
const themeButton = document.querySelector('.theme-toggle');
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function createNetwork() {
  const width = hero.clientWidth, height = hero.clientHeight;
  svg.selectAll('*').remove();
  svg.attr('viewBox', `0 0 ${width} ${height}`);
  // Deterministic random positions: the composition stays consistent on reload.
  const rng = d3.randomLcg(0.418);
  const clusters = [
    [.12,.58,.095,.17,65], [.22,.88,.12,.08,42],
    [.74,.18,.11,.10,70], [.89,.54,.12,.20,48],
    [.44,.10,.22,.10,19], [.65,.88,.14,.12,24]
  ];
  const nodes=[];
  clusters.forEach(([cx,cy,sx,sy,count])=>{
    for(let i=0;i<count;i++){
      const x=(cx+(rng()+rng()+rng()-1.5)*sx*1.65)*width;
      const y=(cy+(rng()+rng()+rng()-1.5)*sy*1.65)*height;
      if(x>-20&&x<width+20&&y>-20&&y<height+20)
        nodes.push({x,y,hx:x,hy:y,vx:0,vy:0,r:1.1+rng()*2.8,opacity:.30+rng()*.50});
    }
  });
  for(let i=0;i<50;i++){
    const x=rng()*width,y=rng()*height;
    nodes.push({x,y,hx:x,hy:y,vx:0,vy:0,r:.55+rng()*1.3,opacity:.18+rng()*.28});
  }
  const edges=[];
  const threshold=Math.min(128,width*.10);
  nodes.forEach((a,i)=>{
    const nearest=nodes.map((b,j)=>({j,d:Math.hypot(a.hx-b.hx,a.hy-b.hy)}))
      .filter(o=>o.j!==i&&o.d<threshold).sort((a,b)=>a.d-b.d).slice(0,3);
    nearest.forEach(({j,d})=>{if(j>i)edges.push({a,b:nodes[j],opacity:Math.max(.05,.23*(1-d/threshold))});});
  });
  const edgeEls=svg.append('g').selectAll('line').data(edges).join('line').attr('class','edge')
    .attr('stroke-opacity',d=>d.opacity);
  const nodeEls=svg.append('g').selectAll('circle').data(nodes).join('circle').attr('class','node')
    .attr('r',d=>d.r).attr('opacity',d=>d.opacity);
  let pointer=null, frame=null;
  function draw(){
    edgeEls.attr('x1',d=>d.a.x).attr('y1',d=>d.a.y).attr('x2',d=>d.b.x).attr('y2',d=>d.b.y);
    nodeEls.attr('cx',d=>d.x).attr('cy',d=>d.y);
  }
  function tick(){
    let moving=false;
    for(const n of nodes){
      let tx=n.hx,ty=n.hy;
      if(pointer){
        const dx=n.hx-pointer.x,dy=n.hy-pointer.y,dist=Math.hypot(dx,dy)||1;
        const radius=125;
        if(dist<radius){
          const strength=Math.pow(1-dist/radius,2)*17;
          tx+=(dx/dist)*strength;ty+=(dy/dist)*strength;
        }
      }
      // Soft interpolation with no bounce or oscillation.
      const nextX=n.x+(tx-n.x)*.115, nextY=n.y+(ty-n.y)*.115;
      if(Math.abs(nextX-n.x)+Math.abs(nextY-n.y)>.025)moving=true;
      n.x=nextX;n.y=nextY;
    }
    draw();
    if(moving||pointer){frame=requestAnimationFrame(tick);}else{frame=null;}
  }
  function schedule(){if(!frame&&!prefersReducedMotion)frame=requestAnimationFrame(tick);}
  draw();
  function onMove(e){const r=hero.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top};schedule();}
  function onLeave(){pointer=null;schedule();}
  hero.addEventListener('pointermove',onMove);
  hero.addEventListener('pointerleave',onLeave);
  return ()=>{hero.removeEventListener('pointermove',onMove);hero.removeEventListener('pointerleave',onLeave);if(frame)cancelAnimationFrame(frame);};
}
let cleanup=()=>{};
function refresh(){cleanup();cleanup=createNetwork();}
refresh();
let resizeTimeout;
window.addEventListener('resize',()=>{clearTimeout(resizeTimeout);resizeTimeout=setTimeout(refresh,180);});
const stored=localStorage.getItem('ise-theme');
if(stored==='dark')document.body.dataset.theme='dark';
function syncTheme(){const dark=document.body.dataset.theme==='dark';themeButton.setAttribute('aria-pressed',String(dark));themeButton.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} mode`);}
syncTheme();
themeButton.addEventListener('click',()=>{document.body.dataset.theme=document.body.dataset.theme==='dark'?'light':'dark';localStorage.setItem('ise-theme',document.body.dataset.theme);syncTheme();});
