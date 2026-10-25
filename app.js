const audio=document.querySelector('#audio'),$=s=>document.querySelector(s);let tracks=[],current=0,loop=false,scrubbing=false;
const fmt=t=>Number.isFinite(t)?`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`:'—:—';
function sync(){ $('#play').textContent=audio.paused?'▶':'Ⅱ';$('#play').setAttribute('aria-label',audio.paused?'播放':'暂停');document.querySelectorAll('.track').forEach((b,i)=>{b.classList.toggle('active',i===current);b.setAttribute('aria-current',i===current?'true':'false');b.querySelector('.icon').textContent=i===current&&!audio.paused?'播放中':'▶';});}
function select(i,start=true){current=(i+tracks.length)%tracks.length;scrubbing=false;audio.src=tracks[current].src;$('#title').textContent=tracks[current].name;$('#number').textContent=`${String(current+1).padStart(2,'0')} / ${tracks.length}`;$('#seek').value=0;$('#seek').style.setProperty('--progress','0%');$('#seek').disabled=true;$('#elapsed').textContent='0:00';$('#duration').textContent='—:—';$('#status').textContent='点击播放，开始试听';if('mediaSession'in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:tracks[current].name,album:'星际听音室'});}sync();if(start)play();}
async function play(){try{await audio.play();}catch(e){if(e.name!=='AbortError')$('#status').textContent='轻触播放重试，或在手机浏览器中打开';}}
$('#play').onclick=()=>{if(tracks.length)audio.paused?play():audio.pause();};$('#prev').onclick=()=>tracks.length&&select(current-1);$('#next').onclick=()=>tracks.length&&select(current+1);
$('#repeat').onclick=()=>{loop=!loop;audio.loop=loop;$('#repeat').setAttribute('aria-pressed',String(loop));$('#repeat').textContent=loop?'单曲':'循环';$('#repeat').setAttribute('aria-label',loop?'关闭单曲循环':'开启单曲循环');};
const seek=$('#seek');
function paintSeek(t){seek.value=t;seek.style.setProperty('--progress',`${audio.duration>0?t/audio.duration*100:0}%`);$('#elapsed').textContent=fmt(t);seek.setAttribute('aria-valuetext',`${fmt(t)} / ${fmt(audio.duration)}`);}
function metadata(){const ready=Number.isFinite(audio.duration)&&audio.duration>0;seek.disabled=!ready;seek.max=ready?audio.duration:100;$('#duration').textContent=fmt(audio.duration);if(!scrubbing)paintSeek(audio.currentTime);}
seek.onpointerdown=()=>{if(!seek.disabled)scrubbing=true;};
seek.oninput=()=>{scrubbing=true;paintSeek(Number(seek.value));};
function commitSeek(){if(!scrubbing)return;const t=Number(seek.value);scrubbing=false;if(Number.isFinite(audio.duration)){audio.currentTime=Math.max(0,Math.min(t,audio.duration));paintSeek(audio.currentTime);}}
seek.onchange=commitSeek;seek.onpointerup=commitSeek;seek.onblur=commitSeek;
seek.onpointercancel=()=>{scrubbing=false;paintSeek(audio.currentTime);};
audio.onloadedmetadata=metadata;audio.ondurationchange=metadata;
audio.ontimeupdate=()=>{if(!scrubbing)paintSeek(audio.currentTime);};
audio.onseeked=()=>{if(!scrubbing)paintSeek(audio.currentTime);$('#status').textContent=audio.paused?'已暂停':'正在播放';};
audio.onplay=()=>{$('#status').textContent='正在播放';sync();};audio.onpause=()=>{$('#status').textContent='已暂停';sync();};audio.onwaiting=()=>$('#status').textContent='正在加载音乐…';audio.onplaying=()=>$('#status').textContent='正在播放';audio.onerror=()=>{$('#status').textContent='加载失败，请检查网络后再次点击歌曲';sync();};audio.onended=()=>select(current+1);
$('#share').onclick=async()=>{try{if(navigator.share)await navigator.share({title:'星际听音室 · 太空音乐',url:location.href});else{await navigator.clipboard.writeText(location.href);$('#status').textContent='链接已复制，发送给朋友即可';}}catch(e){if(e.name!=='AbortError')$('#status').textContent='请复制浏览器地址栏链接分享';}};
fetch('tracks.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{tracks=data;tracks.forEach((t,i)=>{const b=document.createElement('button');b.className='track';b.innerHTML=`<span class="index">${String(i+1).padStart(2,'0')}</span><span class="name"></span><span class="icon">▶</span>`;b.querySelector('.name').textContent=t.name;b.setAttribute('aria-label','播放 '+t.name);b.onclick=()=>i===current?(audio.paused?play():audio.pause()):select(i);$('#list').append(b);});select(0,false);}).catch(()=>$('#status').textContent='歌单加载失败，请刷新页面');
if('mediaSession'in navigator){for(const [action,fn]of Object.entries({play:()=>play(),pause:()=>audio.pause(),previoustrack:()=>select(current-1),nexttrack:()=>select(current+1)})){try{navigator.mediaSession.setActionHandler(action,fn);}catch{}}}

if('ResizeObserver' in window){new ResizeObserver(entries=>{document.documentElement.style.setProperty('--dock-height',`${entries[0].target.getBoundingClientRect().height}px`);}).observe(document.querySelector('.details'));}
