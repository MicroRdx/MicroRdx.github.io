



const foodList = document.getElementById('foodList');
const addItemButton = document.getElementById('addItemButton');
const selectRandomDishButton = document.getElementById('selectRandomDishButton');
const foodItemInput = document.getElementById('foodItemInput');


// Load the items 
// // Load saved items from local storage
const savedItems = localStorage.getItem('foodItems');
if (savedItems) {
  const savedItemsArray = JSON.parse(savedItems);
  savedItemsArray.forEach(item => {
    const itemElement = document.createElement('li');
    itemElement.textContent = item;
    foodList.appendChild(itemElement);
    addDeleteButton(itemElement); // Add delete button to loaded items
  });
}

// Load saved items from the backend
var settings = {
  "url": "https://vra-back.onrender.com/",
  "method": "GET",
  "timeout": 0,
  "headers": {
    "Access-Control-Allow-Origin": "*"
  },
};

$.ajax(settings).done(function (response) {
  console.log(response);
  const savedItems = JSON.parse(response).name.replaceAll(`'`, `"`);
  const localSavedItems = localStorage.getItem('foodItems');
  if (savedItems) {
    const localSavedItemsList = JSON.parse(localSavedItems);
    const savedItemsArray = JSON.parse(savedItems);
    // Store items in local storage
    const mergedItemsArray = savedItemsArray //[...foodList.children].map(item => item.textContent);
    if(localSavedItemsList){
      const mergedItemsArray =  [...localSavedItemsList, ...savedItemsArray] //[...foodList.children].map(item => item.textContent);
    }
    const uniqueItemsArray = mergedItemsArray.filter((item, index) => mergedItemsArray.indexOf(item) === index);
    localStorage.setItem('foodItems', JSON.stringify(uniqueItemsArray));
    foodList.innerHTML = ''; // removing all the child elements 
    uniqueItemsArray.forEach(item => {
      const itemElement = document.createElement('li');
      itemElement.textContent = item;
      foodList.appendChild(itemElement);
      addDeleteButton(itemElement); // Add delete button to loaded items
    });
    updateNewItemsBackend();
  }
}).fail(function (err) {
  console.log(err)
});



// Add item functionality
addItemButton.addEventListener('click', () => {
  const itemName = foodItemInput.value.trim();
  if (itemName) {
    const itemElement = document.createElement('li');
    itemElement.textContent = itemName;
    foodList.appendChild(itemElement);
    foodItemInput.value = '';

    // Store items in local storage
    const itemsArray = [...foodList.children].map(item => item.textContent.replace('Delete', ""));
    localStorage.setItem('foodItems', JSON.stringify(itemsArray));

    addDeleteButton(itemElement); // Add delete button to new items
    updateNewItemsBackend();
  }
});

// Select random dish functionality
selectRandomDishButton.addEventListener('click', () => {
  const items = Array.from(foodList.children);
  const randomIndex = Math.floor(Math.random() * items.length);
  const selectedDish = items[randomIndex].textContent.replace("Delete", "");
  alert('Selected dish: ' + selectedDish);
});

// Edit item functionality
foodList.addEventListener('dblclick', (event) => {
  const itemElement = event.target;
  if (itemElement.tagName === 'LI') {
    const originalText = itemElement.textContent.replace('Delete', "");
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalText;
    itemElement.textContent = '';
    itemElement.appendChild(input);
    input.addEventListener('blur', () => {
      const newText = input.value.trim();
      if (newText) {
        itemElement.textContent = newText;
        // Update items in local storage
        const itemsArray = [...foodList.children].map(item => item.textContent.replace('Delete', ""));
        localStorage.setItem('foodItems', JSON.stringify(itemsArray));
        updateNewItemsBackend();
      } else {
        itemElement.remove();
      }
    });
    input.focus();
  }
});

// Add delete button to each list item
function addDeleteButton(itemElement) {
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.setAttribute('style', 'margin-left:1rem; background-color: #d11a2a')
  deleteButton.addEventListener('click', () => {
    itemElement.remove();
    // Update items in local storage
    const itemsArray = [...foodList.children].map(item => item.textContent.replace('Delete', ""));
    localStorage.setItem('foodItems', JSON.stringify(itemsArray));
    updateNewItemsBackend();
  });
  itemElement.appendChild(deleteButton);
}


function updateNewItemsBackend() {
  var settings = {
    "url": "https://vra-back.onrender.com/VRAFoods",
    "method": "POST",
    "timeout": 0,
    "headers": {
      "Content-Type": "application/json"
    },
    "data": JSON.stringify({
      "newValue": localStorage.getItem('foodItems')
    }),
  };

  $.ajax(settings).done(function (response) {
    console.log(response);
  }).fail(function (error) {
    console.log(error);
  });
}
