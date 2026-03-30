const apiKey = "0c594e17b3a8f34fa6ffaa4864a7b0ec";

// Função para obter localização e clima
function getWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    const weather = data.weather[0].main; // Ex.: 'Clear', 'Clouds', 'Rain'
                    const clouds = data.clouds.all; // Porcentagem de nuvens (0-100)
                    const hour = new Date().getHours(); // Hora atual
                    let imageName = '';

                    // Mapeamento detalhado para imagens de fundo
                    if (hour < 6 || hour >= 18) {
                        imageName = 'night.jpg';
                    } else {
                        if (weather === 'Clear') {
                            imageName = 'clear.jpg';
                        } else if (weather === 'Clouds') {
                            if (clouds <= 20) imageName = 'few-clouds.jpg';
                            else if (clouds <= 50) imageName = 'partly-cloudy.jpg';
                            else if (clouds <= 80) imageName = 'mostly-cloudy.jpg';
                            else imageName = 'overcast.jpg';
                        } else if (weather === 'Rain' || weather === 'Drizzle') {
                            imageName = 'rain.jpg';
                        } else if (weather === 'Thunderstorm') {
                            imageName = 'storm.jpg';
                        } else if (weather === 'Snow') {
                            imageName = 'snow.jpg';
                        } else if (weather === 'Mist' || weather === 'Fog' || weather === 'Haze') {
                            imageName = 'fog.jpg';
                        } else {
                            imageName = 'clear.jpg'; // Fallback
                        }
                    }

                    console.log('Condição aplicada:', weather, 'Nuvens:', clouds, 'Hora:', hour, 'Imagem:', imageName); // Debug
                    applyWeatherAnimation(imageName);
                })
                .catch(error => console.error('Erro ao obter clima:', error));
        }, error => console.error('Erro de geolocalização:', error));
    } else {
        console.error('Geolocalização não suportada.');
    }
}

// Função para aplicar animação e imagem de fundo
function applyWeatherAnimation(imageName) {
    const container = document.querySelector('.weather-container');
    if (container) {
        // Aplicar imagem de fundo
        container.style.backgroundImage = `url('img/${imageName}')`;
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
        container.style.backgroundRepeat = 'no-repeat';

        // Manter classe para animações (se necessário, baseado em condição anterior)
        // Aqui, removemos a classe específica, pois agora focamos na imagem
        container.className = 'weather-container';

        console.log('Imagem de fundo aplicada:', `img/${imageName}`); // Debug
    } else {
        console.error('Container .weather-container não encontrado.');
    }
}

// Executa ao carregar
window.onload = getWeather;