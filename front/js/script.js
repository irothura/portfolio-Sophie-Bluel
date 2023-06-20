const ENDPOINT = "http://localhost:5678/api/works";
const itemsContainer = document.querySelector("#items");
const editPanelContent = document.querySelector("#items2");
const editModeButton = document.querySelector("#editmodeBtn");
const closeButton = document.querySelector(".closeBtn");
const editionPanel = document.querySelector("#editionPanel");
const uploadPanel = document.querySelector("#uploadPanel");
const defaultBoxBtn = document.querySelector("#boxDefaultBtn");
const customBoxBtn = document.querySelector("#boxCustomBtn");
const titleInput = document.querySelector('#inputTitle');
const categorySelect = document.querySelector('#selectCategory');
const submitButton = document.querySelector('#sendUpload');

async function addItem(event) {
    const fileInput = document.querySelector('#boxDefaultBtn');
    const file = fileInput.files[0];
    const title = titleInput.value;
    const category = categorySelect.value;
  
    const token = localStorage.getItem('token');
  
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('category', category);
  
    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${token}`},
            body: formData
        });
  
        if (response.ok) {
            await showItemsInEditionPanel();
            await showAllItems();
        } else {
            console.error('Erreur lors de l\'ajout de l\'élément.');
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'élément:', error);
    }
}

async function removeItem(event) {
    event.preventDefault();
  
    const itemId = event.target.parentElement.dataset.itemId; // Récupère l'ID de l'élément à partir de l'attribut "data-item-id"
    const token = localStorage.getItem('token');
  
    try {
        const response = await fetch(`http://localhost:5678/api/works/${itemId}`, {
            method: 'DELETE',
            headers: {'Authorization': `Bearer ${token}`}
        });
  
        if (response.ok) {
            await showItemsInEditionPanel();
            await showAllItems();
        } else {
            console.error('Erreur lors de la suppression de l\'élément.');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'élément:', error);
    }
}

async function checkLoggedIn() {
    const token = localStorage.getItem('token');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBtn = document.getElementById('loginBtn');
    const userHeader = document.getElementById('editMode');
    const modifyOptions = document.getElementById('editModeBtn2');
    
    if (token) {
      userHeader.style.display = 'flex';
      logoutBtn.style.display = 'block';
      loginBtn.style.display = 'none';
      modifyOptions.style.display = 'block';
    } else {
      userHeader.style.display = 'none';
      logoutBtn.style.display = 'none';
      modifyOptions.style.display = 'none';
    }
}

async function showItems(items) {
    itemsContainer.innerHTML = items.map((item) => {
        return `
            <figure data-category="${item.category.name}">
                <img src="${item.imageUrl}" alt="${item.title}">
                <figcaption>${item.title}</figcaption>
            </figure>
        `;
    }).join("");
}

async function showItems2(items) {
    editPanelContent.innerHTML = items.map((item) => {
        return `
            <div class="editpanelItems">
                <img src="${item.imageUrl}" alt="${item.title}">
                <button class="removeItem" data-item-id="${item.id}"><i class="fa-solid fa-trash-can"></i></button>
                <a>éditer</a>
            </div>
        `;
    }).join("");
    const removeButtons = document.querySelectorAll('.removeItem');
    removeButtons.forEach((button) => {
        button.addEventListener('click', removeItem);
    });
}

async function checkFields() {
    const imageFilled = defaultBoxBtn.value !== "";
    const titleFilled = titleInput.value !== "";
    const categoryFilled = categorySelect.value !== "";
    const allFieldsFilled = imageFilled && titleFilled && categoryFilled;
    if (allFieldsFilled) {
        submitButton.classList.add("activeUploadBtn");
    } else {
        submitButton.classList.remove("activeUploadBtn");
    }
}

async function activateButton(button) {
    const buttons = document.querySelectorAll(".button");
    buttons.forEach((otherButton) => {
        if (otherButton === button) {
            otherButton.classList.add("button_active");
        } else {
            otherButton.classList.remove("button_active");
        }
    });
}

async function updateImageURL() {
    const fileInput = document.querySelector("#boxDefaultBtn");
    const file = fileInput.files[0];
  
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const previewImage = document.getElementById("previewImage");
      const remplaceDisplay = document.getElementById("waitingPreview");
      previewImage.src = imageUrl;
      previewImage.style.display = "flex";
      remplaceDisplay.style.display = "none";
    }
}

async function getItems(endpoint = ENDPOINT) {
    const response = await fetch(endpoint);
    const data = await response.json();
    console.log("bdd content:", data);
    return data;
}

async function showAllItems() {
    const items = await getItems();
    await showItems(items);
}

async function filterItemsByCategory(categoryId) {
    const items = await getItems();
    const filteredItems = items.filter((item) => item.category.id === categoryId);
    await showItems(filteredItems);
}

const buttons = document.querySelectorAll(".button");
buttons.forEach((button) => {
    button.addEventListener("click", () => {
        activateButton(button);
    });
});

const defaultActiveButton = document.querySelector("#filter-all");
activateButton(defaultActiveButton);

async function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

async function editionMode() {
    editionPanel.style.display = "block";
}

async function uploadMode() {
    uploadPanel.style.display = "block";
}

async function closeEditionMode() {
    editionPanel.style.display = "none";
}

function closeUploadMode() {
    uploadPanel.style.display = "none";
}

async function showItemsInEditionPanel() {
    const items = await getItems();
    await showItems2(items);
}

async function boxDefaultBtnActive() {
    event.preventDefault();
    defaultBoxBtn.click();
}

async function uploadGo() {
    event.preventDefault();
    addItem();
}

window.onclick = (event) => {
    if (event.target === editionPanel) {
        closeEditionMode();
    }
    if (event.target === uploadPanel) {
        closeUploadMode();
        closeEditionMode();
    }
}

defaultBoxBtn.addEventListener('input', checkFields);
titleInput.addEventListener('input', checkFields);
categorySelect.addEventListener('input', checkFields);
document.querySelector("#filter-all").addEventListener("click", showAllItems);
document.querySelector("#filter-objects").addEventListener("click", () => filterItemsByCategory(1));
document.querySelector("#filter-apartments").addEventListener("click", () => filterItemsByCategory(2));
document.querySelector("#filter-hosts").addEventListener("click", () => filterItemsByCategory(3));
document.addEventListener('DOMContentLoaded', checkLoggedIn);
editModeButton.addEventListener("click", editionMode);
closeButton.addEventListener("click", closeEditionMode);
defaultBoxBtn.addEventListener("change", updateImageURL);

showAllItems();
showItemsInEditionPanel();