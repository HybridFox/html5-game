require([], function () {

  var global_deg = 0;

  Q.NONE = 1;
  Q.BULLET = 15;
  Q.PLAYER = 16;
  Q.ACTOR = 17;
  Q.PARTICLE = 18;
  Q.NOTHING = 999;

  // -------------------------------------------
  //  Type: Sprite
  //  Name: Player
  //  Description: Own character
  //
  //
  // -----

  Q.Sprite.extend('Player', {
    init: function (p) {
      this._super(p, {
        lives: 10,
        sheet: 'player',
        w: 24,
        h: 60,
        type: Q.PLAYER,
        kills: 0,
        deaths: 0
      });
      this.add('2d, platformerControls, animation');
    },
    step: function (dt) {
      if (global_deg < -90 || global_deg > 90) {
        this.p.flip = "x";
      } else {
        this.p.flip = "";
      }
      socket.emit('update', { playerId: this.p.playerId, x: this.p.x, y: this.p.y, sheet: this.p.sheet, name: this.p.p_name, deg: global_deg, opacity: this.p.opacity, kills: this.p.kills, deaths: this.p.deaths});
    }
  });

  // -------------------------------------------
  //  Type: Sprite
  //  Name: Actor
  //  Description: Other players
  //
  //
  // -----

  Q.Sprite.extend('Actor', {
    init: function (p) {
      this._super(p, {
        update: true,
        type: Q.ACTOR,
        w: 24,
        h: 60,
        p_name: "Joining..."
      });

      var temp = this;
      setInterval(function () {
        if (!temp.p.update) {
          temp.destroy();
        }
        temp.p.update = false;
      }, 3000);
    }
  });

  // -------------------------------------------
  //  Type: Sprite
  //  Name: Weapon
  //  Description: Own Weapon
  //
  //
  // -----

  Q.Sprite.extend('Weapon', {
    init: function (p) {
      this._super(p, {
        shootTimeout: 200,
        sheet: 'weapon',
        w: 10,
        h: 5,
        x: player.p.x,
        y: player.p.y,
        cx: -10,
        points: [[0, 0], [0, 0], [0, 0], [0, 0]],
        collisionMask: Q.PLAYER
      });
    },
    step: function(dt) {
      this.p.x = player.p.x,
      this.p.y = player.p.y,
      this.p.angle = global_deg
      if (global_deg < -90 || global_deg > 90) {
        this.p.flip = "y";
      } else {
        this.p.flip = "";
      }
    }
  });

  // -------------------------------------------
  //  Type: Sprite
  //  Name: ActorWeapon
  //  Description: Other people's Weapon
  //
  //
  // -----

  Q.Sprite.extend('ActorWeapon', {
    init: function (p) {
      this._super(p, {
        update: true,
        sheet: 'weapon',
        w: 10,
        h: 5,
        cx: -10,
        points: [[0, 0], [0, 0], [0, 0], [0, 0]],
        collisionMask: Q.ACTOR
      });

      var temp = this;
      setInterval(function () {
        if (!temp.p.update) {
          temp.destroy();
        }
        temp.p.update = false;
      }, 3000);
    }
  });

  // -------------------------------------------
  //  Type: Sprite
  //  Name: Particle
  //  Description: Provides names on top of players
  //
  //
  // -----

  Q.Sprite.extend("Particle",{
    init: function(p) {
      this._super(p,{
        w: 2,
        h: 2,
        type: Q.PARTICLE,
        color: "#000"
      });
      this.add("2d");
      this.on("hit",this,"collision");
    },

    collision: function(col) {
      if (col.obj.p.type == Q.PLAYER) {
        this.destroy();
      } else if (col.obj.p.type == Q.BULLET) {
        this.destroy();
      } else if (col.obj.p.type == Q.ACTOR) {
        this.destroy();
      } else {
        this.destroy();
      }
    },

    draw: function(ctx) {
      ctx.fillStyle = this.p.color;
      ctx.fillRect(-this.p.cx,-this.p.cy,this.p.w,this.p.h);
    },
  });

  // -------------------------------------------
  //  Type: Sprite
  //  Name: Bullet
  //  Description: Own bullet
  //
  //
  // -----

  Q.Sprite.extend("Bullet",{
    init: function(p) {
      this._super(p,{
        w:10,
        h:4,
        type: Q.PLAYER,
        collisionMask: Q.ACTOR
      });
      this.p.xy = this.p.vy;
      this.p.xx = this.p.vx;
      this.add("2d");
      this.on("hit",this,"collision");
    },

    step: function(dt) {
      this.p.vy = this.p.xy;
      this.p.vx = this.p.xx;
    },

    collision: function(col) {
      if (col.obj.p.type == Q.PLAYER) {

      } else if (col.obj.p.type == Q.BULLET) {

      } else if (col.obj.p.type == Q.ACTOR) {
        this.destroy();
        if (col.obj.p.opacity == 1) {
          createParticles(this.p.x, this.p.y, 3, "#F00");
          var self_player = Q("Player").first();
          socket.emit('kill', {playerId: col.obj.p.playerId, hitByName: self_player.p.p_name});
        }
      } else {
        createParticles(this.p.x, this.p.y, 3, "#000");
        this.destroy();
      }
    },

    draw: function(ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(-this.p.cx,-this.p.cy,this.p.w,this.p.h);
    },
  });

  // -------------------------------------------
  //  Type: Sprite
  //  Name: ActorBullet
  //  Description: Other bullets
  //
  //
  // -----

  Q.Sprite.extend("ActorBullet",{
    init: function(p) {
      this._super(p,{
        w:10,
        h:4,
        type: Q.ACTOR,
        collisionMask: Q.ACTOR,
      });
      this.p.xy = this.p.vy;
      this.p.xx = this.p.vx;
      this.add("2d");
      this.on("hit",this,"collision");
    },

    step: function(dt) {
      this.p.vy = this.p.xy;
      this.p.vx = this.p.xx;
    },

    collision: function(col) {
      if (col.obj.p.type == Q.PLAYER) {
        if (col.obj.p.opacity == 1) {
          this.destroy();
          createParticles(this.p.x, this.p.y, 3, "#F00");
        }
      } else if (col.obj.p.type == Q.BULLET) {

      } else if (col.obj.p.type == Q.ACTOR) {
        this.destroy();
      } else {
        createParticles(this.p.x, this.p.y, 3, "#000");
        this.destroy();
      }
    },

    draw: function(ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(-this.p.cx,-this.p.cy,this.p.w,this.p.h);
    },
  });

  // -------------------------------------------
  //  Type: UI - Text
  //  Name: labelText
  //  Description: Provides names on top of players
  //
  //
  // -----

  Q.UI.Text.extend("labelText", {
    init: function(p) {
      this._super(p,{
        update: true,
        scale: 0.4
      });

      var temp = this;
      setInterval(function () {
        if (!temp.p.update) {
          temp.destroy();
        }
        temp.p.update = false;
      }, 3000);
    },
  });

  // -------------------------------------------
  //  Type: Event Listener
  //  Name: keydown
  //  Description: Handles keydown presses
  // -----

  Q.el.addEventListener('keydown', function(e) {
    if (keysdown[e.keyCode]) {
      return;
    }

    keysdown[e.keyCode] = true;

    switch(e.keyCode){
      case 9:
        var actors = Q("Actor");
        var self = Q("Player").first();
        var html = "";
        html += "<tr><td>" + self.p.p_name + "</td><td>" + self.p.kills + "</td><td>" + self.p.deaths + "</td></tr>";
        for (var key in actors.items) {
          var deaths = actors.items[key].p.deaths;
          var kills = actors.items[key].p.kills;
          console.log(actors.items[key].p);
          html += "<tr><td>" + actors.items[key].p.p_name + "</td><td>" + actors.items[key].p.kills + "</td><td>" + actors.items[key].p.deaths + "</td></tr>";
        }
        $(".player-board").html(html);
        $(".scoreboard").fadeIn(100);
        break;
    }
  });

  // -------------------------------------------
  //  Type: Event Listener
  //  Name: keyup
  //  Description: Handles keyup presses
  // -----

  Q.el.addEventListener('keyup', function(e) {
    delete keysdown[e.keyCode];
    switch(e.keyCode){
      case 9:
      $(".scoreboard").fadeOut(100);
        break;
    }
  });

  Q.el.addEventListener('click', function(e) {
    var player = Q("Player").first();
    var weapon = Q("Weapon").first();
    var x = e.offsetX || e.layerX,
      y = e.offsetY || e.layerY,
      stage = Q.stage();

    var stageX = Q.canvasToStageX(x, stage),
        stageY = Q.canvasToStageY(y, stage);

    var deg = Math.atan2(stageY - player.p.y, stageX - player.p.x) * 180 / Math.PI;

    var dy = Math.sin(deg * Math.PI / 180),
        dx = Math.cos(deg * Math.PI / 180);

    if (!clicked) {
      if (player.p.opacity == 1) {
        socket.emit('shoot', { playerId: player.p.playerId, x: player.p.x, y: player.p.y, dx: dx, dy: dy, deg: deg});

        stage.insert(
          new Q.Bullet({x: player.p.x + dx * 20,
                        y: player.p.y + dy * 20,
                        vx: dx * 1000,
                        vy: dy * 1000,
                        angle: global_deg
          })
        );
        clicked = true;
        setTimeout(function(){ clicked = false; }, weapon.p.shootTimeout);
      }
    }
  });

  // -------------------------------------------
  //  Type: Event Listener
  //  Name: mousemove
  //  Description: Dedects mouse angle and sends it to the server
  // -----

  Q.el.addEventListener('mousemove', function(e) {
    var player = Q("Player").first();

    var x = e.offsetX || e.layerX,
        y = e.offsetY || e.layerY,
        stage = Q.stage();

    var stageX = Q.canvasToStageX(x, stage),
        stageY = Q.canvasToStageY(y, stage);

    global_deg = Math.atan2(stageY - player.p.y, stageX - player.p.x) * 180 / Math.PI;
  });

  // -------------------------------------------
  //  Type: Function
  //  Name: createParticles
  //  Description: Creates particles, duh
  // -----

  function createParticles(x, y, amount, color) {
    for (var i = 0; i < amount; i++) {
      var stage = Q.stage();

      var deg = Math.floor(Math.random() * 180) + 1;

      var dy = Math.sin(deg * Math.PI / 180) * Math.floor(Math.random() * 400) + 100,
          dx = Math.cos(deg * Math.PI / 180) * Math.floor(Math.random() * 400) + 100;

      stage.insert(new Q.Particle({x: x, y: y, vy: dy, vx: dx, color: color}));
    }
  }

});
