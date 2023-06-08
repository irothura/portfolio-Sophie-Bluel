const ENDPOINT = "http://localhost:5678/api/works";
const itemsContainer = document.querySelector("#items");
const editPanelContent = document.querySelector("#items2");
const editModeButton = document.querySelector("#editmodeBtn");
const closeButton = document.querySelector(".closeBtn");
const editionPanel = document.querySelector("#editionPanel");
const defaultBoxBtn = document.querySelector("#boxDefaultBtn");
const customBoxBtn = document.querySelector("#boxCustomBtn");
const titleInput = document.querySelector('#inputTitle');
const categorySelect = document.querySelector('#selectCategory');
const submitButton = document.querySelector('#sendUpload');

// Récupère les items de l'API
async function getItems(endpoint = ENDPOINT) {
    const response = await fetch(endpoint);
    const data = await response.json();
    console.log("bdd content:", data);
    return data;
}

// Affiche les items dans la div "items"
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

// Affiche les items dans la div "items2"
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
            // Suppression réussie, mettre à jour l'affichage des éléments
            await showItemsInEditionPanel();
            await showAllItems();
        } else {
            // Affihcage des erreurs en cas d'échec de la suppression
            console.error('Erreur lors de la suppression de l\'élément.');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'élément:', error);
    }
}

defaultBoxBtn.addEventListener('change', updateImageURL);

async function updateImageURL() {
    const imageUrl = defaultBoxBtn.value;
    const previewImage = document.getElementById('previewImage');
    previewImage.src = imageUrl;
}

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
            // Ajout réussi, mettre à jour l'affichage des éléments
            await showItemsInEditionPanel();
            await showAllItems();
        } else {
            // Affichage des erreurs en cas d'échec de l'ajout
            console.error('Erreur lors de l\'ajout de l\'élément.');
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'élément:', error);
    }
}

//
defaultBoxBtn.addEventListener('input', checkFields);
titleInput.addEventListener('input', checkFields);
categorySelect.addEventListener('input', checkFields);
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

// Affiche tous les items
async function showAllItems() {
    const items = await getItems();
    await showItems(items);
}

// Filtre les items par catégorie
async function filterItemsByCategory(categoryId) {
    const items = await getItems();
    const filteredItems = items.filter((item) => item.category.id === categoryId);
    await showItems(filteredItems);
}

// EventListener pour chaque bouton
document.querySelector("#filter-all").addEventListener("click", showAllItems);
document.querySelector("#filter-objects").addEventListener("click", () => filterItemsByCategory(1));
document.querySelector("#filter-apartments").addEventListener("click", () => filterItemsByCategory(2));
document.querySelector("#filter-hosts").addEventListener("click", () => filterItemsByCategory(3));

// Active le bouton spécifié et désactive les autres boutons
function activateButton(button) {
    const buttons = document.querySelectorAll(".button");
    buttons.forEach((otherButton) => {
        if (otherButton === button) {
            otherButton.classList.add("button_active");
        } else {
            otherButton.classList.remove("button_active");
        }
    });
}

// EventListener pour les boutons pour déterminer lequel est actif
const buttons = document.querySelectorAll(".button");
buttons.forEach((button) => {
    button.addEventListener("click", () => {
        activateButton(button);
    });
});

const defaultActiveButton = document.querySelector("#filter-all");
activateButton(defaultActiveButton);

showAllItems();

async function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', checkLoggedIn);

async function checkLoggedIn() {
    const token = localStorage.getItem('token');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBtn = document.getElementById('loginBtn');
    const userHeader = document.getElementById('editMode');
    
    if (token) {
      // L'utilisateur est connecté
      userHeader.style.display = 'flex';
      logoutBtn.style.display = 'block';  // Afficher le bouton "Logout"
      loginBtn.style.display = 'none';  // Masquer le bouton "Login"
    } else {
      // L'utilisateur n'est pas connecté
      userHeader.style.display = 'none';
      logoutBtn.style.display = 'none';  // Masquer le bouton "Logout"
    }
}

editModeButton.addEventListener("click", editionMode);

async function editionMode() {
    editionPanel.style.display = "block";
}

async function uploadMode() {
    uploadPanel.style.display = "block";
}

closeButton.addEventListener("click", closeEditionMode);

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

showItemsInEditionPanel();