
var players = [];
var labels = [];
var weapons = [];
var socket = io.connect('http://localhost:80');
var UiPlayers = document.getElementById("players");

var Q = Quintus({audioSupported: [ 'wav','mp3' ]})
      .include('Sprites, Scenes, Input, 2D, Anim, Touch, UI, Audio')
      .setup({ maximize: true })
      .enableSound()
      .controls().touch();

Q.gravityY = 500;

var objectFiles = [
  './src/player'
];

require(objectFiles, function () {
  function setUp (stage) {
    socket.on('count', function (data) {
      UiPlayers.innerHTML = data['playerCount'];
    });

    socket.on('connected', function (data) {
      selfId = data['playerId'];
      var playerName = window.prompt("Name?");
      player = new Q.Player({playerId: selfId, x: 100, y: 100, socket: socket, p_name: playerName});
      weapon = new Q.Weapon({playerId: selfId, x: 100, y: 100});
      stage.insert(player);
      stage.insert(weapon);
      stage.add('viewport').follow(player);
      stage.viewport.scale = 1.5;
      stage.viewport.offsetY = 30;
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
       stage.insert(temp_label);
       stage.insert(temp_weapon);
     }

    });

    socket.on("killed",function(data) {
      var actor = players.filter(function (obj) {
        return obj.playerId == data.playerId;
      })[0];
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
});
