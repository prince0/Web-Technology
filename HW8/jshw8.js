    $( document ).ready(function() {
       var LocalStorage = function() {
            this.store =  [];

            this.get = function(symbol) {
              var index = this.store.indexOf(symbol);
              return this.store[index];
            };

            this.remove = function(symbol) {
              var index = this.store.indexOf(symbol);
              if (index != -1) {
                this.store.splice(index, 1);
                window.localStorage.setItem("stocksearch", JSON.stringify(this.store));
                $('#' + symbol).remove();
              }
            };


            this.set = function(symbol, data) {
              if (this.get(symbol)) return;
              this.store.push(symbol);
              window.localStorage.setItem("stocksearch", JSON.stringify(this.store));
              appendToFavorite(symbol);
              updateFavorite(symbol, data);
            };
    };

    var ls = new LocalStorage();
    ls.store = window.localStorage.getItem("stocksearch") ?  JSON.parse(window.localStorage.getItem("stocksearch")) : [] ;
    var refreshCounter;

    function refresh() {
      ls.store.forEach(function(symbol) {
        appendToFavorite(symbol);
        ajaxRequest(symbol);
      });
    };

    $('#refresh').click(function(){
      refresh();
    });

    $('#chkAutoRefresh').change(function() {
      if ($(this).is(':checked')) {
        refreshCounter = setInterval(function() {
          refresh();
        }, 5000);
      } else {
        clearInterval(refreshCounter);
      }
    });

    var appendToFavorite = function(symbol) {          
          var tr = $('#' + symbol);
          if (tr.length == 0) {
            //build tr according to format
            console.log("symbol="+symbol);
            tr = $('<tr style="display:none;" id="' + symbol + '"><td><a href="#" id="'+symbol+'_link" data-target="#stockcarousal" data-slide-to="1">'+symbol+'</a></td><td id="' +symbol+ '_price"></td><td id="' +symbol+ '_change"></td><td id="'+symbol+'_volume"></td><td><a href="#" id="' + symbol +'_remove"><div class="glyphicon glyphicon-trash"></div></a></td></tr>');
            $('#fav').append(tr);

            $('#' + symbol + '_remove').click(function() {
              $(this).parents('tr').remove();
              ls.remove(symbol);
            });

            $('#'+ symbol+'_link').click(function(){
              getquotedata(symbol);
            });
      
          }
    };

    var updateFavorite = function(symbol, data) {        
      var keys = Object.keys(data["Time Series (Daily)"]);
      var current = data["Time Series (Daily)"][keys[0]];
      var past = data["Time Series (Daily)"][keys[1]];   
      var lastPrice = Number(current['4. close']).toFixed(2);
      var pastclose = Number(past['4. close']).toFixed(2);
      var change = (lastPrice - pastclose).toFixed(2);
      var percent = (change / pastclose * 100).toFixed(2); 
      
      
      var volume = formatNumber(Number(current['5. volume'])); 
      var cdata ="";    
      if(change.substring(0,1) !== "-")
      {
        cdata="<span style='color : green;'>"+change+" ("+percent+"%) <img src=\"http://cs-server.usc.edu:45678/hw/hw6/images/Green_Arrow_Up.png\" class='size'></span>";
      }
      else
      {
        cdata="<span style='color : red;'>"+change+" ("+percent+"%) <img src=\"http://cs-server.usc.edu:45678/hw/hw6/images/Red_Arrow_Down.png\" class='size'></span>"; 
      }          
          //$('#' + symbol + '_name').html(data['Name']);
         
          $('#' + symbol + '_price').html(lastPrice);
         
          $('#' + symbol + '_change').html(cdata);
          
          $('#' + symbol + '_volume').html(volume);

          $('#' + symbol).show();
    };

    var ajaxRequest  = function (symb)
    {
      var symburl=  "http://shrushtpwebtechhw8-env.us-east-2.elasticbeanstalk.com/?symbol="+symb+"&type=Price";;
      
      $.ajax({
        type : 'GET',
        url : symburl,
        dataType : "json",
        success : function(data) {
          updateFavorite(symb, data);
        }
      });
    }

    refresh();

       $("#filterBy").change(function() {
        if(this.value !== "Default"){
            $("#orderBy").removeAttr("disabled");
            $("#orderBy").css("background-color","white");
            if(this.value === "Symbol"){
                if($("#orderBy").val() === "Ascending"){
                    ascSortSymbol();
                }else{
                    descSortSymbol();
                }
            } else if(this.value === "Price"){
                if($("#orderBy").val() === "Ascending"){
                    ascSortPrice();
                }else{
                    descSortPrice();
                }
            } else if(this.value === "Change"){
                if($("#orderBy").val() === "Ascending"){
                    ascSortChange();
                }else{
                    descSortChange();
                }
            } else if(this.value === "Change Percent"){
                if($("#orderBy").val() === "Ascending"){
                    ascSortPercent();
                }else{
                    descSortPercent();
                }
            } else if(this.value === "Volume"){
                if($("#orderBy").val() === "Ascending"){
                    ascSortVolume();
                }else{
                    descSortVolume();
                }
            }
        }else {
            $("#orderBy").attr("disabled",true);
            $("#orderBy").css("background-color","#efefef");
        }
    });
    $("#orderBy").change(function() {
        if(this.value === "Ascending"){
            if($("#filterBy").val() === "Symbol"){
                ascSortSymbol();
            } else if($("#filterBy").val() === "Price"){
                ascSortPrice();
            } else if($("#filterBy").val() === "Change"){
                ascSortChange();
            } else if($("#filterBy").val() === "Change Percent"){
                ascSortPercent();
            } else if($("#filterBy").val() === "Volume"){
                ascSortVolume();
            }
        }else {
            if($("#filterBy").val() === "Symbol"){
                descSortSymbol();
            } else if($("#filterBy").val() === "Price"){
                descSortPrice();
            } else if($("#filterBy").val() === "Change"){
                descSortChange();
            } else if($("#filterBy").val() === "Change Percent"){
                descSortPercent();
            } else if($("#filterBy").val() === "Volume"){
                descSortVolume();
            }
        }
    });

    function ascSortSymbol() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("favTable");
        switching = true;
        while (switching) {
            switching = false;
            rows = table.getElementsByTagName("TR");
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("TD")[0];
                y = rows[i + 1].getElementsByTagName("TD")[0];
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch= true;
                    break;
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }
    function descSortSymbol() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("favTable");
        switching = true;
        while (switching) {
            switching = false;
            rows = table.getElementsByTagName("TR");
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("TD")[0];
                y = rows[i + 1].getElementsByTagName("TD")[0];
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch= true;
                    break;
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }
    function ascSortPrice() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("favTable");
        switching = true;
        while (switching) {
            switching = false;
            rows = table.getElementsByTagName("TR");
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("TD")[1];
                y = rows[i + 1].getElementsByTagName("TD")[1];
                if (Number(x.innerHTML) > Number(y.innerHTML)) {
                    shouldSwitch= true;
                    break;
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }
    function descSortPrice() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("favTable");
        switching = true;
        while (switching) {
            switching = false;
            rows = table.getElementsByTagName("TR");
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("TD")[1];
                y = rows[i + 1].getElementsByTagName("TD")[1];
                if (Number(x.innerHTML) < Number(y.innerHTML)) {
                    shouldSwitch= true;
                    break;
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }
    function ascSortChange() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("favTable");
        switching = true;
        while (switching) {
            switching = false;
            rows = table.getElementsByTagName("TR");
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("TD")[2];
                y = rows[i + 1].getElementsByTagName("TD")[2];
                var a = x.firstElementChild.innerHTML;
                a = a.substr(0, a.indexOf(' '));
                var b = y.firstElementChild.innerHTML;
                b = b.substr(0, b.indexOf(' '));
                if (Number(a) > Number(b)) {
                    shouldSwitch= true;
                    break;
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }
    function descSortChange() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("favTable");
        switching = true;
        while (switching) {
            switching = false;
            rows = table.getElementsByTagName("TR");
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("TD")[2];
                y = rows[i + 1].getElementsByTagName("TD")[2];
                var a = x.firstElementChild.innerHTML;
                a = a.substr(0, a.indexOf(' '));
                var b = y.firstElementChild.innerHTML;
                b = b.substr(0, b.indexOf(' '));
                if (Number(a) < Number(b)) {
                    shouldSwitch= true;
                    break;
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }
    function ascSortPercent() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("favTable");
        switching = true;
        while (switching) {
            switching = false;
            rows = table.getElementsByTagName("TR");
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("TD")[2];
                y = rows[i + 1].getElementsByTagName("TD")[2];
                var a = x.innerHTML;
                a = a.substring(a.indexOf('(') + 1, a.indexOf('%'));
                var b = y.innerHTML;
                b = b.substring(b.indexOf('(') + 1, b.indexOf('%'));
                if (Number(a) > Number(b)) {
                    shouldSwitch= true;
                    break;
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }
    function descSortPercent() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("favTable");
        switching = true;
        while (switching) {
            switching = false;
            rows = table.getElementsByTagName("TR");
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("TD")[2];
                y = rows[i + 1].getElementsByTagName("TD")[2];
                var a = x.innerHTML;
                a = a.substring(a.indexOf('(') + 1, a.indexOf('%'));
                var b = y.innerHTML;
                b = b.substring(b.indexOf('(') + 1, b.indexOf('%'));
                if (Number(a) < Number(b)) {
                    shouldSwitch= true;
                    break;
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }
    function ascSortVolume() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("favTable");
        switching = true;
        while (switching) {
            switching = false;
            rows = table.getElementsByTagName("TR");
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("TD")[3];
                y = rows[i + 1].getElementsByTagName("TD")[3];
                var a = x.innerHTML;
                a = Number(a.split(",").join(""));
                var b = y.innerHTML;
                b = Number(b.split(",").join(""));
                if (Number(a) > Number(b)) {
                    shouldSwitch= true;
                    break;
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }
    function descSortVolume() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("favTable");
        switching = true;
        while (switching) {
            switching = false;
            rows = table.getElementsByTagName("TR");
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("TD")[3];
                y = rows[i + 1].getElementsByTagName("TD")[3];
                var a = x.innerHTML;
                a = Number(a.split(",").join(""));
                var b = y.innerHTML;
                b = Number(b.split(",").join(""));
                if (Number(a) < Number(b)) {
                    shouldSwitch= true;
                    break;
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }
           
 

    $("button#getquotebtn").click(function(){
      textipdata = document.getElementById("stock_text").value.trim(); 
      if(textipdata=="") {
        document.getElementById('error').innerHTML="Please enter a stock ticker symbol";
        return;
      }
      document.getElementById('error').innerHTML="";
      var html = '<div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated active" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100" style="width: 50%"></div></div>';
      $("#tabledata").html( html);
      $("#Price").html( html);
      $("#SMA").html( html);
      $("#EMA").html( html);
      $("#STOCH").html( html);
      $("#RSI").html( html);
      $("#ADX").html( html);
      $("#CCI").html( html);
      $("#BBANDS").html( html);
      $("#MACD").html( html);
      $("#historical_charts").html( html);
      $("#news_feeds").html( html);
      
      // $("#progress").html( html);
     
      getquotedata(textipdata, "Price");            
      getquotedata(textipdata, "SMA");
      getquotedata(textipdata, "EMA");
      getquotedata(textipdata, "STOCH");
      getquotedata(textipdata, "RSI");
      getquotedata(textipdata, "ADX");
      getquotedata(textipdata, "CCI");
      getquotedata(textipdata, "BBANDS");
      getquotedata(textipdata, "MACD");
    });

    function displayStockData(type,data){
       if(!data.hasOwnProperty('Meta Data') || data.toString().indexOf("Error") >-1) {
        $("#tabledata").addClass('error');
        $("#tabledata").html( "Error! Failed to get current stock data.");
      } else {
          $("#tabledata").removeClass('error');
      var html = "";
      var keys = Object.keys(data["Time Series (Daily)"]);
      var current = data["Time Series (Daily)"][keys[0]];
      var past = data["Time Series (Daily)"][keys[1]];   
      var currentclose = parseFloat(current['4. close']).toFixed(2);
      var pastclose = parseFloat(past['4. close']).toFixed(2);
      var change = (currentclose - pastclose).toFixed(2);
      var percent = (change / pastclose * 100).toFixed(2);
      var date = data["Meta Data"]["3. Last Refreshed"];
      var volume = ""+current['5. volume'];
      volume = volume.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
      if(date.length<12) date = date + " 16:00:00"; 

      html+= '<table id = "stockTable" class="table table-striped"><tr><td class ="space1">Stock Ticker Symbol</td><td class = "space2">'+data["Meta Data"]["2. Symbol"]+'</td></tr>';
      html+= '<tr><td class = "space1">Last Price</td><td class = "space2">'+currentclose+'</td></tr>';      
      // html+= '<tr><td class = "space1">Change Percent</td><td class = "space2">'+percent+'%';
      if (percent < 0) {
          html+= '<tr><td class = "space1">Change (Change Percent)</td><td class = "space2"><font color="#FF0000">'+change+' ('+percent+'%)&nbsp;</font>';
          html+= '<img class="arrows" src = "http://cs-server.usc.edu:45678/hw/hw6/images/Red_Arrow_Down.png" class = "image"></td></tr>';
      } else {
          html+= '<tr><td class = "space1">Change (Change Percent)</td><td class = "space2"><font color="#00FF00">+'+change+' (+'+percent+'%)&nbsp;</font>';
          html+= '<img class="arrows" src = "http://cs-server.usc.edu:45678/hw/hw6/images/Green_Arrow_Up.png" class = "image"></td></tr>';
      }
      html+= '<tr><td class = "space1">Timestamp</td><td class = "space2">'+date+' EDT</td></tr>';                
      html+='<tr><td class = "space1">Open</td><td class = "space2">'+parseFloat(current['1. open']).toFixed(2)+'</td></tr>';
      html+= '<tr><td class = "space1">Close</td><td class = "space2">'+parseFloat(past['4. close']).toFixed(2)+'</td></tr>';
      html+='<tr><td class = "space1">Day\'s Range</td><td class = "space2">'+parseFloat(current['3. low']).toFixed(2)+' - '+parseFloat(current['2. high']).toFixed(2)+'</td></tr>';
      html+= '<tr><td class = "space1">Volume</td><td class = "space2">'+volume+'</td></tr>';
      html+= '</table>';             
      //.date('Y-m-d', strtotime($data->{'Meta Data'}->{'3. Last Refreshed'})).
      //date_default_timezone_set($data->{'Meta Data'}->{'5. Time Zone'});
      $("#tabledata").html( html);

          $('#strbtn').click(function(event) {
            console.log("Clickd Favorite");
            if($('#star').hasClass("yellowstar")) {
                $('#star').removeClass("yellowstar");
                $('#star').addClass("whitestar");
                ls.remove(document.getElementById("stock_text").value.trim()); 
                event.stopPropagation();
            } else {
                $('#star').addClass("yellowstar");
                appendToFavorite(document.getElementById("stock_text").value.trim());
                ls.set(document.getElementById("stock_text").value.trim(), data);
                updateFavorite(document.getElementById("stock_text").value.trim(), data);
                event.stopPropagation();
              }
          });
           $("#fbbtn").click(function() { 
                var obj = {}, chart;
                chart = $("#"+$("ul#chartsTab li.active")[0].innerText).highcharts();
                obj.svg = chart.getSVG();
                obj.type = 'image/png';
                obj.async = true;
                $.ajax({
                    type: 'post',
                    url: chart.options.exporting.url,
                    data: obj,
                    success: function (data) {
                        var exportUrl = this.url + data;
                        var input = 'https://www.facebook.com/sharer/sharer.php?u=';
                        input += exportUrl;
                        window.open(input, 'fbshare', 'width=640,height=320');
            }
        });    
      });
      }
    }

    function displayPriceChart(type,data){
    if(!data.hasOwnProperty('Meta Data') || data.toString().indexOf("Error") >-1) {
        $("#"+type).addClass('error');
        $("#"+type).html( "Error! Failed to get "+type+" data.");
      } else {
        $("#"+type).removeClass('error');

      var date = [];
      var volume = [];
      var closeValue = [];
      var i = 0;
            
      for(var key in data["Time Series (Daily)"]){
            var numOfDate = key.split(" ");
                numOfDate = numOfDate[0].split("-");
                date[i] = numOfDate[1] + "/" + numOfDate[2];
                var value = parseFloat(data["Time Series (Daily)"][key]["4. close"]);
                closeValue[i] = value;
                volume[i] = parseInt(data["Time Series (Daily)"][key]["5. volume"]);
                i++;
      }
      date = date.slice(0, 121);
      closeValue = closeValue.slice(0, 121);
      volume = volume.slice(0, 121);

      var maxVolume = (Math.max.apply(null, volume));

      Highcharts.chart(type, {
          chart: {
              zoomType: 'x',
              height: 400,                                        
              borderColor: '#D1D0CE',
              borderWidth: 1
          },
          plotOptions: {
            area: {
                
                fillOpacity: 0.1
            }
        },
          title: {
              text: document.getElementById("stock_text").value+" Stock Price and Volume"
          },
          subtitle: {
              useHTML: true,
              text: "<a href ='https://www.alphavantage.co' target='_blank'>Source: Alpha Vantage</a>"
          },
          xAxis: [{
              reversed: true,
              tickInterval: 5,
              categories: date
          }],
          yAxis: [{ 

                  title: {
                      text: 'Stock Price'
                  },
                  min: 0
              }, {
                  title: {
                      text: 'Volume',
                  },
                  max: maxVolume,
                  opposite: true
          }],

          series: [{
              name: "Price",
              type: 'area',
              data: closeValue,
              tooltip: {
                  valueDecimals:2
              },
              color: '#0101FF'
          }, {  
              name: "Volume",
              type: 'column',
              data: volume,
              yAxis: 1,
              color: '#FF0000'
          }]
        });
     }
    }

    function displayBBANDSChart(type, data) {
      if(!data.hasOwnProperty('Meta Data') || data.toString().indexOf("Error") >-1) {
        $("#"+type).addClass('error');
        $("#"+type).html( "Error! Failed to get "+type+" data.");
      } else {
        $("#"+type).removeClass('error');
        var middle = [];
        var lower = [];
        var date = [];
        var i = 0;
        var upper = [];
        for(var key in data["Technical Analysis: " + type]){
                var numOfDate = key.split(" ");
                numOfDate = numOfDate[0].split("-");
                date[i] = numOfDate[1] + "/" + numOfDate[2];
                var value = parseFloat(data["Technical Analysis: " + type][key]["Real Middle Band"]);
                middle[i] = value;
                var value = parseFloat(data["Technical Analysis: " + type][key]["Real Lower Band"]);
                lower[i] = value;
                var value = parseFloat(data["Technical Analysis: " + type][key]["Real Upper Band"]);
                upper[i] = value;
                i++;
            }
            date = date.slice(0, 121);
            middle = middle.slice(0, 121);
            lower = lower.slice(0, 121);
            upper = upper.slice(0, 121);
            Highcharts.chart(type, {
                chart: {    
                    zoomType: 'x',                                   
                    borderColor: '#D1D0CE',
                    borderWidth: 1,
                    height:400
                },
                title: {
                    text: data["Meta Data"]["2: Indicator"]
                },
                subtitle: {
                    useHTML: true,
                    text: "<a href = 'https://www.alphavantage.co' target='_blank'>Source: Alpha Vantage</a>"
                },
                xAxis: [{
                    reversed: true,
                    tickInterval: 5,
                    categories:  date
                }],
                yAxis: [{ 
                    title: {
                        text: type
                    }
                }],
                
                series: [{
                    name: data["Meta Data"]["1: Symbol"] + " Real Middle Band",
                    data:  middle,
                    color: '#3BBAFF'
                }, {
                    name: data["Meta Data"]["1: Symbol"] + " Real Upper Band",
                    data:  upper,
                    color:'#000001',
                }, {
                    name: data["Meta Data"]["1: Symbol"] + " Real Lower Band",
                    data:  lower,
                    color:'#FF0001'
                }]
            })                 
        }                 
    }

    function displaySTOCHChart(type, data){
      if(!data.hasOwnProperty('Meta Data') || data.toString().indexOf("Error") >-1) {
        $("#"+type).addClass('error');
        $("#"+type).html( "Error! Failed to get "+type+" data.");
      } else {
        $("#"+type).removeClass('error');
          var slowK = [];
          var slowD = [];
          var date = [];
          var i = 0;
          for(var key in data["Technical Analysis: " + type]){
                  var numOfDate = key.split(" ");
                  numOfDate = numOfDate[0].split("-");
                  date[i] = numOfDate[1] + "/" + numOfDate[2];
                  var value = parseFloat(data["Technical Analysis: " + type][key]["SlowK"]);
                  slowK[i] = value;
                  value = parseFloat(data["Technical Analysis: " + type][key]["SlowD"]);
                  slowD[i] = value;
                  i++;
              }
              date = date.slice(0, 121);
              slowK = slowK.slice(0, 121);
              slowD = slowD.slice(0, 121);
              Highcharts.chart(type, {
                  chart: {   
                      zoomType: 'x',                                     
                      borderColor: '#D1D1CE',
                      borderWidth: 1,
                      height:400
                  },
                  title: {
                      text: data["Meta Data"]["2: Indicator"]
                  },
                  subtitle: {
                      useHTML: true,
                      text: "<a href = 'https://www.alphavantage.co' target='_blank'>Source: Alpha Vantage</a>"
                  },
                  xAxis: [{
                      reversed: true,
                      tickInterval: 5,
                      categories:  date
                  }],
                  yAxis: [{ 
                      title: {
                          text: type
                      },
                      tickInterval:10
                  }],
                  
                  
                  series: [{
                      name: data["Meta Data"]["1: Symbol"] + " SlowK",
                      data:  slowK,
                      color: '#3BBAFF',
                      marker: {
                          symbol: "square"
                      }
                  }, {
                      name: data["Meta Data"]["1: Symbol"] + " SlowD",
                      data:  slowD,
                      color: '#FF0001',
                      marker: {
                          symbol: "circle"
                      }
                  }]
              });
          }
    }

    function displayMACDChart(type,data){
      if(!data.hasOwnProperty('Meta Data') || data.toString().indexOf("Error") >-1) {
        $("#"+type).addClass('error');
        $("#"+type).html( "Error! Failed to get "+type+" data.");
      } else {
        $("#"+type).removeClass('error');
          var hist = [];
          var signal = [];
          var macd = [];
          var date = [];
          var i = 0;
          for(var key in data["Technical Analysis: " + type]){
                  var numOfDate = key.split(" ");
                  numOfDate = numOfDate[0].split("-");
                  date[i] = numOfDate[1] + "/" + numOfDate[2];
                  var value = parseFloat(data["Technical Analysis: " + type][key]["MACD_Hist"]);
                  hist[i] = value;
                  value = parseFloat(data["Technical Analysis: " + type][key]["MACD_Signal"]);
                  signal[i] = value;
                  value = parseFloat(data["Technical Analysis: " + type][key]["MACD"]);
                  macd[i] = value;
                  i++;
              }
              date = date.slice(0, 121);
              hist = hist.slice(0, 121);
              signal = signal.slice(0, 121);
              macd = macd.slice(0, 121);
              Highcharts.chart(type, {
                  chart: {   
                      zoomType: 'x',                                    
                      borderColor: '#D1D0CE',
                      borderWidth: 1,
                      height:400
                  },
                  title: {
                      text: data["Meta Data"]["2: Indicator"]
                  },
                  subtitle: {
                      useHTML: true,
                      text: "<a href = 'https://www.alphavantage.co' target='_blank'>Source: Alpha Vantage</a>"
                  },
                  xAxis: [{
                      reversed: true,
                      tickInterval: 5,
                      categories:  date
                  }],
                  yAxis: [{ 
                      title: {
                          text: type
                      }
                  }],
                  
                  
                  series: [{
                      name: data["Meta Data"]["1: Symbol"] + " MACD",
                      data:  macd,
                      color: '#E8A327'
                  }, {
                      name: data["Meta Data"]["1: Symbol"] + " MACD_Hist",
                      data:  hist,
                      color: '#3BBAFF'
                  }, {
                      name: data["Meta Data"]["1: Symbol"] + " MACD_Signal",
                      data:  signal,
                      color: '#FF0001'
                  }]
              })
    }
    }

    function displayOtherChart(type,data) {
        if(!data.hasOwnProperty('Meta Data') || data.toString().indexOf("Error") >-1) {
        $("#"+type).addClass('error');
        $("#"+type).html( "Error! Failed to get "+type+" data.");
      } else {
        $("#"+type).removeClass('error');
            var results = [];
            var date = [];
            var i = 0;
            for(var key in data["Technical Analysis: " + type]){
                var numOfDate = key.split(" ");
                numOfDate = numOfDate[0].split("-");
                date[i] = numOfDate[1] + "/" + numOfDate[2];
                var value = parseFloat(data["Technical Analysis: " + type][key][type]);
                results[i] = value;
                i++;
            }
            date = date.slice(0, 121);
            results = results.slice(0, 121);
            Highcharts.chart(type, {
                    chart: {     
                        zoomType: 'x',                                       
                        borderColor: '#D1D0CE',
                        borderWidth: 1,
                        height:400
                    },
                    title: {
                        text: data["Meta Data"]["2: Indicator"]
                    },
                    subtitle: {
                        useHTML: true,
                        text: "<a href = 'https://www.alphavantage.co' target='_blank'>Source: Alpha Vantage</a>"
                    },
                    xAxis: [{
                        reversed: true,
                        tickInterval: 5,
                        categories:  date
                    }],
                    yAxis: [{ 
                        title: {
                            text: type
                        }
                    }],
                    
                    
                    series: [{
                        name: data["Meta Data"]["1: Symbol"],
                        data:  results
                    }]
                });
          }
    }

    function getquotedata(symboldata, type) {
              var URL = "http://pchw8-env.us-west-1.elasticbeanstalk.com/?symbol="+symboldata+"&type="+type;
              var responsedata='';
              $.ajax(
              {

                type : 'GET',
                url : URL,
                dataType : "json",
                success : function(data)
                {
                  if(true)//data['Status']=="SUCCESS"
                  {

                    tempdata=data;
                    $('#next').removeClass("disabled");
                    $('#next').prop("disabled", false);
                    console.log(data);
                    if(type=="Price"){
                      displayPriceChart(type,data);
                      displayStockData(type,data);
                      getnewsData();
                      getHistoricalData();
                    } else if(type=="STOCH"){
                      displaySTOCHChart(type,data);
                    } else if(type=="BBANDS"){
                      displayBBANDSChart(type,data);
                    } else if(type=="MACD"){
                       displayMACDChart(type,data);
                    } else {
                      displayOtherChart(type,data);
                    }                  

                    if(ls.store.indexOf(symboldata) != -1) {
                              $('#star').removeClass("whitestar")
                              $('#star').addClass("yellowstar");
                          }
                          
                   
                     
                  }  
                  else {
                    document.getElementById('error').innerHTML="Select Valid Entry";
                  }

              }
           });                                                                              
    }

    function getnewsData(){
       $.ajax(
            {
              type : 'GET',
              url : "http://pchw8-env.us-west-1.elasticbeanstalk.com/news/"+document.getElementById("stock_text").value+"?symbol="+document.getElementById("stock_text").value,       
              dataType : "json",          
              success : function(data)
              {
                if(!data.hasOwnProperty('rss') || data.toString().indexOf("Error") >-1) {
                  $("#news_feeds").addClass('error');
                  $("#news_feeds").html( "Error! Failed to get news feed data.");
                }else{
                $("#news_feeds").removeClass('error');
                var arr = data["rss"]["channel"][0]["item"];
                var news="";
                var count = 0;
                for(var i=0; i<arr.length&&count<5; i++) {                  
                  if(arr[i]["link"][0].indexOf('article')>-1){
                      news += "<div class='jumbotron' style='padding: 10px; margin-bottom:5px;'>";
                      news += "<a href='" + arr[i].link[0] + "' target='_blank'>" + arr[i].title[0] + "</a><br>";                      
                      news += "<p style='margin: 20px auto 15px auto; font-weight: bold; font-size:14px'> Author: " + arr[i]["sa:author_name"][0] + "</p>";
                      news += "<p  style='font-weight: bold; font-size:14px'> Date: " + arr[i].pubDate[0].replace("-0500", "EDT") + "</p>";
                      news += "</div><br>";
                      count++;
                    }
                  }
                          document.getElementById("news_feeds").innerHTML = news;
              }
              }

            });
    }

    function getHistoricalData(){
          $.ajax({
            url : "http://pchw8-env.us-west-1.elasticbeanstalk.com/highstockip/"+document.getElementById("stock_text").value+"?symbol="+document.getElementById("stock_text").value,
            dataType : "json",
            success : function(data)
            {
              window.hidata = data;
              window.ipdata = document.getElementById("stock_text").value;
              drawHistoricalChart(hidata,document.getElementById("stock_text").value);
            }

          });//histock ajax fn ends               

    } 
  
    $("button#clrbtn").click(function()
    {
      $("#stock_text").val("");
      $('#next').removeClass("disabled");
      $('#next').prop("disabled", true);
      $('#previous')[0].click();

    });
  
    function drawHistoricalChart (data, symbol) {
      if(!data.hasOwnProperty('Meta Data') || data.toString().indexOf("Error") >-1) {
        $("#historical_charts").addClass('error');
        $("#historical_charts").html( "Error! Failed to get historical charts data.");
      } else {
        $("#historical_charts").removeClass('error');
      
        var fixDate = function(dateIn) {
          var dat = new Date(dateIn);
          return Date.UTC(dat.getFullYear(), dat.getMonth(), dat.getDate());
        };

        var getOHLC = function(historical) {
          var dates = historical.Dates || [];
              var elements = historical.Elements || [];
              var chartSeries = [];

              if (elements[0]) {

                  for (var i = 0, datLen = dates.length; i < datLen; i++) {

                      var dat = fixDate(dates[i]);
                      var pointData = [
                          dat,
                          elements[0].DataSeries['open'].values[i],
                          elements[0].DataSeries['high'].values[i],
                          elements[0].DataSeries['low'].values[i],
                          elements[0].DataSeries['close'].values[i]
                      ];
                      chartSeries.push(pointData);
                  };
              }

              return chartSeries;
        };

        var series = getOHLC(data);
        //display series
        $('#historical_charts').highcharts('StockChart', {

          title: {
            text: symbol + ' ' + 'Stock Value'
          },
          rangeSelector: {
            selected: 1
        },

          subtitle: {
            useHTML: true,
            text: "<a href = 'https://www.alphavantage.co' target='_blank'>Source: Alpha Vantage</a>"
          },
          xAxis: {
            type: 'datetime'
          },
          yAxis: [{
            min: 0,
            title: {
              text: 'Stock Value'
            }
          }],
          tooltip: {
                    crosshairs: [false,false],
                    split: false
                },
          series: [{
            name: symbol,
            data: series,
            type: 'area',
            threshold: null,
            tooltip: {
              valueDecimals: 2,
              valuePrefix: '$',
            }
          }],
        
          rangeSelector: {
            buttons: [{
              type: 'week',
              count: 1,
              text: '1w'
            }, {
              type: 'month',
              count: 1,
              text: '1m'
            }, {
              type: 'month',
              count: 3,
              text: '3m'
            }, {
              type: 'month',
              count: 6,
              text: '6m'
            }, {
              type: 'ytd',
              text: 'YTD'
            }, {
              type: 'year',
              count: 1,
              text: '1y'
            }, {
              type: 'all',
              text: 'All'
            }],
            selected: 0,
            
          }

        });  
    }

    });
