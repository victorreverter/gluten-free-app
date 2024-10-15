// Inicializar el mapa
const map = L.map('map').setView([40.4168, -3.7038], 10); // Madrid

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Generar 40 restaurantes
const restaurants = [];
for (let i = 0; i < 40; i++) {
    let lat, lng;
    if (i < 16) {
        // Madrid centro
        lat = 40.4168 + (Math.random() - 0.5) * 0.05;
        lng = -3.7038 + (Math.random() - 0.5) * 0.05;
    } else {
        // Resto de la Comunidad de Madrid
        lat = 40.4168 + (Math.random() - 0.5) * 0.3;
        lng = -3.7038 + (Math.random() - 0.5) * 0.3;
    }
    restaurants.push({
        name: `Restaurante ${i + 1}`,
        description: `Descripción del restaurante ${i + 1}`,
        lat: lat,
        lng: lng,
        rating: Math.floor(Math.random() * 5) + 1,
        image: `https://picsum.photos/200/300?random=${i}`
    });
}

let currentPage = 1;
const itemsPerPage = window.innerWidth < 768 ? 6 : 12;

// Generar 15 mensajes de usuario con emojis
const userReviews = [
    { user: "María", text: "¡Excelente comida sin gluten! 😋👍", avatar: "https://i.pravatar.cc/40?img=1" },
    { user: "Carlos", text: "El personal es muy amable y atento. 🤗", avatar: "https://i.pravatar.cc/40?img=2" },
    { user: "Ana", text: "Gran variedad de opciones sin gluten. 🍽️", avatar: "https://i.pravatar.cc/40?img=3" },
    { user: "Pedro", text: "Ambiente acogedor y agradable. 🏠", avatar: "https://i.pravatar.cc/40?img=4" },
    { user: "Laura", text: "Los precios son razonables. 💰", avatar: "https://i.pravatar.cc/40?img=5" },
    { user: "Javier", text: "Recomiendo el postre de chocolate. 🍫", avatar: "https://i.pravatar.cc/40?img=6" },
    { user: "Sofía", text: "Perfecto para celíacos y no celíacos. 👨‍👩‍👧‍👦", avatar: "https://i.pravatar.cc/40?img=7" },
    { user: "Miguel", text: "La pizza sin gluten es increíble. 🍕", avatar: "https://i.pravatar.cc/40?img=8" },
    { user: "Elena", text: "Volveré seguro, me ha encantado. 😍", avatar: "https://i.pravatar.cc/40?img=9" },
    { user: "David", text: "Cuidado con la contaminación cruzada. ⚠️", avatar: "https://i.pravatar.cc/40?img=10" },
    { user: "Carmen", text: "El pan sin gluten es delicioso. 🍞", avatar: "https://i.pravatar.cc/40?img=11" },
    { user: "Pablo", text: "Menú variado y bien explicado. 📜", avatar: "https://i.pravatar.cc/40?img=12" },
    { user: "Lucía", text: "La mejor experiencia sin gluten hasta ahora. 🏆", avatar: "https://i.pravatar.cc/40?img=13" },
    { user: "Alberto", text: "Ideal para familias con niños celíacos. 👨‍👩‍👧‍👦", avatar: "https://i.pravatar.cc/40?img=14" },
    { user: "Isabel", text: "Buena relación calidad-precio. 👌", avatar: "https://i.pravatar.cc/40?img=15" }
];

function displayRestaurants(page = 1) {
    const restaurantList = document.getElementById('restaurant-list');
    restaurantList.innerHTML = '';

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    const fragment = document.createDocumentFragment();

    restaurants.slice(start, end).forEach(restaurant => {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
            <img src="${restaurant.image}" alt="${restaurant.name}">
            <div class="restaurant-info">
                <h2>${restaurant.name}</h2>
                <p>${restaurant.description}</p>
                <div class="rating">${'★'.repeat(restaurant.rating)}${'☆'.repeat(5 - restaurant.rating)}</div>
                <div class="button-container">
                    <button><i class="fas fa-utensils"></i> Reservar</button>
                    <button><i class="fas fa-share-alt"></i> Compartir</button>
                    <button><i class="fas fa-phone"></i> Llamar</button>
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });

    restaurantList.appendChild(fragment);
}

