const $ = (id) => document.getElementById(id);
let items = [];

fetch('items.json')
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
  if (i.image) {
    const img = el('img'); img.src = i.image; img.alt = i.name; img.loading = 'lazy'; w.appendChild(img);
  } else w.appendChild(el('div', 'ph', '🎁'));
  c.appendChild(w);
  const b = el('div', 'body');
  b.appendChild(el('h2', '', (i.favorite ? '⭐ ' : '') + i.name));
  b.appendChild(el('div', 'price', i.price != null ? `$${i.price}` : 'Price varies'));
  if (i.description) b.appendChild(el('p', 'desc', i.description));
  if (i.note) b.appendChild(el('p', 'note', i.note));
  const m = el('div', 'meta');
  if (i.category) m.appendChild(el('span', 'tag', i.category));
  if (i.store) m.appendChild(el('span', 'tag store', i.store));
  b.appendChild(m);
  if (i.url) {
    const a = el('a', 'btn', 'View item ↗');
    a.href = i.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; b.appendChild(a);
  }
  c.appendChild(b);
  return c;
}

['search', 'category', 'sort'].forEach((id) => $(id).addEventListener('input', render));
