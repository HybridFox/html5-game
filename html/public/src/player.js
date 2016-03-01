require([], function () {

  var BULLET = 15;
  var PLAYER = 16;
  var ACTOR = 17;

  Q.Sprite.extend('Player', {
    init: function (p) {
      this._super(p, {
        sheet: 'player',
        type: PLAYER
      });
      this.add('2d, platformerControls, animation');
    },
    step: function (dt) {
      socket.emit('update', { playerId: this.p.playerId, x: this.p.x, y: this.p.y, sheet: this.p.sheet });
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

    socket.emit('shoot', { playerId: player.p.playerId, x: player.p.x, y: player.p.y, dx: dx, dy: dy});

    stage.insert(
      new Q.Bullet({x: player.p.x,
                    y: player.p.y - 20,
                    vx: dx * 1000,
                    vy: dy * 1000
      })
    );
  });

  Q.Sprite.extend('Actor', {
    init: function (p) {
      this._super(p, {
        update: true,
        type: ACTOR
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

  Q.Sprite.extend("Bullet",{
    init: function(p) {
      this._super(p,{
        w:2,
        h:2,
        type: BULLET
      });
      this.add("2d");
      this.on("hit",this,"collision");
    },

    collision: function(col) {
      if (col.obj.p.type == PLAYER) {
        this.destroy();
      } else if (col.obj.p.type == BULLET) {

      } else if (col.obj.p.type == ACTOR) {
        console.log("Killed Someone");
        col.obj.destroy();
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
        w:2,
        h:2,
        type: BULLET
      });
      this.add("2d");
      this.on("hit",this,"collision");
    },

    collision: function(col) {
      if (col.obj.p.type == PLAYER) {
        console.log("Got Killed");
        this.destroy();
        col.obj.destroy();
      } else if (col.obj.p.type == BULLET) {

      } else if (col.obj.p.type == ACTOR) {
        col.obj.destroy();
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
