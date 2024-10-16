// Configuración de Foursquare
const fsq_api_key = 'fsq3zBmo5He0nxhtV6KnOv2WRhFHztDA1v9xFBgwd5J8jR8=';

// Inicializar el mapa
const map = L.map('map').setView([40.4168, -3.7038], 15); // Madrid

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let restaurants = [];
let currentPage = 1;
const itemsPerPage = window.innerWidth < 768 ? 6 : 12;

async function getRestaurants(lat, lng) {
    const endpoint = 'https://api.foursquare.com/v3/places/search';
    const params = new URLSearchParams({
        query: 'sin gluten OR celiaco OR cerveza sin gluten',
        ll: `${lat},${lng}`,
        radius: 5000,
        limit: 15
    });

    try {
        const response = await fetch(`${endpoint}?${params}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: fsq_api_key
            }
        });
        const data = await response.json();
        restaurants = data.results;
        await getRestaurantPhotos();
        displayRestaurants();
        displayMapMarkers();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function getRestaurantPhotos() {
    for (let restaurant of restaurants) {
        const photosEndpoint = `https://api.foursquare.com/v3/places/${restaurant.fsq_id}/photos`;
        try {
            const response = await fetch(photosEndpoint, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: fsq_api_key
                }
            });
            const data = await response.json();
            if (data.length > 0) {
                restaurant.photo = `${data[0].prefix}original${data[0].suffix}`;
            }
        } catch (error) {
            console.error('Error fetching photos:', error);
        }
    }
}

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
            <img src="${restaurant.photo || restaurant.categories[0]?.icon?.prefix + '88' + restaurant.categories[0]?.icon?.suffix}" alt="${restaurant.name}">
            <div class="restaurant-info">
                <h2>${restaurant.name}</h2>
                <p>${restaurant.location.address || 'Dirección no disponible'}</p>
                <div class="button-container">
                    <button onclick="openPopup('${restaurant.fsq_id}')">Ver más</button>
                    <button><i class="fas fa-share-alt"></i> Compartir</button>
                    <button><i class="fas fa-phone"></i> Llamar</button>
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });

    restaurantList.appendChild(fragment);
    updatePagination();
}

function displayMapMarkers() {
    // Limpiar marcadores existentes
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    const customIcon = L.icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    restaurants.forEach(restaurant => {
        const marker = L.marker([restaurant.geocodes.main.latitude, restaurant.geocodes.main.longitude], {icon: customIcon}).addTo(map)
            .bindPopup(`
                <div style="text-align: center;">
                    <h3 style="color: #ff9058;">${restaurant.name}</h3>
                    <p>${restaurant.location.address || 'Dirección no disponible'}</p>
                    <button onclick="openPopup('${restaurant.fsq_id}')">Ver más</button>
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
        }
    });
}

function toggleMenu() {
    // Implementar la lógica del menú hamburguesa aquí
    console.log('Menú toggled');
}

function searchRestaurants() {
    const searchTerm = document.querySelector('.search-bar input').value.toLowerCase();
    const filteredRestaurants = restaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchTerm) || 
        restaurant.location.address.toLowerCase().includes(searchTerm)
    );
    restaurants = filteredRestaurants;
    displayRestaurants();
    displayMapMarkers();
}

function searchInCurrentArea() {
    const center = map.getCenter();
    getRestaurants(center.lat, center.lng);
}

async function openPopup(fsq_id) {
    const restaurant = restaurants.find(r => r.fsq_id === fsq_id);
    if (!restaurant) return;

    const popup = document.getElementById('restaurant-popup');
    const popupTitle = document.getElementById('popup-title');
    const popupAddress = document.getElementById('popup-address');
    const popupPhone = document.getElementById('popup-phone');
    const popupWebsite = document.getElementById('popup-website');
    const popupHours = document.getElementById('popup-hours');
    const popupPrice = document.getElementById('popup-price');
    const popupRating = document.getElementById('popup-rating');
    const popupPopularity = document.getElementById('popup-popularity');
    const popupDelivery = document.getElementById('popup-delivery');
    const popupPayment = document.getElementById('popup-payment');
    const popupMenu = document.getElementById('popup-menu');
    const popupReviews = document.getElementById('popup-reviews');
    const popupPromotions = document.getElementById('popup-promotions');

    popupTitle.textContent = restaurant.name;
    popupAddress.textContent = `${restaurant.location.address}, ${restaurant.location.locality}, ${restaurant.location.postcode}`;
    popupPhone.textContent = restaurant.tel || 'Teléfono no disponible';
    popupWebsite.innerHTML = restaurant.website ? `<a href="${restaurant.website}" target="_blank">${restaurant.website}</a>` : 'Sitio web no disponible';
    popupHours.textContent = restaurant.hours?.display || 'Horario no disponible';
    popupPrice.textContent = `Precio: ${restaurant.price || 'No disponible'}`;
    popupRating.textContent = `Calificación: ${restaurant.rating || 'No disponible'}`;
    popupPopularity.textContent = `Popularidad: ${restaurant.popularity || 'No disponible'}`;
    popupDelivery.textContent = `Entrega: ${restaurant.delivery ? 'Disponible' : 'No disponible'}`;
    popupPayment.textContent = `Opciones de pago: ${restaurant.payment?.join(', ') || 'No disponible'}`;
    popupMenu.innerHTML = restaurant.menu ? `<a href="${restaurant.menu}" target="_blank">Ver menú</a>` : 'Menú no disponible';
    popupReviews.textContent = 'Reseñas no disponibles';
    popupPromotions.textContent = 'Promociones no disponibles';

    popup.style.display = 'block';
}

function closePopup() {
    document.getElementById('restaurant-popup').style.display = 'none';
}

// Inicialización
const initialCenter = map.getCenter();
getRestaurants(initialCenter.lat, initialCenter.lng);

// Evento para la tecla "Enter" en la barra de búsqueda
document.querySelector('.search-bar input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchRestaurants();
    }
});

// Mostrar el botón de búsqueda en el área cuando el mapa se mueve
map.on('moveend', function() {
    document.getElementById('search-area-button').style.display = 'block';
});

// Evento para el botón de búsqueda en el área
document.getElementById('search-area-button').addEventListener('click', searchInCurrentArea);