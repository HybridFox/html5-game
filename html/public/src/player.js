require([], function () {

  var global_deg = 0;

  Q.BULLET = 15;
  Q.PLAYER = 16;
  Q.ACTOR = 17;
  Q.NOTHING = 999;

  Q.Sprite.extend('Player', {
    init: function (p) {
      this._super(p, {
        sheet: 'player',
        w: 24,
        h: 60,
        type: Q.PLAYER,
      });
      this.add('2d, platformerControls, animation');
    },
    step: function (dt) {
      if (global_deg < -90 || global_deg > 90) {
        this.p.flip = "x";
      } else {
        this.p.flip = "";
      }
      socket.emit('update', { playerId: this.p.playerId, x: this.p.x, y: this.p.y, sheet: this.p.sheet, name: this.p.p_name, deg: global_deg});
    }
  });

  Q.Sprite.extend('Weapon', {
    init: function (p) {
      this._super(p, {
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

  Q.el.addEventListener('click', function(e) {
    var player = Q("Player").first();
    var x = e.offsetX || e.layerX,
      y = e.offsetY || e.layerY,
      stage = Q.stage();

    var stageX = Q.canvasToStageX(x, stage),
        stageY = Q.canvasToStageY(y, stage);

    var deg = Math.atan2(stageY - player.p.y, stageX - player.p.x) * 180 / Math.PI;

    var dy = Math.sin(deg * Math.PI / 180),
        dx = Math.cos(deg * Math.PI / 180);

    socket.emit('shoot', { playerId: player.p.playerId, x: player.p.x, y: player.p.y, dx: dx, dy: dy, deg: deg});

    stage.insert(
      new Q.Bullet({x: player.p.x + dx * 20,
                    y: player.p.y + dy * 20,
                    vx: dx * 1000,
                    vy: dy * 1000,
                    angle: global_deg
      })
    );
  });

  Q.el.addEventListener('mousemove', function(e) {
    var player = Q("Player").first();

    var x = e.offsetX || e.layerX,
        y = e.offsetY || e.layerY,
        stage = Q.stage();

    var stageX = Q.canvasToStageX(x, stage),
        stageY = Q.canvasToStageY(y, stage);

    global_deg = Math.atan2(stageY - player.p.y, stageX - player.p.x) * 180 / Math.PI;
  });

  Q.Sprite.extend('Actor', {
    init: function (p) {
      this._super(p, {
        update: true,
        type: Q.ACTOR,
        w: 24,
        h: 60
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



  Q.Sprite.extend("Bullet",{
    init: function(p) {
      this._super(p,{
        w:10,
        h:4,
        type: Q.PLAYER,
        collisionMask: Q.ACTOR
      });
      this.add("2d");
      this.on("hit",this,"collision");
    },

    collision: function(col) {
      if (col.obj.p.type == Q.PLAYER) {

      } else if (col.obj.p.type == Q.BULLET) {

      } else if (col.obj.p.type == Q.ACTOR) {
        this.destroy()
        socket.emit('kill', {playerId: col.obj.p.playerId});
      } else {
        this.destroy();
      }
    },

    draw: function(ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(-this.p.cx,-this.p.cy,this.p.w,this.p.h);
    },
  });

  Q.Sprite.extend("ActorBullet",{
    init: function(p) {
      this._super(p,{
        w:10,
        h:4,
        type: Q.ACTOR,
        collisionMask: Q.ACTOR
      });
      this.add("2d");
      this.on("hit",this,"collision");
    },

    collision: function(col) {
      if (col.obj.p.type == Q.PLAYER) {
        this.destroy();
      } else if (col.obj.p.type == Q.BULLET) {

      } else if (col.obj.p.type == Q.ACTOR) {
        this.destroy();
      } else {
        this.destroy();
      }
    },

    draw: function(ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(-this.p.cx,-this.p.cy,this.p.w,this.p.h);
    },
  });
});