function displayMapMarkers() {
    const customIcon = L.icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    restaurants.forEach(restaurant => {
        const marker = L.marker([restaurant.lat, restaurant.lng], {icon: customIcon}).addTo(map)
            .bindPopup(`
                <div style="text-align: center;">
                    <h3 style="color: #FFAD60;">${restaurant.name}</h3>
                    <p>${restaurant.description}</p>
                    <div style="color: #FFAD60;">${'★'.repeat(restaurant.rating)}${'☆'.repeat(5 - restaurant.rating)}</div>
                </div>
            `);
    });
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(restaurants.length / itemsPerPage);

    pagination.innerHTML = Array.from({ length: totalPages }, (_, i) => i + 1)
        .map(i => `<button class="${i === currentPage ? 'active' : ''}">${i}</button>`)
        .join('');

    pagination.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            currentPage = parseInt(e.target.textContent);
            displayRestaurants(currentPage);
            updatePagination();
        }
    });
}

function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function searchRestaurants() {
    const searchTerm = document.querySelector('.search-bar input').value.toLowerCase();
    const filteredRestaurants = restaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchTerm) || 
        restaurant.description.toLowerCase().includes(searchTerm)
    );
    displayFilteredRestaurants(filteredRestaurants);
}

function displayFilteredRestaurants(filteredRestaurants) {
    const restaurantList = document.getElementById('restaurant-list');
    restaurantList.innerHTML = '';

    filteredRestaurants.forEach(restaurant => {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
            <img src="${restaurant.image}" alt="${restaurant.name}">
            <div class="restaurant-info">
                <h2>${restaurant.name}</h2>
                <p>${restaurant.description}</p>
                <div class="rating">${'★'.repeat(restaurant.rating)}${'☆'.repeat(5 - restaurant.rating)}</div>
                <div class="button-container">
                    <button><i class="fas fa-utensils"></i> Reservar</button>
                    <button><i class="fas fa-share-alt"></i> Compartir</button>
                    <button><i class="fas fa-phone"></i> Llamar</button>
                </div>
            </div>
        `;
        restaurantList.appendChild(card);
    });
}

function resizeAdsense() {
    const adBanner = document.getElementById('adsense-banner');
    const body = document.body;
    if (window.innerWidth < 728) {
        adBanner.style.height = '50px';
        body.style.paddingBottom = '50px';
    } else {
        adBanner.style.height = '90px';
        body.style.paddingBottom = '90px';
    }
}

function displayReviewPreviews() {
    const previewContainer = document.getElementById('user-reviews-preview');
    previewContainer.innerHTML = '';

    userReviews.forEach(review => {
        const bubble = document.createElement('div');
        bubble.className = 'review-bubble';
        bubble.innerHTML = `
            <img src="${review.avatar}" alt="${review.user}">
            <p>${review.text}</p>
        `;
        previewContainer.appendChild(bubble);
    });

    // Animación de desplazamiento automático
    let scrollPosition = 0;
    setInterval(() => {
        scrollPosition += 1;
        if (scrollPosition > previewContainer.scrollWidth - previewContainer.clientWidth) {
            scrollPosition = 0;
        }
        previewContainer.scrollTo(scrollPosition, 0);
    }, 50);
}

// Inicialización
displayRestaurants();
displayMapMarkers();
updatePagination();
displayReviewPreviews();

// Evento para la tecla "Enter" en la barra de búsqueda
document.querySelector('.search-bar input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchRestaurants();
    }
});

// Eventos para el manejo del tamaño de la publicidad
window.addEventListener('resize', resizeAdsense);
resizeAdsense(); // Llamar a la función al cargar la página