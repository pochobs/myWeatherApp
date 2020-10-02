selectedCitiesEl = document.querySelector("#selectedCities");
searchCityInputEl = document.querySelector("#searchCityInput");
errorEl = document.querySelector("#error");
var selectedCitiesAr = [];

//Add a new city to the list of selected cities and save to Local Storage
var addCityToList = function(cityName){
    var liEl = document.createElement("li");
    liEl.innerHTML = cityName;
    liEl.className= "list-group-item";
    liEl.setAttribute("data-city",cityName);
    selectedCitiesEl.appendChild(liEl);
}

//Save new city to Local Storage
var addNewCityToLocalStorage = function(cityName){
    selectedCitiesAr.push(cityName);
    localStorage.setItem("citiesWeather", JSON.stringify(selectedCitiesAr));
}

//Read the City List from the Local Storage
var readCitiesList = function(){
    var listItems = localStorage.getItem("citiesWeather");
    if (listItems){
        selectedCitiesAr = JSON.parse(listItems);

        for (i = 0; i < selectedCitiesAr.length; i++){
            addCityToList(selectedCitiesAr[i]);
        }
    }
}

//Display error message
var displayError = function(errorToDisplay, cityname){
   if (!errorEl.innerHTML)
        errorEl.innerHTML = "Error getting data for " + cityname + ": " + errorToDisplay;
}

//API to get current UV index
var getCurrentUVIndex = function(lon, lat, cityName){
    var apiUrlVIndex = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=54f32668a2bf6aeb6c55df89a2e807fb";

    fetch(apiUrlVIndex).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                var elUVIndex = document.getElementById("UVIndex");
                elUVIndex.innerHTML = data.value;
                if (data.value<=2)
                    elUVIndex.style.backgroundColor = "green";
                else if (data.value<=5)
                    elUVIndex.style.backgroundColor = "yellow";
                else if (data.value<=7)
                    elUVIndex.style.backgroundColor = "orange";
                else if (data.value<=10)
                    elUVIndex.style.backgroundColor = "red";
                else
                    elUVIndex.style.backgroundColor = "purple";
            });
        } else {
            displayError(response.statusText, cityName);
        }
    })
    .catch(function(error){
        displayError("Unable to connect to the server.", cityname);
    });
}

//API to get current weather
var getCurrentWeather = function(cityName, needToAddList){

    errorEl.innerHTML="";

    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=54f32668a2bf6aeb6c55df89a2e807fb";
  
    fetch(apiUrl).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                var containerCurWeather = document.getElementById("containerCurWeather");
                containerCurWeather.className = containerCurWeather.className.replace(/\binvisible\b/g, "visible");
                document.getElementById("cityNameWeather").innerHTML = data.name + "&nbsp;&nbsp;(" + moment().format("M/DD/YYYY") + ")";
                document.getElementById("currentWeatherIcon").src = "http://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
                document.getElementById("temperature").innerHTML = data.main.temp + " °F";
                document.getElementById("humidity").innerHTML = data.main.temp + " %";
                document.getElementById("windSpeed").innerHTML = data.wind.speed + " MPH";
                document.getElementById("UVIndex").innerHTML = data.main.temp;
                getCurrentUVIndex(data.coord.lon, data.coord.lat, data.name);

                //add city to the list and save to local storage
                if (needToAddList && !selectedCitiesAr.includes(data.name)){
                    addCityToList(data.name);
                    addNewCityToLocalStorage(data.name);
                }

            });
        } else {
            displayError(response.statusText, data.name);
        }
    })
    .catch(function(error){
        displayError("Unable to connect to the server.", cityName);
    });
}

// Get 5 days forecast
var get5daysWeather = function(cityName){
    var apiUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial&appid=54f32668a2bf6aeb6c55df89a2e807fb";
  
    fetch(apiUrl).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {

                console.log(data);

                var j = 1;
                for (i=0; i< data.list.length; i++){
                    // get 3pm weather conditions
                    if (data.list[i].dt_txt.includes("15:00")){
                        var container5DaysWeather = document.getElementById("container5DaysWeather");
                        container5DaysWeather.className = container5DaysWeather.className.replace(/\binvisible\b/g, "visible");
    
                        var container5DaysHeading = document.getElementById("container5DaysHeading");
                        container5DaysHeading.className = container5DaysHeading.className.replace(/\binvisible\b/g, "visible");
    
                        var cardEl = document.getElementById("card" + j );
                        cardEl.className = "card-body bg-primary text-white rounded-sm";
                        cardEl.innerHTML="";
                        
                        var h5El = document.createElement("h5");
                        h5El.innerHTML= moment(data.list[i].dt_txt).format("MM/DD/YYYY");
                        cardEl.appendChild(h5El);
    
                        var imgIcon = document.createElement("img");
                        imgIcon.src = "http://openweathermap.org/img/wn/" + data.list[i].weather[0].icon + ".png";
                        cardEl.appendChild(imgIcon);
    
                        var tempEl = document.createElement("div");
                        tempEl.innerHTML = "Temp:&nbsp;&nbsp;" + data.list[i].main.temp + "°F";
                        cardEl.appendChild(tempEl);
    
                        var humidityEl = document.createElement("div");
                        humidityEl.innerHTML = "Humidity:&nbsp;&nbsp;" + data.list[i].main.humidity + "%";
                        cardEl.appendChild(humidityEl);

                        j++;
                    }
                }
            });
        } else {
            displayError(response.statusText, cityName);
        }
    })
    .catch(function(error){
        displayError("Unable to connect to the server.", cityName);
    });
}

// Search City after the Search button is clicked
var searchCity = function(){
    if (!searchCityInputEl.value){
        return;
    }
    var cityName = searchCityInputEl.value.trim();

    //get current weather (APi call)
    getCurrentWeather(cityName, true);
    get5daysWeather(cityName);

    searchCityInputEl.value = "";
}

//Search City Weater when clicked on the city from the list
var selectCityFromList = function(event){
    var targetEl = event.target;
    var cityName = event.target.getAttribute("data-city");
    getCurrentWeather(cityName, false);
    get5daysWeather(cityName);
}

selectedCitiesEl.addEventListener("click", selectCityFromList);

readCitiesList();