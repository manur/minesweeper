
const Template = function(templateSelector) {
  return Handlebars.compile($(templateSelector).html());
};

var Model = Backbone.Model.extend({


  initialize: function() {

                function getParameterByName(name, url) {
                  if (!url) url = window.location.href;
                  name = name.replace(/[\[\]]/g, "\\$&");
                  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                  results = regex.exec(url);
                  if (!results) return null;
                  if (!results[2]) return '';
                  return decodeURIComponent(results[2].replace(/\+/g, " "));
                }

                var rows = $('input.rows').html() || 16;
                var cols = $('input.cols').html() || 16;
                var numMines = $('input.mines').html() || 40;

                this.board = new Board(rows, cols, numMines);
                this.paddedMatrix = this.board.getPaddedMatrix();
              },

    press: function(paddedCol, paddedRow) {
             var model = this;
             this.board.press(paddedCol, paddedRow, function(update) {

               // console.log('update', update);

               if(update.open) {
                 model.trigger('open', {
                   paddedCol: update.open.paddedCol,
                   paddedRow: update.open.paddedRow
                 });
               }

               if(update.terminate) {
                 model.trigger('terminate', {
                   paddedCol: update.terminate.paddedCol,
                   paddedRow: update.terminate.paddedRow,
                   termination: update.terminate.termination
                 });
               }
             });
           },

    markAsMine: function(paddedCol, paddedRow) {
                  var model = this;
                  this.board.markAsMine(paddedCol, paddedRow, function(update) {
                    // console.log('markAsMine update', update);

                    if(update.terminate) {
                      model.trigger('terminate', {
                        paddedCol: update.terminate.paddedCol,
                        paddedRow: update.terminate.paddedRow,
                        termination: update.terminate.termination
                      });
                    }

                  });
                }
});

var Minesweeper = Backbone.View.extend({
  template: Template('.minesweeper.template'),
  cellTemplate: Template('.minesweeper-cell.template'),

  initialize: function() {
    this.model = new Model();
    this.listenTo(this.model, 'open', this.open);
    this.listenTo(this.model, 'terminate', this.terminate);
  },

  events: {
            "click          table.active.board td button": "markAsMine",
            "contextmenu    table.active.board td button": "markAsMine"
          },

  render: function() {
            this.$el.html(this.template({
            }));

            this.$board = this.$el.find('table.board');

            for(var paddedCol = 1; paddedCol < this.model.paddedMatrix.length - 1; paddedCol += 1) {
              var $col = $('<tr></tr>');
              for(var paddedRow = 1; paddedRow < this.model.paddedMatrix[paddedCol].length - 1; paddedRow += 1) {
                const elem = this.model.paddedMatrix[paddedCol][paddedRow];
                const str = (elem === null) ? '' : (elem === 0) ? '' : elem;

                const $cell = $(this.cellTemplate({
                  text: str,
                  paddedCol: paddedCol,
                  paddedRow: paddedRow,
                  isMine: elem === null,
                  mark: elem
                }));

                $col.append($cell);
              }
              this.$board.append($col);
            }
          },

  open: function(openevt) {
          // console.log("openevt", openevt);
          var $cell = this.$el.find('[data-padded-column="' + openevt.paddedCol + '"][data-padded-row="' + openevt.paddedRow + '"]');
          $cell.addClass('pressed');
        },

  terminate: function(terminateEvt) {
               var $cell = this.$el.find('[data-padded-column="' + terminateEvt.paddedCol + '"][data-padded-row="' + terminateEvt.paddedRow + '"]');

               $cell.closest('table.board.active').removeClass('active');

               if(terminateEvt.termination === 'complete') {
                 $('.completed .victory-message').html(this.victoryMessage());
                 $('.completed').show();
                 $('.restart-game').show();
               } else {
                 // hit a mine
                 $('.lost .defeat-message').html(this.defeatMessage());
                 $('.lost').show();
                 $('.restart-game').show();
               }

               this.stopTimer();

               console.log(terminateEvt.termination);
             },

  victoryMessage: function() {
                    var items = [
                      'Victory is your birthright. ',
                      'Awww, yeah! Nice work. ',
                      'That\'s some sweet clicking. ',
                      'Mine marking. Like A Boss. ',
                      'Winning! '
                    ];

                    return items[Math.floor(Math.random()*items.length)];
                  },


  defeatMessage: function() {
                    var items = [
                      'Oh, dear. Not your day, is it? ',
                      'Ah! Losing, your old nemesis. ',
                      ':( Better luck next time. ',
                      'There\'s always tomorrow... '
                    ];

                    return items[Math.floor(Math.random()*items.length)];
                  },

  markAsMine: function(evt) {
                      this.startTimer();

                      var $target = $(evt.currentTarget);
                      var $td = $target.closest('td');
                      
                      $td.toggleClass('mark-as-mine');
                      var $cell = $target.closest('td')

                      var paddedCol = $cell.data('paddedColumn');
                      var paddedRow = $cell.data('paddedRow');
                      this.model.markAsMine(paddedCol, paddedRow);

                      this.mineCount();
                      
                      evt.stopPropagation();
                      evt.preventDefault();
                    },

  mineCount: function() {
               var $mineCount  = $('.mine-count');
               var count = this.model.board.numMines - this.model.board.numMinesMarked;
               if(count > -1 && count < 10) {
                 count = '0' + count;
               } else if(count <- -10) {
                 count = '--';
               }
               $mineCount.html(count);
             },

  startTimer: function() {
                if(this.timer) {
                  return;
                }

                var view = this;
                var $time = $('.time-elapsed');
                var setClock = function(time) {
                  var seconds = time % 60 + '';
                  if(seconds.length === 1) {
                    seconds = '0' + seconds;
                  }
                  $time.html(Math.floor(time / 60) + ':' + seconds);
                };

                var start = Date.now();
                this.timer = setInterval(function() {
                  setClock(Math.round((Date.now() - start) / 1000));
                }, 1000);

              },

  stopTimer: function() {
               clearInterval(t);
             }
});


var App = Backbone.View.extend({
  template: Template('.template.app'),

    initialize: function() {
      this.minesweeper = new Minesweeper({
      });
    },

  events: {
            "click          .reload":   "reload"
          },

  reload: function() {
            window.location.reload();
          },

  render: function() {
            this.$el.html(this.template());
            this.minesweeper.render();
            this.$el.find('.minesweeper-container').html(this.minesweeper.$el);
          }
});

window.app = new App({
  el: $('#app-container')
});

app.render();



