const apiKey = 'ca58842c0445ce8441d1001d0258bdaa';
let recentCities = [];
if(localStorage.getItem('recent-cities')) {
    try {
        recentCities = JSON.parse(localStorage.getItem('recent-cities'));
    }
    finally{
        displayRecentCities();
    }
}
$("#btnSearch").click(function (e) {
    e.preventDefault();
    const searchTxt = $("#txtSearch").val();
    
    preformSearch(searchTxt);
});
$("#cities-List").on('click', 'li', function(){
    preformSearch($(this).text());
});

function preformSearch(searchTxt) {
    const locationApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${searchTxt}&limit=1&appid=${apiKey}`;
    fetch(locationApiUrl)
        .then(response => response.json())
        .then((data) => {
            displayCity(data);
            fetchWeather(data);
            if (data.length) {
                saveCityToRecent(data[0].name);
                displayRecentCities();
            }
        });
}

function saveCityToRecent(city) {
    if (recentCities.indexOf(city) >= 0) {
        return;
    }
    recentCities.push(city);
    if (recentCities.length > 10) {
        recentCities.shift();
    }
    localStorage.setItem('recent-cities', JSON.stringify(recentCities));
}

function displayRecentCities() {
    let html = [];
    for (let i = recentCities.length; i > 0; i--) {
        let cityName = recentCities[i-1];
        html.push(`<li>${cityName}</li>`)
    }
    console.log(html.join(''));
    $('#cities-List').html(html.join(''));
}

function showLoadingMsg() {
    $("#loading-msg").removeClass('hidden');
    $("#city, #five-day").addClass('hidden');
}
function hideLoadingMsg() {
    $("#loading-msg").addClass('hidden');
    $("#city, #five-day").removeClass('hidden');
}

function fetchWeather(data) {
    showLoadingMsg();
    if (data.length === 0) {
        // display Error Msg
        return;
    }

    const lon = data[0].lon;
    const lat = data[0].lat;
    const apiUrl = `https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=${lat}&lon=${lon}&exclude=hourly,minutely,alerts&appid=${apiKey}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
        });
};

function displayCity(data) {
    if (data.length === 0) {
        // display error
        return;
    }
    const result = data[0];
    const city = `${result.name}, ${result.state}`;
    $('#lblCity').html(city);

};

function displayWeather(weatherData) {
    hideLoadingMsg();
    $('#lblTemp').html(weatherData.current.temp + ' &deg;F');
    $('#lblWind').html(weatherData.current.wind_speed + ' MPH');
    $('#lblUvIndex').html(weatherData.current.uvi);
    $('#lblHumidity').html(weatherData.current.humidity + ' %');
    let currentDate = new Date();
    $('#fiveDayForecast').html("");
    for (let i =0; i < 5; i++){
        currentDate.setDate(currentDate.getDate() + (1));
        const dailyWeather = weatherData.daily[i];
        let htmlString = `
        <div class="row">
            <div class="col-lg-5"> 
            <div class="card" style="width: 15 rem;">
                <div class="card-body">
                    <h5 class="card-title">${currentDate.toDateString()}</h5>
                    <div>
                        <strong>Temp:</strong>
                        <span>${dailyWeather.temp.day} &deg;F</span>
                    </div>
                    <div>
                        <strong>Wind:</strong>
                        <span>${dailyWeather.wind_speed} MPH</span>
                    </div>
                    <div>
                        <strong>Humidity:</strong>
                        <span>${dailyWeather.humidity} %</span>
                    </div>
                </div>
            </div>
            </div>
        </div>`;
        
        $('#fiveDayForecast').append($(htmlString));

    }

}

