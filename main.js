const STORAGE_KEY = 'cruds.products.v2';
const OLD_KEY = 'product';
const ID_KEY = 'cruds.nextId';
const THEME_KEY = 'cruds.theme';
const PER_PAGE = 10;

let form = document.getElementById('productForm');
let title = document.getElementById('title');
let price = document.getElementById('price');
let taxes = document.getElementById('taxes');
let ads = document.getElementById('ads');
let discount = document.getElementById('discount');
let total = document.getElementById('total');
let count = document.getElementById('count');
let category = document.getElementById('category');
let submit = document.getElementById('submit');
let cancelBtn = document.getElementById('cancelBtn');
let search = document.getElementById('search');
let searchTitleBtn = document.getElementById('searchTitle');
let searchCategoryBtn = document.getElementById('searchCategory');
let sortSelect = document.getElementById('sortSelect');
let exportBtn = document.getElementById('exportBtn');
let deleteAllBtn = document.getElementById('deleteAll');
let tbody = document.getElementById('tbody');
let pagination = document.getElementById('pagination');
let prevBtn = document.getElementById('prevBtn');
let nextBtn = document.getElementById('nextBtn');
let pageInfo = document.getElementById('pageInfo');
let toast = document.getElementById('toast');
let themeBtn = document.getElementById('themeBtn');

let mode = 'create';
let editId = null;
let searchMode = 'title';
let sortKey = 'id';
let sortDir = 'asc';
let currentPage = 1;
let toastTimer;

console.log("%c🚀 Developed by Mark Ehab", "color: #fff; background: #0284c7; font-size: 20px; padding: 10px; border-radius: 5px;");

function round(number) {
  return Math.round(number * 100) / 100;
}

function formatNumber(number) {
  return number.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function toNumber(value) {
  let number = parseFloat(value);
  return isNaN(number) ? 0 : number;
}

function getProductTotal(product) {
  return round(product.price + product.taxes + product.ads - product.discount);
}

function loadProducts() {
  let saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    try {
      let list = JSON.parse(saved);
      return Array.isArray(list) ? list : [];
    } catch (error) {
      return [];
    }
  }
  return migrateOldProducts();
}

