document.addEventListener('DOMContentLoaded', () => {
    // Получение IP-адреса
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            const ip = data.ip;
            document.getElementById('ip-address').textContent = `Ваш IP-адрес: ${ip}`;
            // Получение местоположения по IP
            fetch(`https://ip-api.com/json/${ip}?lang=ru`)
                .then(response => response.json())
                .then(locationData => {
                    const { city, region, country } = locationData;
                    document.getElementById('location').textContent = `Ваше местоположение: ${city}, ${region}, ${country}`;
                })
                .catch(error => {
                    console.error('Ошибка при получении местоположения:', error);
                    document.getElementById('location').textContent = 'Не удалось определить местоположение';
                });
        })
        .catch(error => {
            console.error('Ошибка при получении IP-адреса:', error);
            document.getElementById('ip-address').textContent = 'Не удалось получить IP-адрес';
        });
});
