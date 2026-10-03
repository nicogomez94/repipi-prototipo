const PAGE = document.body.dataset.page;
const WHATSAPP = '5491153770927';
const money = new Intl.NumberFormat('es-AR', {style:'currency',currency:'ARS',maximumFractionDigits:0});
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fold = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let revealObserver;
function observeReveals(scope=document){
  const elements=scope.querySelectorAll('.fade-in:not(.visible)');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { elements.forEach(el=>el.classList.add('visible')); return; }
  if(!revealObserver) revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px 35px 0px'});
  elements.forEach(el=>revealObserver.observe(el));
}
function card(product, featured=false){
  const category=product.categories.at(-1) || 'Repipi';
  return `<a class="product-card fade-in" href="producto.html?id=${product.id}" aria-label="Ver ${escapeHtml(product.name)}"><div class="product-media"><img src="${product.image || 'assets/hero-conjunto.jpg'}" alt="${escapeHtml(product.name)}" loading="lazy"><span class="product-badge">${featured?'favorito ✳':'repipi ✳'}</span><span class="product-quick"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></span></div><div class="product-info"><small>${escapeHtml(category)}</small><h3>${escapeHtml(product.name)}</h3><strong>${money.format(product.price)}</strong></div></a>`;
}
function setupMenu(){
  const button=document.querySelector('.menu-toggle'),menu=document.querySelector('.mobile-nav');
  if(!button||!menu)return;
  button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));button.setAttribute('aria-label',open?'Abrir menú':'Cerrar menú');button.querySelector('i').className=open?'fa-solid fa-bars':'fa-solid fa-xmark';menu.hidden=open});
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.hidden=true;button.setAttribute('aria-expanded','false');button.querySelector('i').className='fa-solid fa-bars'}));
}
function setupHome(){
  const groups={favoritos:[9452,9405,9102,290],recien:[290,1163,82,1159],abrigo:[9405,910,797,960]};
  const grid=document.getElementById('featured-products');
  const tabs=document.querySelectorAll('.collection-tabs button');
  function showGroup(group){
    grid.innerHTML=(groups[group]||groups.favoritos).map(id=>PRODUCTS.find(p=>p.id===id)).filter(Boolean).map(p=>card(p,true)).join('');
    tabs.forEach(button=>{const active=button.dataset.feature===group;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
    observeReveals(grid);
  }
  tabs.forEach(button=>button.addEventListener('click',()=>showGroup(button.dataset.feature)));
  showGroup('favoritos');
  const slides=[
    {eyebrow:'NUEVA FORMA DE JUGAR',title:'Pequeñas<br>prendas, <em>grandes<br>aventuras.</em>',highlight:'<strong>Comodidad + color</strong> para cada día.',desc:'Ropa suave, alegre y lista para acompañar cada descubrimiento. Desde prematuros hasta los 3 años.',image:'assets/children/hero-duo.png',alt:'Dos peques con ropa colorida disfrutando de la música',href:'productos.html'},
    {eyebrow:'DESDE EL PRIMER DÍA',title:'Un mundo<br>suave para <em>crecer<br>jugando.</em>',highlight:'<strong>Mucho amor</strong> en cada prenda.',desc:'Ajuar, enteritos y básicos cómodos para sus primeros grandes momentos.',image:'assets/children/category-recien-nacido.png',alt:'Bebé sonriente con enterito celeste',href:'productos.html?categoria=Recién%20nacido'},
    {eyebrow:'COLOR SIN REGLAS',title:'Más color,<br>más risas, <em>más<br>Repipi.</em>',highlight:'<strong>Libres de jugar</strong> todo el día.',desc:'Prendas con personalidad para explorar, moverse y ser quien quieran.',image:'assets/children/category-abrigo.png',alt:'Peque sonriente con abrigo a cuadros',href:'productos.html?categoria=Abrigo'}
  ];
  let active=0;const dots=[...document.querySelectorAll('.hero-dots button')];
  function showSlide(index){active=(index+slides.length)%slides.length;const slide=slides[active];document.getElementById('hero-eyebrow').textContent=slide.eyebrow;document.getElementById('hero-title').innerHTML=slide.title;document.querySelector('.hero-highlight').innerHTML=slide.highlight;document.getElementById('hero-desc').textContent=slide.desc;const image=document.getElementById('hero-image');image.src=slide.image;image.alt=slide.alt;document.getElementById('hero-cta').href=slide.href;dots.forEach((dot,i)=>{dot.classList.toggle('active',i===active);dot.setAttribute('aria-pressed',String(i===active))})}
  document.querySelector('.hero-prev').addEventListener('click',()=>showSlide(active-1));
  document.querySelector('.hero-next').addEventListener('click',()=>showSlide(active+1));
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>showSlide(i)));
}
function setupCatalog(){
  const categories=['Todos','Bebés','Recién nacido','Abrigo','Accesorios','Línea prematuros','Colegial'];
  const params=new URLSearchParams(location.search);let active=categories.includes(params.get('categoria'))?params.get('categoria'):'Todos';
  const filterBox=document.getElementById('category-filters'),search=document.getElementById('product-search'),sort=document.getElementById('product-sort'),grid=document.getElementById('catalog-products'),count=document.getElementById('result-count'),empty=document.getElementById('empty-state');
  filterBox.innerHTML=categories.map(cat=>`<button type="button" class="filter-pill ${active===cat?'active':''}" data-category="${escapeHtml(cat)}" aria-pressed="${active===cat}">${escapeHtml(cat)}</button>`).join('');
  function update(){
    let items=PRODUCTS.filter(p=>(active==='Todos'||p.categories.includes(active))&&fold(p.name+' '+p.categories.join(' ')).includes(fold(search.value.trim())));
    if(sort.value==='price-asc')items.sort((a,b)=>a.price-b.price);
    if(sort.value==='price-desc')items.sort((a,b)=>b.price-a.price);
    if(sort.value==='name')items.sort((a,b)=>a.name.localeCompare(b.name,'es'));
    grid.innerHTML=items.map(p=>card(p)).join('');count.textContent=`${items.length} ${items.length===1?'producto':'productos'}`;empty.hidden=items.length!==0;observeReveals(grid);
  }
  filterBox.addEventListener('click',e=>{const button=e.target.closest('button[data-category]');if(!button)return;active=button.dataset.category;filterBox.querySelectorAll('button').forEach(b=>{const selected=b===button;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected))});const url=new URL(location);if(active==='Todos')url.searchParams.delete('categoria');else url.searchParams.set('categoria',active);history.replaceState(null,'',url);update()});
  search.addEventListener('input',update);sort.addEventListener('change',update);update();
}
function setupProduct(){
  const id=Number(new URLSearchParams(location.search).get('id'))||9452;
  const p=PRODUCTS.find(item=>item.id===id)||PRODUCTS.find(item=>item.id===9452)||PRODUCTS[0];
  document.title=`${p.name} · Repipi`;
  document.querySelector('meta[name="description"]').content=`${p.name} de Repipi. Conocé sus detalles y consultanos por talle, color y disponibilidad.`;
  document.getElementById('crumb-name').textContent=p.name;
  document.getElementById('product-name').textContent=p.name;
  document.getElementById('product-price').textContent=money.format(p.price);
  document.getElementById('product-category').textContent=(p.categories.at(-1)||'Repipi').toUpperCase();
  document.getElementById('product-description').textContent=p.description||'Una prenda cómoda y llena de color para acompañar cada aventura.';
  const main=document.getElementById('main-product-image');main.src=p.image||'assets/hero-conjunto.jpg';main.alt=p.name;
  const images=[p.image,...p.gallery.slice(1)].filter(Boolean).slice(0,4);
  const thumbs=document.getElementById('gallery-thumbs');
  thumbs.innerHTML=images.map((src,i)=>`<button type="button" class="${i===0?'active':''}" data-image="${escapeHtml(src)}" aria-label="Ver imagen ${i+1} de ${escapeHtml(p.name)}"><img src="${escapeHtml(src)}" alt="" loading="lazy"></button>`).join('');
  thumbs.addEventListener('click',e=>{const button=e.target.closest('button[data-image]');if(!button)return;main.src=button.dataset.image;thumbs.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button))});
  const options=document.getElementById('product-options');
  const attrs=Object.entries(p.attributes).filter(([,values])=>values.length);
  options.innerHTML=attrs.length?attrs.map(([name,values])=>`<div class="option-group"><label>${escapeHtml(name)}</label><div class="option-list">${values.map((value,i)=>`<button type="button" class="option-chip ${i===0?'selected':''}" data-option="${escapeHtml(name)}" data-value="${escapeHtml(value)}" aria-pressed="${i===0}">${escapeHtml(value)}</button>`).join('')}</div></div>`).join(''):'<p>Consultanos por colores y talles disponibles.</p>';
  function updateWhatsApp(){const choices=[...options.querySelectorAll('.option-chip.selected')].map(b=>`${b.dataset.option}: ${b.dataset.value}`).join(', ');document.getElementById('inquire-link').href=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`¡Hola! Quiero consultar por ${p.name}${choices?' ('+choices+')':''}.`)}`}
  options.addEventListener('click',e=>{const button=e.target.closest('.option-chip');if(!button)return;options.querySelectorAll(`[data-option="${CSS.escape(button.dataset.option)}"]`).forEach(b=>{const selected=b===button;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected))});updateWhatsApp()});updateWhatsApp();
  const related=PRODUCTS.filter(item=>item.id!==p.id && item.categories.some(cat=>p.categories.includes(cat))).slice(0,4);
  document.getElementById('related-products').innerHTML=related.map(item=>card(item)).join('');
}
setupMenu();if(PAGE==='home')setupHome();if(PAGE==='catalog')setupCatalog();if(PAGE==='product')setupProduct();observeReveals();