function migrateOldProducts() {
  let old = localStorage.getItem(OLD_KEY);
  if (old === null) return [];

  let oldList;
  try {
    oldList = JSON.parse(old);
  } catch (error) {
    return [];
  }
  if (!Array.isArray(oldList)) return [];

  let list = [];
  for (let item of oldList) {
    if (!item) continue;
    let product = {
      id: 0,
      title: String(item.title || '').trim(),
      price: toNumber(item.price),
      taxes: toNumber(item.taxes),
      ads: toNumber(item.ads),
      discount: toNumber(item.discount),
      count: 1,
      category: String(item.category || '').trim(),
    };
    let same = list.find(p =>
      p.title === product.title &&
      p.price === product.price &&
      p.taxes === product.taxes &&
      p.ads === product.ads &&
      p.discount === product.discount &&
      p.category === product.category
    );
    if (same) {
      same.count++;
    } else {
      product.id = list.length + 1;
      list.push(product);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  localStorage.removeItem(OLD_KEY);
  return list;
}

let products = loadProducts();

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function getNextId() {
  let maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
  let savedId = Number(localStorage.getItem(ID_KEY)) || 1;
  let id = Math.max(savedId, maxId + 1);
  localStorage.setItem(ID_KEY, id + 1);
  return id;
}

function getTotal() {
  if (price.value === '') {
    total.textContent = '';
    total.classList.remove('ok');
    return;
  }
  let result = round(toNumber(price.value) + toNumber(taxes.value) + toNumber(ads.value) - toNumber(discount.value));
  total.textContent = formatNumber(result);
  total.classList.toggle('ok', result >= 0);
}

function showError(input, message) {
  document.getElementById(input.id + 'Error').textContent = message;
  input.classList.add('invalid');
  input.setAttribute('aria-invalid', 'true');
}

function clearError(input) {
  document.getElementById(input.id + 'Error').textContent = '';
  input.classList.remove('invalid');
  input.removeAttribute('aria-invalid');
}

function clearErrors() {
  [title, price, taxes, ads, discount, count, category].forEach(clearError);
}

function readNumber(input, requiredMessage) {
  if (input.validity.badInput) {
    showError(input, 'Enter a valid number');
    return null;
  }
  if (input.value === '') {
    if (requiredMessage) {
      showError(input, requiredMessage);
      return null;
    }
    return 0;
  }
  let value = Number(input.value);
  if (value < 0) {
    showError(input, "Can't be negative");
    return null;
  }
  return value;
}

function readForm() {
  clearErrors();
  let ok = true;

  let titleValue = title.value.trim();
  if (titleValue === '') {
    showError(title, 'Title is required');
    ok = false;
  }

  let priceValue = readNumber(price, 'Price is required');
  let taxesValue = readNumber(taxes);
  let adsValue = readNumber(ads);
  let discountValue = readNumber(discount);

  if (priceValue === null || taxesValue === null || adsValue === null || discountValue === null) {
    ok = false;
  } else if (discountValue > round(priceValue + taxesValue + adsValue)) {
    showError(discount, "Discount can't be bigger than price + taxes + ads");
    ok = false;
  }

  let countValue = Number(count.value);
  if (count.value === '' || !Number.isInteger(countValue) || countValue < 1 || countValue > 1000) {
    showError(count, 'Quantity must be a whole number from 1 to 1000');
    ok = false;
  }

  let categoryValue = category.value.trim();
  if (categoryValue === '') {
    showError(category, 'Category is required');
    ok = false;
  }

  if (!ok) {
    form.querySelector('.invalid').focus();
    return null;
  }

  return {
    title: titleValue,
    price: priceValue,
    taxes: taxesValue,
    ads: adsValue,
    discount: discountValue,
    count: countValue,
    category: categoryValue,
  };
}

function clearData() {
  form.reset();
  count.value = 1;
  clearErrors();
  getTotal();
}

function setCreateMode() {
  mode = 'create';
  editId = null;
  submit.textContent = 'Create';
  cancelBtn.hidden = true;
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  let product = readForm();
  if (!product) return;

  if (mode === 'create') {
    product = { id: getNextId(), ...product };
    products.push(product);
    showToast('Product created');
  } else {
    let index = products.findIndex(p => p.id === editId);
    if (index !== -1) {
      products[index] = { id: editId, ...product };
    }
    showToast('Product updated');
  }

  saveProducts();
  clearData();
  setCreateMode();
  showData();
});

function updateData(id) {
  let product = products.find(p => p.id === id);
  if (!product) return;

  clearErrors();
  title.value = product.title;
  price.value = product.price;
  taxes.value = product.taxes;
  ads.value = product.ads;
  discount.value = product.discount;
  count.value = product.count;
  category.value = product.category;
  getTotal();

  mode = 'update';
  editId = id;
  submit.textContent = 'Update';
  cancelBtn.hidden = false;
  showData();

  scroll({ top: 0, behavior: 'smooth' });
  title.focus({ preventScroll: true });
}

function cancelEdit() {
  clearData();
  setCreateMode();
  showData();
}

cancelBtn.addEventListener('click', cancelEdit);

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && mode === 'update') {
    cancelEdit();
  }
});

function deleteData(id) {
  let product = products.find(p => p.id === id);
  if (!product) return;
  if (!confirm(`Delete "${product.title}"?`)) return;

  products = products.filter(p => p.id !== id);
  saveProducts();
  if (editId === id) {
    clearData();
    setCreateMode();
  }
  showData();
  showToast('Product deleted');
}

deleteAllBtn.addEventListener('click', function () {
  if (products.length === 0) return;
  if (!confirm(`Delete all ${products.length} products? This can't be undone.`)) return;

  products = [];
  saveProducts();
  if (mode === 'update') {
    clearData();
    setCreateMode();
  }
  currentPage = 1;
  showData();
  showToast('All products deleted');
});

tbody.addEventListener('click', function (event) {
  let button = event.target.closest('button');
  if (!button) return;
  let id = Number(button.dataset.id);
  if (button.dataset.action === 'update') {
    updateData(id);
  } else if (button.dataset.action === 'delete') {
    deleteData(id);
  }
});

function compareProducts(a, b) {
  let x = sortKey === 'total' ? getProductTotal(a) : a[sortKey];
  let y = sortKey === 'total' ? getProductTotal(b) : b[sortKey];
  let result = typeof x === 'string' ? x.localeCompare(y) : x - y;
  if (result === 0) result = a.id - b.id;
  return sortDir === 'asc' ? result : -result;
}

function getVisibleProducts() {
  let value = search.value.trim().toLowerCase();
  let list = products.filter(p => p[searchMode].toLowerCase().includes(value));
  return list.sort(compareProducts);
}

function createButtonCell(text, action, id, className) {
  let td = document.createElement('td');
  td.className = 'action';
  let button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  button.dataset.action = action;
  button.dataset.id = id;
  if (className) button.className = className;
  td.appendChild(button);
  return td;
}

