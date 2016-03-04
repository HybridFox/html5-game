
var players = [];
var labels = [];
var weapons = [];
var socket = io.connect('http://10.68.246.11:80');
var UiPlayers = document.getElementById("players");
var UiLives = document.getElementById("lives");
var UiKillfeed = document.getElementById("killfeed");
var playerName = "Joining...";
var clicked = false;

var Q = Quintus({audioSupported: [ 'wav','mp3' ]})
      .include('Sprites, Scenes, Input, 2D, Anim, Touch, UI, Audio')
      .setup({ maximize: true })
      .enableSound()
      .controls().touch();



var objectFiles = [
  './src/player'
];

require(objectFiles, function () {
  function setUp (stage) {
    console.log("Setting up stage");
    socket.on('count', function (data) {
      UiPlayers.innerHTML = data['playerCount'];
    });

    socket.on('connected', function (data) {
      selfId = data['playerId'];
      /* while(!proceed) {
          var playerName = window.prompt("Name?");
          if (typeof(playerName) == "string") {
              playerName = playerName.trim();
              if (playerName == "") {
                  proceed = false;
              } else {
                proceed = true;
              }
          }
          if (playerName === null) {
              proceed = false;
          }
      } */
      player = new Q.Player({playerId: selfId, x: 100, y: 100, socket: socket, p_name: playerName});
      weapon = new Q.Weapon({playerId: selfId, x: 100, y: 100});
      stage.insert(player);
      stage.insert(weapon);
      stage.add('viewport').follow(player);
      stage.viewport.scale = 1;
      stage.viewport.offsetY = 30;
      var lives = "";
      for (var i = 0; i < player.p.lives; i++) {
        lives += "<i class='fa fa-heart'></i>";
      }
      UiLives.innerHTML = lives;
    });

    socket.on('updated', function (data) {
     var actor = players.filter(function (obj) {
       return obj.playerId == data['playerId'];
     })[0];
     var label = labels.filter(function (obj) {
       return obj.playerId == data['playerId'];
     })[0];
     var weapon = weapons.filter(function (obj) {
       return obj.playerId == data['playerId'];
     })[0];
     if (label) {
       label.label.p.x = data['x'];
       label.label.p.y = data['y'] - 40;
       label.label.p.update = true;
       label.label.p.label = data["name"];
     }
     if (weapon) {
       weapon.weapon.p.x = data['x'];
       weapon.weapon.p.y = data['y'];
       weapon.weapon.p.angle = data['deg']
       weapon.weapon.p.update = true;
       if (data['deg'] < -90 || data['deg'] > 90) {
         weapon.weapon.p.flip = "y";
       } else {
         weapon.weapon.p.flip = "";
       }
     }
     if (actor) {
       actor.player.p.x = data['x'];
       actor.player.p.y = data['y'];
       actor.player.p.sheet = data['sheet'];
       actor.player.p.opacity = data['opacity'];
       actor.player.p.update = true;
       if (data['deg'] < -90 || data['deg'] > 90) {
         actor.player.p.flip = "x";
       } else {
         actor.player.p.flip = "";
       }
     } else {
       var temp = new Q.Actor({playerId: data['playerId'], x: data['x'], y: data['y'], sheet: data['sheet'] });
       var temp_label = new Q.labelText({label: data["name"], color: "black", align: 'center', x: data['x'], y: data['y']});
       var temp_weapon = new Q.ActorWeapon({playerId: data['playerId'], x: data['x'], y: data['y']});
       players.push({player: temp, playerId: data['playerId']});
       labels.push({label: temp_label, playerId: data['playerId']});
       console.log("Adding Weapon");
       weapons.push({weapon: temp_weapon, playerId: data['playerId']});
       stage.insert(temp);
       console.log(temp_label)
       stage.insert(temp_label);
       stage.insert(temp_weapon);
     }

    });

    socket.on("killed", function(data) {
      var self_player = Q("Player").first();
      var lives = "";
      for (var i = 0; i < self_player.p.lives; i++) {
        lives += "<i class='fa fa-heart'></i>";
      }
      UiLives.innerHTML = lives;
      if (self_player.p.playerId == data["playerId"]) {
        self_player.p.lives--;
        if (self_player.p.lives == 0) {
          $("<div class='killfeed-log'>" + data["hitByName"] + " <span>Killed</span> " + self_player.p.p_name + "</div>").prependTo(UiKillfeed).delay(5000).fadeOut();
          socket.emit("addtokillfeed", {killed: self_player.p.p_name, killedBy: data["hitByName"]});
          self_player.p.x = 100;
          self_player.p.y = 100;
          self_player.p.lives = 10;
          self_player.p.opacity = 0.5;
          setTimeout(function() {
            self_player.p.opacity = 1;
          }, 5000)
          console.log("RIP");
        }
      }
    });

    socket.on("appendkillfeed", function(data) {
      $("<div class='killfeed-log'>" + data["killedBy"] + " <span>Killed</span> " + data["killed"] + "</div>").prependTo(UiKillfeed).delay(5000).fadeOut();
    });

    socket.on("shooted", function(data) {
      stage.insert(
        new Q.ActorBullet({x: data['x'] + data['dx'] * 20,
                          y: data['y'] + data['dy'] * 20,
                          vx: data['dx'] * 1000,
                          vy: data['dy'] * 1000,
                          angle: data['deg']
        })
      );
    })
  }



  $(".play-btn").on("click", function() {
    if ($("#azerty").checked) {
      var keyboardLayout = "azerty";
    } else if ($("#qwerty").checked) {
      var keyboardLayout = "qwerty";
    } else {

    }
    if ($("#username").val() != "") {
      console.log("Setting username: " + $("#username").val());
      var player = Q("Player").first();
      player.p.p_name = $("#username").val();
      $(".menu").fadeOut();
    }
    console.log("Starting stage setup");
  });

  Q.scene('arena', function (stage) {
    stage.collisionLayer(new Q.TileLayer({ dataAsset: '/maps/arena.json', sheet: 'tiles' }));
    setUp(stage);
  });

  var files = [
    '/images/tiles.png',
    '/maps/arena.json',
    '/images/sprites.png',
    '/images/sprites.json'
  ];

  Q.load(files.join(','), function () {
    Q.sheet('tiles', '/images/tiles.png', { tilew: 32, tileh: 32 });
    Q.compileSheets('/images/sprites.png', '/images/sprites.json');
    Q.stageScene('arena', 0);
  });

  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  }

  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
  }
});
