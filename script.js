let x;
let y;
let tempInC = true;
let tempInF = false;
let key = `af297e1e140241f482131106240703`;

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setPosition);

    } else {
        console.log("Error");
    }
}

function setPosition(position) {
    x = position.coords.latitude;
    y = position.coords.longitude;
    showCurrentLocation(x, y)
}
async function showSearchedLocation(location) {


    try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${key}&q=${location}`);
        const data = await response.json();
        if (data["error"]) {
            createPopup();
        } else if (data["current"]) {
            document.getElementById("auto-location-img").src = data["current"]["condition"]["icon"];
            document.getElementById("auto-location").innerHTML = data["location"]["name"];
            document.getElementById("auto-location-temprature").innerHTML = data["current"]["temp_c"];
            document.getElementById("btn-change-temprature-c").style.fontWeight = 'bold';
            document.getElementById("btn-change-temprature-f").style.fontWeight = "";
            document.getElementById("btn-change-temprature-c").style.opacity = 1;
            document.getElementById("btn-change-temprature-f").style.opacity = 0.3;
            document.getElementById("Precipitation").innerHTML = "Precipitation : " + data['current']['precip_mm'] + " %";
            document.getElementById("Humidity").innerHTML = "Humidity : " + data['current']['humidity'] + " %";
            document.getElementById("Wind").innerHTML = "Wind : " + data['current']['wind_kph'] + " km/h";
            document.getElementById("condition-text").innerHTML = "Condition : " + data["current"]["condition"]["text"].toUpperCase();
            document.getElementById("location").innerHTML = data["location"]["tz_id"];
            document.getElementById("country").innerHTML = data["location"]["country"];
            document.getElementById("region").innerHTML = data["location"]["region"];
            x = data["location"]["lat"];
            y = data["location"]["lon"];

            initializeMap(x, y)
            var outputDiv = document.getElementById("out-put");
            outputDiv.style = '';
            outputDiv.innerHTML = ""; 
            smoothScroll("weather-current")
            await show_future_forecast();
            await showMaps();
        }
    } catch (error) {
        console.error("Error:", error);
    }

}
function showCurrentLocation(latitudeX, longitudeY) {
    showSearchedLocation(`${latitudeX},${longitudeY}`)
}
function updateTemperature(type) {
    let currentLocation = document.getElementById("auto-location").innerText;
    let newType;
    if (type == 'c') {
        newType = 'temp_c';
        document.getElementById("btn-change-temprature-c").style.fontWeight = 'bold';
        document.getElementById("btn-change-temprature-f").style.fontWeight = "";
        document.getElementById("btn-change-temprature-c").style.opacity = 1;
        document.getElementById("btn-change-temprature-f").style.opacity = 0.3;
    } else if (type == 'f') {
        newType = 'temp_f';
        document.getElementById("btn-change-temprature-f").style.fontWeight = 'bold';
        document.getElementById("btn-change-temprature-c").style.fontWeight = "";
        document.getElementById("btn-change-temprature-c").style.opacity = 0.3;
        document.getElementById("btn-change-temprature-f").style.opacity = 1;
    }
    fetch(`https://api.weatherapi.com/v1/current.json?key=${key}&q=${currentLocation}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("auto-location-temprature").innerHTML = data["current"][newType];
        });
}
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


function changeMode(checkbox) {
    if (checkbox.checked) {
        document.documentElement.setAttribute("data-bs-theme", "dark");
    } else {
        document.documentElement.setAttribute("data-bs-theme", "light");
    }
}

function updateTime() {
    let currentTime = new Date();
    let hours = currentTime.getHours();
    let minutes = currentTime.getMinutes();
    let seconds = currentTime.getSeconds();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    let formattedTime = hours + ":" + minutes + ":" + seconds;
    document.getElementById("time-now").innerHTML = formattedTime;
}

setInterval(updateTime, 1000);

updateTime();

function smoothScroll(divID) {
    var targetDiv = document.getElementById(`${divID}`);
    smoothScrollTo(targetDiv);
}


function smoothScrollTo(target) {
    const startPosition = window.pageYOffset;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    const distance = targetPosition - startPosition;
    const scrollStep = Math.PI / (500 / 15);

    let currentTime = 0;

    function animateScroll() {
        currentTime += 15;
        const run = easeInOut(currentTime, startPosition, distance, 500);
        window.scrollTo(0, run);

        if (currentTime < 500) {
            requestAnimationFrame(animateScroll);
        }
    }
    function easeInOut(currentTime, startPosition, distance, duration) {
        currentTime /= duration / 2;
        if (currentTime < 1) return distance / 2 * currentTime * currentTime + startPosition;
        currentTime--;
        return -distance / 2 * (currentTime * (currentTime - 2) - 1) + startPosition;
    }

    animateScroll();
}