function createRow(product) {
  let tr = document.createElement('tr');
  if (product.id === editId) tr.className = 'editing';

  let cells = [
    ['ID', product.id],
    ['Title', product.title],
    ['Price', formatNumber(product.price)],
    ['Taxes', formatNumber(product.taxes)],
    ['Ads', formatNumber(product.ads)],
    ['Discount', formatNumber(product.discount)],
    ['Total', formatNumber(getProductTotal(product))],
    ['Qty', product.count],
    ['Category', product.category],
  ];

  for (let [label, value] of cells) {
    let td = document.createElement('td');
    td.dataset.label = label;
    td.textContent = value;
    tr.appendChild(td);
  }

  tr.appendChild(createButtonCell('Update', 'update', product.id));
  tr.appendChild(createButtonCell('Delete', 'delete', product.id, 'danger'));
  return tr;
}

function showData() {
  let list = getVisibleProducts();
  let pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  if (currentPage > pages) currentPage = pages;
  let start = (currentPage - 1) * PER_PAGE;
  let pageItems = list.slice(start, start + PER_PAGE);

  tbody.textContent = '';
  if (pageItems.length === 0) {
    let tr = document.createElement('tr');
    tr.className = 'empty';
    let td = document.createElement('td');
    td.colSpan = 11;
    td.textContent = products.length === 0 ? 'No products yet' : 'No products found';
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
  for (let product of pageItems) {
    tbody.appendChild(createRow(product));
  }

  pagination.hidden = pages <= 1;
  pageInfo.textContent = `Page ${currentPage} of ${pages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === pages;

  deleteAllBtn.hidden = products.length === 0;
  deleteAllBtn.textContent = `Delete All (${products.length})`;
  exportBtn.disabled = products.length === 0;

  updateStats();
  updateSortView();
}

function updateStats() {
  let units = 0;
  let value = 0;
  for (let product of products) {
    units += product.count;
    value += getProductTotal(product) * product.count;
  }
  document.getElementById('statProducts').textContent = formatNumber(products.length);
  document.getElementById('statUnits').textContent = formatNumber(units);
  document.getElementById('statValue').textContent = formatNumber(round(value));
}

function updateSortView() {
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.classList.remove('asc', 'desc');
    th.removeAttribute('aria-sort');
    if (th.dataset.sort === sortKey) {
      th.classList.add(sortDir);
      th.setAttribute('aria-sort', sortDir === 'asc' ? 'ascending' : 'descending');
    }
  });
  sortSelect.value = sortKey + '-' + sortDir;
}

document.querySelectorAll('.sort').forEach(button => {
  button.addEventListener('click', function () {
    let key = button.dataset.sort;
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDir = 'asc';
    }
    currentPage = 1;
    showData();
  });
});

sortSelect.addEventListener('change', function () {
  [sortKey, sortDir] = sortSelect.value.split('-');
  currentPage = 1;
  showData();
});

prevBtn.addEventListener('click', function () {
  currentPage--;
  showData();
});

nextBtn.addEventListener('click', function () {
  currentPage++;
  showData();
});

function setSearchMode(newMode) {
  searchMode = newMode;
  searchTitleBtn.classList.toggle('active', newMode === 'title');
  searchCategoryBtn.classList.toggle('active', newMode === 'category');
  searchTitleBtn.setAttribute('aria-pressed', newMode === 'title');
  searchCategoryBtn.setAttribute('aria-pressed', newMode === 'category');
  search.placeholder = newMode === 'title' ? 'Search By Title' : 'Search By Category';
  search.focus();
  currentPage = 1;
  showData();
}

searchTitleBtn.addEventListener('click', () => setSearchMode('title'));
searchCategoryBtn.addEventListener('click', () => setSearchMode('category'));

search.addEventListener('input', function () {
  currentPage = 1;
  showData();
});

[price, taxes, ads, discount].forEach(input => {
  input.addEventListener('input', getTotal);
});

[title, price, taxes, ads, discount, count, category].forEach(input => {
  input.addEventListener('input', () => clearError(input));
});

function csvCell(value) {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

exportBtn.addEventListener('click', function () {
  let rows = [['ID', 'Title', 'Price', 'Taxes', 'Ads', 'Discount', 'Total', 'Qty', 'Category']];
  for (let p of products) {
    rows.push([p.id, p.title, p.price, p.taxes, p.ads, p.discount, getProductTotal(p), p.count, p.category]);
  }
  let csv = '﻿' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  let blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'products.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeBtn.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
}

let savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme !== 'dark' && savedTheme !== 'light') {
  savedTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
setTheme(savedTheme);

themeBtn.addEventListener('click', function () {
  let theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, theme);
  setTheme(theme);
});

clearData();
showData();
