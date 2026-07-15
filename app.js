const gear = [
  { name: 'EOS R6 Mark III', maker: 'Canon', type: 'camera', details: 'FULL-FRAME · 24.2 MP · RF MOUNT', price: '$2,899', slug: 'canon-eos-r6-mark-iii' },
  { name: 'X100VI', maker: 'Fujifilm', type: 'camera', details: 'APS-C · 40.2 MP · FIXED 23MM F/2', price: '$1,599', slug: 'fujifilm-x100vi' },
  { name: 'a7 V', maker: 'Sony', type: 'camera', details: 'FULL-FRAME · 33 MP · E MOUNT', price: '$2,899', slug: 'sony-a7-v' },
  { name: 'Z6II', maker: 'Nikon', type: 'camera', details: 'FULL-FRAME · 24.5 MP · Z MOUNT', price: '$1,997', slug: 'nikon-z6ii' },
  { name: 'Lumix G9', maker: 'Panasonic', type: 'camera', details: 'MICRO FOUR THIRDS · 20.3 MP', price: '$998', slug: 'panasonic-lumix-g9' },
  { name: 'NIKKOR Z 50mm f/1.4', maker: 'Nikon', type: 'lens', details: '50MM · F/1.4 · Z MOUNT · AF', price: '$497', slug: 'nikon-nikkor-z-50mm-f-1-4' },
  { name: 'RF 20-50mm F4 L IS USM PZ', maker: 'Canon', type: 'lens', details: '20–50MM · F/4 · RF MOUNT · POWER ZOOM', price: '—', slug: 'canon-rf-20-50mm-f4-l-is-usm-pz' },
  { name: 'FE 24-70mm f/2.8 GM II', maker: 'Sony', type: 'lens', details: '24–70MM · F/2.8 · E MOUNT · AF', price: '$2,298', slug: 'sony-fe-24-70mm-f-2-8-gm-ii' },
  { name: 'AF-S DX NIKKOR 35mm f/1.8G', maker: 'Nikon', type: 'lens', details: '35MM · F/1.8 · F MOUNT · AF', price: '$197', slug: 'nikon-af-s-dx-nikkor-35mm-f-1-8g' },
  { name: 'MC Rokkor-X PF 50mm f/1.7', maker: 'Minolta', type: 'lens', details: '50MM · F/1.7 · SR MOUNT · MANUAL', price: '—', slug: 'minolta-mc-rokkor-x-pf-50mm-f-1-7' }
];

const input = document.querySelector('#search'); const list = document.querySelector('#results'); const empty = document.querySelector('#empty'); const status = document.querySelector('#result-status'); const siteSearch = document.querySelector('#site-search'); let type = 'all'; let selected = 0; let matches = [];
for (const kind of ['all','camera','lens']) document.querySelector(`#${kind}-count`).textContent = kind === 'all' ? gear.length : gear.filter(x => x.type === kind).length;
const url = item => `https://www.sharplyphoto.com/gear/${item.slug}`;
function render() { const query = input.value.trim().toLowerCase(); matches = gear.filter(item => (type === 'all' || item.type === type) && `${item.name} ${item.maker} ${item.details}`.toLowerCase().includes(query)); selected = Math.min(selected, Math.max(matches.length - 1, 0)); status.textContent = query ? `${matches.length} ${matches.length === 1 ? 'match' : 'matches'} in quick search` : type === 'all' ? 'Popular on Sharply' : `${type === 'camera' ? 'Cameras' : 'Lenses'} on Sharply`; empty.hidden = matches.length > 0; siteSearch.hidden = !query; list.innerHTML = matches.map((item, i) => `<li class="result ${i === selected ? 'selected' : ''}" data-index="${i}" tabindex="0"><span class="type">${item.type === 'camera' ? 'C' : 'L'}</span><span><span class="gear-name">${item.name}<span class="maker">${item.maker}</span></span><span class="details">${item.details}</span></span><span class="price">${item.price}<span class="arrow">→</span></span></li>`).join(''); }
function openSelected() { if (matches[selected]) window.open(url(matches[selected]), '_blank', 'noopener'); }
document.querySelector('.filters').addEventListener('click', e => { const button = e.target.closest('.filter'); if (!button) return; type = button.dataset.type; selected = 0; document.querySelectorAll('.filter').forEach(x => x.classList.toggle('active', x === button)); render(); });
input.addEventListener('input', () => { selected = 0; render(); });
list.addEventListener('click', e => { const row = e.target.closest('.result'); if (!row) return; selected = Number(row.dataset.index); openSelected(); });
document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.focus(); input.select(); } if (e.key === 'Escape') { input.value = ''; input.blur(); selected = 0; render(); } if (e.key === 'ArrowDown') { e.preventDefault(); selected = Math.min(selected + 1, matches.length - 1); render(); } if (e.key === 'ArrowUp') { e.preventDefault(); selected = Math.max(selected - 1, 0); render(); } if (e.key === 'Enter' && document.activeElement !== siteSearch) openSelected(); });
siteSearch.addEventListener('click', () => { const q = encodeURIComponent(`site:sharplyphoto.com/gear ${input.value}`); window.open(`https://www.google.com/search?q=${q}`, '_blank', 'noopener'); });
render();
