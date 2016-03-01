require([], function () {
  Q.Sprite.extend('Player', {
    init: function (p) {
      this._super(p, {
        sheet: 'player'
      });
      this.add('2d, platformerControls, animation');
      this.on("drag")
    },
    step: function (dt) {
      socket.emit('update', { playerId: this.p.playerId, x: this.p.x, y: this.p.y, sheet: this.p.sheet });
    },
    drag: function() {
      console.log("fire");
    }
  });

  Q.Sprite.extend('Actor', {
    init: function (p) {
      this._super(p, {
        update: true
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
});
