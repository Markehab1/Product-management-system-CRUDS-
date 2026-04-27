let title = document.getElementById('title');
let price = document.getElementById('price');
let taxes = document.getElementById('taxes');
let ads = document.getElementById('ads');
let discount = document.getElementById('discount');
let total = document.getElementById('total');
let count = document.getElementById('count');
let category = document.getElementById('category');
let submit = document.getElementById('submit');

let mood = 'create';
let tmp;

console.log("%c🚀 Developed by Mark Ehab", "color: #fff; background: #6b0080; font-size: 20px; padding: 10px; border-radius: 5px;");

function getTotal() {
  if (price.value != '') {
    let result = (+price.value + +taxes.value + +ads.value) - +discount.value;
    total.innerHTML = result;
    total.style.background = 'rgb(49, 141, 49)';
  }else {
    total.innerHTML = '';
    total.style.background = 'rgb(115, 0, 0)';
  }
}



let dataPro;
if (localStorage.product != null) {
  dataPro = JSON.parse(localStorage.product);
}else {
  dataPro = [];
}


submit.onclick = function (){
  let newPro = {
    title:title.value.toLowerCase(),
    price:price.value,
    taxes:taxes.value,
    ads:ads.value,
    discount:discount.value,
    total:total.innerHTML,
    count:count.value,
    category:category.value.toLowerCase(),
  }



if (title.value != '' && price.value != '' && category.value != '' && newPro.count < 101) {

  if (mood === 'create') {
  if (newPro.count > 1) {
    for (let i = 0; i < newPro.count; i++) {
      dataPro.push(newPro);
    }} else {
  dataPro.push(newPro);
  }
  } else {
  dataPro[tmp] = newPro;
  submit.innerHTML = 'Create';
  count.style.display = 'block';
  mood = 'create';
  }
  clearData()
}






  // save localstorage
  localStorage.setItem('product', JSON.stringify(dataPro));
  console.log(dataPro);
  showData()
}


function clearData() {
  title.value = '';
  price.value = '';
  taxes.value = '';
  ads.value = '';
  discount.value = '';
  total.innerHTML = '';
  count.value = '';
  category.value = '';
}


function showData(){
  getTotal();
  let table = '';
  for (let i = 0; i < dataPro.length; i++) {
    table += `
      <tr>
        <td>${i+1}</td>
        <td>${dataPro[i].title}</td>
        <td>${dataPro[i].price}</td>
        <td>${dataPro[i].taxes}</td>
        <td>${dataPro[i].ads}</td>
        <td>${dataPro[i].discount}</td>
        <td>${dataPro[i].total}</td>
        <td>${dataPro[i].category}</td>
        <td><button onclick="updateData(${i})">Update</button></td>
        <td><button onclick="deleteData(${i})">Delete</button></td>
      </tr>
    `;
  }
  document.getElementById('tbody').innerHTML = table;
  if (dataPro.length > 0) {
    document.getElementById('deleteAll').innerHTML = `
      <button onclick="deleteAll()">Delete All (${dataPro.length})</button>
    `;
  } else {
    document.getElementById('deleteAll').innerHTML = '';
  }
}

showData();


// delete selected product

function deleteData(i) {
  dataPro.splice(i, 1);
  localStorage.setItem('product', JSON.stringify(dataPro));
  showData();
}



// delete all data

function deleteAll() {
  localStorage.clear();
  dataPro.splice(0);
  showData();
}

// update data ------------------- --------------  

function updateData(i) {
  title.value = dataPro[i].title;
  price.value = dataPro[i].price;
  taxes.value = dataPro[i].taxes;
  ads.value = dataPro[i].ads;
  discount.value = dataPro[i].discount;
  getTotal();
  count.style.display = 'none';
  category.value = dataPro[i].category;
  submit.innerHTML = 'Update';
  tmp = i;
  mood = 'update';
  scroll({
    top:0,
    behavior:'smooth',
  })
}


let searchMood = 'searchTitle';

function getSearchMood(id) {
  let search = document.getElementById('search');
  if (id === 'searchTitle') {
    searchMood = 'searchTitle';
    search.placeholder = 'Search By Title';
  } else {
    searchMood = 'searchCategory';
    search.placeholder = 'Search By Category';
  }
  search.focus();
  search.value = '';
  showData();
}




function searchInData(value) {
  let table = '';
  if (searchMood === 'searchTitle') {
    for (let i = 0; i < dataPro.length; i++) {
      if (dataPro[i].title.includes(value.toLowerCase())) {
        table += `
          <tr>
            <td>${i}</td>
            <td>${dataPro[i].title}</td>
            <td>${dataPro[i].price}</td>
            <td>${dataPro[i].taxes}</td>
            <td>${dataPro[i].ads}</td>
            <td>${dataPro[i].discount}</td>
            <td>${dataPro[i].total}</td>
            <td>${dataPro[i].category}</td>
            <td><button onclick="updateData(${i})">Update</button></td>
            <td><button onclick="deleteData(${i})">Delete</button></td>
          </tr>
        `;
      }
    }   
  } else {
    for (let i = 0; i < dataPro.length; i++) {
      if (dataPro[i].category.includes(value.toLowerCase())) {
        table += `
          <tr>
            <td>${i}</td>
            <td>${dataPro[i].title}</td>
            <td>${dataPro[i].price}</td>
            <td>${dataPro[i].taxes}</td>
            <td>${dataPro[i].ads}</td>
            <td>${dataPro[i].discount}</td>
            <td>${dataPro[i].total}</td>
            <td>${dataPro[i].category}</td>
            <td><button onclick="updateData(${i})">Update</button></td>
            <td><button onclick="deleteData(${i})">Delete</button></td>
          </tr>
        `;
      }
    }
  }
  document.getElementById('tbody').innerHTML = table;
}

//--------- Functions to build  --------
// clean data