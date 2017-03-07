$(function() {
    if (annyang) {
        annyang.addCallback('result', function(phrases) {
            $('#leftRecipes').append('<div class="notification"><button class="delete"></button>' + phrases[0] + '</div>');
            $.ajax({
                url: 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/food/converse',
                type: 'GET',
                dataType: "html",
                headers: {
                    "X-Mashape-Key": "HyQC5oSqg6mshULr8QtDBoz6Zhgwp1OAEqRjsnrqsHATpQeU8Y",
                    "Accept": "application/json"
                },
                data: {
                    text: phrases[0],
                }
            }).done(function(data) {
                frigio
                var frigio = new SpeechSynthesisUtterance();
                console.log(data.media);
                frigio.text = JSON.stringify(JSON.parse(data).answerText);
                speechSynthesis.speak(frigio);
                $('#leftRecipes').append('<div class="notification is-primary your-question"><button class="delete"></button>' + frigio.text + '</div>');
            });

        });


    }

    setInterval(function() {
        function formatAMPM(date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'P.M.' : 'A.M.';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }
        $('#clock').html(formatAMPM(new Date()))
    }, 1000);

    $.simpleWeather({
        location: 'Miami, FL',
        woeid: '',
        unit: 'f',
        success: function(weather) {
            html = '<h2>' + weather.temp + '&deg;' + weather.units.temp + '</h2>';

            $("#weatheroutside").html(html);
        },
        error: function(error) {
            $("#weather").html('<p>' + error + '</p>');
        }
    });

    var socket = io.connect('https://smartfridge-jjm15c.c9users.io');
    socket.on('ingredientList', function(data) {
        console.log(data);
        var send = "";
        var title = "Recipes with: ";
        for (var x = 0; x < data.length; x++) {
            if (x === data.length - 1) {
                send += data[x];
                title += data[x];
            }
            else {
                send += data[x] + "%2C";
                title += data[x] + ". ";
            }
        }
        populateRecipes(send, title);
    })

    socket.on('temp', function(data) {
        $('#weather').html('<h2>' + data + '&deg;F' + '</h2>');
    });


});

function toggleRecipeModal(idOfRecipe) {
    if (idOfRecipe == null) {
        $('#recipeModal').toggleClass("is-active");
    }
    else {
        $.ajax({
            url: 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/' + idOfRecipe + '/information',
            type: 'GET',
            dataType: "json",
            headers: {
                "X-Mashape-Key": "HyQC5oSqg6mshULr8QtDBoz6Zhgwp1OAEqRjsnrqsHATpQeU8Y"
            },
            data: {}
        }).done(function(data) {
            var ingredientString = "";
            $('#recipeModal').toggleClass("is-active");
            $("#recipeTitle").html(data.title)
            $("#recipeDirections").html(data.instructions)
            $('#recipeImage').attr("src", data.image)
            $('#recipeReadyTime').html(data.readyInMinutes + " Mins")
            $('#ingredient-left-column').html("");
            $('#healthyReport').html(JSON.stringify(data.veryHealthy));
            $('#ingredient-right-column').html("");
            for (var g = 0; g < data.extendedIngredients.length; g++) {
                ingredientString += data.extendedIngredients[g].amount + " " + data.extendedIngredients[g].unit + " of " + data.extendedIngredients[g].name + " ";
                if (g % 2 == 0) {
                    $('#ingredient-left-column').append('<p> <i class="fa fa-plus-square-o" aria-hidden="true"></i> ' + data.extendedIngredients[g].originalString + '</p>')
                }
                else {
                    $('#ingredient-right-column').append('<p> <i class="fa fa-plus-square-o" aria-hidden="true"></i> ' + data.extendedIngredients[g].originalString + '</p>')
                }
            }
            $.ajax({
                url: 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/visualizeNutrition',
                type: 'POST',
                dataType: "html",
                headers: {
                    "X-Mashape-Key": "HyQC5oSqg6mshULr8QtDBoz6Zhgwp1OAEqRjsnrqsHATpQeU8Y"
                },
                data: {
                    defaultCss: true,
                    ingredientList: ingredientString,
                    servings: data.servings
                }
            }).done(function(data) {
                $('#hiddenGraph').html(data);
                $('#nutritionInfo').html("");
                $('.spoonacular-quickview').each(function(index) {
                    $('#nutritionInfo').append("<p>" + $(this).text() + "</p>");
                });
                // 
            });
        })
    }
}

function populateRecipes(list, title) {
    $.post("https://smartfridge-jjm15c.c9users.io/getRecipe", {
        ingredients: list //seperate by %2C
    }, function(data) {
        $("#ingredients").html("");
        $("#ingredients").html(title);
        $('#rightRecipes').html("");
        for (var a = 0; a < data.body.length; a++) {
            $('#rightRecipes').append('<a onclick="toggleRecipeModal(' + data.body[a].id + ');"><div class="box"><article class="media"><div class="media-left noOverflow"><figure class="image is-64x64"><img src="' + data.body[a].image + '" alt="Image of recipe"></figure></div><div class="media-content"><div class="content"><p><strong>' + data.body[a].title + '</strong><br> For this recipe you will need to use ' + data.body[a].usedIngredientCount + ' of your ingredients and buy ' + data.body[a].missedIngredientCount + ' ingredients.</p></div></div></article></div></a>');

        }
    });
}

// function sendRecipeText(url) {
//     var dataa = {message:url, media:''}
//     $.ajax({
//         url: '/text',
//         type: 'POST',
//         dataType: "json",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         data: {
//             dataa
//         }
//     })

// }