var map;
function initializeMap(latitude, longitude) {
    if (map) {
        map.remove();
    }
    map = L.map('map').setView([latitude, longitude], 13); // Set initial coordinates and zoom level

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    var marker = L.marker([latitude, longitude]).addTo(map); // Add a marker at specified coordinates
}




//                ------Weather Future-------
async function show_future_forecast() {
    var currenttLocation = document.getElementById("auto-location").innerText;

    if (currenttLocation != "") {

        let today = new Date();

        var outputDiv = document.getElementById("forecast-future");
        outputDiv.style = '';
        outputDiv.style.transition = ".7s";
        outputDiv.innerHTML = "";
        outputDiv.style.borderCollapse = "collapse";
        outputDiv.style.margin = "20px";

        var containerDiv = document.createElement("div");
        containerDiv.className = "table-container";
        containerDiv.style.overflow = "auto";
        containerDiv.style.maxHeight = "300px";

        var table = document.createElement("table");
        table.className = "weather-table";
        var headerRow = table.insertRow();
        headerRow.className = "header-row";

        var dataRow1 = table.insertRow();
        dataRow1.className = "data-row";

        var dataRow2 = table.insertRow();
        dataRow2.className = "data-row";

        var currenttLocation = document.getElementById("auto-location").innerText;

        for (var i = 0; i < 7; i++) {
            await new Promise((resolve, reject) => {
                var date = new Date(today);
                date.setDate(date.getDate() + i + 1);
                var year = date.getFullYear();
                var month = (date.getMonth() + 1).toString().padStart(2, '0');
                var day = date.getDate().toString().padStart(2, '0');
                var formattedDate = year + '-' + month + '-' + day;

                fetch(`https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${currenttLocation}&dt=${formattedDate}`)
                    .then(response => response.json())
                    .then(data => {
                        var header = headerRow.insertCell(i);
                        header.innerHTML = data["forecast"]["forecastday"][0]["date"];
                        header.className = "header-cell";

                        var cell1 = dataRow1.insertCell(i);
                        cell1.className = "data-cell";
                        var img = document.createElement("img");
                        img.src = data["forecast"]["forecastday"][0]["day"]["condition"]["icon"];
                        cell1.appendChild(img);

                        var cell2 = dataRow2.insertCell(i);
                        cell2.className = "data-cell";
                        cell2.innerHTML = data["forecast"]["forecastday"][0]["day"]["condition"]["text"];
                        cell2.style.fontSize = "10px";
                        resolve();
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        }

        containerDiv.appendChild(table);
        outputDiv.appendChild(containerDiv);
    }
}
//                ------Weather Future-------



//                  ---------popup screen--------

function createPopup() {
    var overlay = document.getElementById('overlay');
    var popup = document.getElementById('popup');

    if (popup && overlay) {
        popup.style.display = 'block';
        overlay.style.display = 'block';
        return;
    }

    overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.classList.add('overlay');

    popup = document.createElement('div');
    popup.id = 'popup';
    popup.classList.add('popup');
    popup.style.textAlign = 'center';

    var title = document.createElement('h2');
    title.id = 'title';
    title.textContent = 'Invalid Location';
    title.style.color = 'white';

    var paragraph = document.createElement('p');
    paragraph.textContent = 'Please try Again..';
    paragraph.style.color = 'white';

    var closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = closePopup;

    popup.appendChild(title);
    popup.appendChild(paragraph);
    popup.appendChild(closeButton);

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    overlay.style.display = 'block';
    popup.style.display = 'block';
}

function closePopup() {
    var overlay = document.getElementById('overlay');
    var popup = document.getElementById('popup');
    overlay.style.display = 'none';
    popup.style.display = 'none';
    document.getElementById('inputLocation').value = "";
    document.getElementById('inputLocation').focus();

}


window.onload = function () {
    window.scrollTo(0, 0);
};




//----------------news


//   function createElements() {
//     let tempCurrentLocation = document.getElementById("auto-location").innerText;

//     console.log(tempCurrentLocation);
//     fetch(`https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${tempCurrentLocation}&alerts=yes`)
//       .then(response => response.json())
//       .then(data => {
//         if (data["alerts"]) {


//           var container = document.createElement('div');
//           container.classList.add('container');

//           var row = document.createElement('div');
//           row.classList.add('row');

//           var column = document.createElement('div');
//           column.classList.add('col-md-6', 'col-sm-12');

//           var gridItem = document.createElement('div');
//           gridItem.classList.add('grid-item');
//           gridItem.textContent = 'This is a grid item';

//           column.appendChild(gridItem);

//           row.appendChild(column);

//           container.appendChild(row);

//           document.body.appendChild(container);
//         }
//         else {
//           console.log("no news");
//         }
//       });
//   }
//----------------news