
var currentCity={
    name:"",
    date:"",
    lat:"",
    lon:"",
    apiKey:"3b1610e3cb22536d952e4fc65d87115f",
    icon:"",
    temperature:"",
    humidity:"",
    windspeed:"",
    UVindex:"",
    indexColor:"",
    forecast : [], //an array to store the forecast for the next 5 days.  
};
var button = $("button");
var input = $("input");
render();  
//search button here:
button.click(function(event){
    if (event.target.getAttribute("id") == "search"){
        var city = input.val();
        currentCity.name = city;
        updateCities(city);
    }      
    
    //AHH!!! The render function needs to go inside of the stupid then statement cause if not, we'd get no content!
})

function updateCities(city){
    var date = new Date();
    var todayDate = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear();
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q="+currentCity.name+"&appid=" + currentCity.apiKey + "&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET"

    }).then(function(response){
        currentCity.date = todayDate;
        currentCity.name = response.name;
        currentCity.icon = response.weather[0].icon;
        currentCity.temperature = response.main.temp;
        currentCity.humidity = response.main.humidity;
        currentCity.windspeed = response.wind.speed;
        currentCity.lon = response.coord.lon;
        currentCity.lat = response.coord.lat;
        queryURL = "https://api.openweathermap.org/data/2.5/uvi?appid="+currentCity.apiKey+ "&lat=" + currentCity.lat + "&lon=" + currentCity.lon;
        $.ajax({
            url: queryURL,
            method: "GET"
    
        }).then(function(response){
            currentCity.UVindex = response.value;  
            if (currentCity.UVindex <4){
                currentCity.indexColor = "favorable";
            }else if (currentCity.UVindex <7){
                currentCity.indexColor = "moderate";
            }else {
                currentCity.indexColor = "severe";
            }
            queryURL = "https://api.openweathermap.org/data/2.5/forecast?q="+currentCity.name+"&units=imperial"+"&appid="+currentCity.apiKey;
            console.log(queryURL);
            $.ajax({
                url: queryURL,
                method: "GET"
        
            }).then(function(response){
                for (var i = 0; i <5; i++){
                    var day = {};
                    var date = new Date();
                    var addDays = i + 1;
                    date.setDate(date.getDate()+addDays);
                    day.date = date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear();
                    day.temp = response.list[i].main.temp;
                    day.humidity = response.list[i].main.humidity;
                    day.icon = response.list[i].weather[0].icon;
                    currentCity.forecast.splice(i, 1, day);
                    
                }
                let citySerialized = JSON.stringify(currentCity);
                localStorage.setItem(currentCity.name, citySerialized);  //So I get the benefit of overwriting the city name.
                render();  
            })            
        })
    })
}

function render(){
    //console.log("render running")
    var historySearch = $(".city");
    historySearch.text("");
    for (var i = 0; i < localStorage.length; i++){  
        var cityHistory = JSON.parse(localStorage.getItem(localStorage.key(i)));
        historySearch.append(`<button style="width:82%" class = ${cityHistory.name} id="history">${ cityHistory.name }</button>`);
        //event delegate it, so that when it is clicked, currentCity = that city.
    }
    displayCurrent();

    //render the current city forecast.
}

function displayCurrent(){
    if (currentCity.name != ""){
        //console.log("running")
        var currentDisplay = $('.info');
        currentDisplay.text("");
        currentDisplay.append(`<h2> ${currentCity.name} (${currentCity.date}) </h2>`);
        currentDisplay.append(`<p>Temperature: ${currentCity.temperature}`);
        currentDisplay.append(`<p>Humidity: ${currentCity.humidity}%`);
        currentDisplay.append(`<p>Wind Speed: ${currentCity.windspeed} MPH</p>`);
        currentDisplay.append(`<p>UV Index: <span id="${currentCity.indexColor}">${currentCity.UVindex} </span></p>`);
        var i = 0;
        currentCity.forecast.forEach(function(element){
            var cellNumber = $(`.cell${i+1}`);
            cellNumber.text("");
            cellNumber.append(`<p style="margin:5px">${element.date} </p>`);
            //icon goes here
            cellNumber.append(`<p style="margin:5px">Temperature: ${element.temp}</p>`);
            cellNumber.append(`<p style="margin:5px">Humidity: ${element.humidity}%</p>`);
            i++;
        })
    }else {
        return;
    }
}
//Part 3;
$('button').click(function(event){
    //console.log("clicked")
    /*
    delegate onclick event
    So if a button is clicked, then set the currentCity to be the city returned from
    localStorage with that city's key.  Then simply run again the render function.
    */ 
    if (event.target.getAttribute("id") == "history"){
        //console.log("clicked saved buttons");
        currentCity = JSON.parse(localStorage.getItem(event.target.getAttribute("class")));
        console.log(currentCity.name);
        updateCities(currentCity.name);
        //render();
    }
    /*
    console.log(JSON.parse(localStorage.getItem(event.target.getAttribute("class"))));
    currentCity = JSON.parse(localStorage.getItem(event.target.getAttribute("class")));
    render();*/
})

