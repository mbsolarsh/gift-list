const $ = (id) => document.getElementById(id);
let items = [];

fetch('items.json', { cache: 'no-store' })
  .then((r) => r.json())
  .then((data) => { items = data; initCategories(); render(); })
  .catch(() => { $('count').textContent = 'Could not load items.json'; });

function initCategories() {
  [...new Set(items.map((i) => i.category).filter(Boolean))].sort().forEach((c) => {
    const o = document.createElement('option'); o.value = o.textContent = c; $('category').appendChild(o);
  });
}

function render() {
  const q = $('search').value.toLowerCase().trim();
  const cat = $('category').value;
  const sort = $('sort').value;
  let list = items.filter((i) =>
    (!cat || i.category === cat) &&
    (!q || [i.name, i.description, i.note, i.category, i.store].join(' ').toLowerCase().includes(q)));

  if (sort === 'price-asc') list.sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9));
  else if (sort === 'price-desc') list.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
  else list.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));

  $('grid').innerHTML = '';
  list.forEach((i) => $('grid').appendChild(card(i)));
  $('empty').hidden = list.length > 0;
  $('count').textContent = `${list.length} gift${list.length === 1 ? '' : 's'}`;
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function card(i) {
  const c = el('article', 'card');
  const w = el('div', 'imgwrap');
  let imgEl = null;
  if (i.image) {
    imgEl = el('img'); imgEl.src = i.image; imgEl.alt = i.name; imgEl.loading = 'lazy'; w.appendChild(imgEl);
  } else w.appendChild(el('div', 'ph', '🎁'));
  c.appendChild(w);
  const b = el('div', 'body');
  b.appendChild(el('h2', '', (i.favorite ? '⭐ ' : '') + i.name));
  const priceEl = el('div', 'price');
  b.appendChild(priceEl);
  if (i.description) b.appendChild(el('p', 'desc', i.description));
  const noteEl = el('p', 'note');
  b.appendChild(noteEl);
  const m = el('div', 'meta');
  if (i.category) m.appendChild(el('span', 'tag', i.category));
  if (i.store) m.appendChild(el('span', 'tag store', i.store));
  b.appendChild(m);

  const a = el('a', 'btn', 'View item ↗');
  a.target = '_blank'; a.rel = 'noopener noreferrer';

  const variants = i.variants || [];
  const show = (v) => {
    const price = v.price != null ? v.price : i.price;
    priceEl.textContent = price != null ? `$${Number(price).toFixed(2)}` : 'See link for price';
    noteEl.textContent = v.label ? `${i.variantLabel || 'Size'}: ${v.label}` : (i.note || '');
    noteEl.hidden = !noteEl.textContent;
    if (imgEl && v.image) imgEl.src = v.image;
    const url = v.url || i.url;
    if (url) a.href = url;
    a.hidden = !url;
  };

  if (variants.length) {
    const row = el('div', 'variants');
    const btns = variants.map((v) => {
      const bt = el('button', 'variant', v.label);
      bt.type = 'button';
      bt.addEventListener('click', () => {
        btns.forEach((x) => x.classList.toggle('active', x === bt));
        show(v);
      });
      row.appendChild(bt);
      return bt;
    });
    priceEl.after(row);
    btns[0].classList.add('active');
    show(variants[0]);
  } else {
    show({ label: '', price: i.price, url: i.url });
  }
  b.appendChild(a);
  c.appendChild(b);
  return c;
}

['search', 'category', 'sort'].forEach((id) => $(id).addEventListener('input', render));
