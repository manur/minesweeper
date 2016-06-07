var Board = function(cols, rows, numMines) {
  var board = this;

  /* Dimensions */
  if(!cols) {
    cols = 16;
  }
  if(!rows) {
    rows = 16;
  }
  
  var numTiles = cols * rows;

  this.cols = cols;
  this.rows = rows;
  this.numTiles = numTiles;

  if(!numMines) {
    numMines = Math.floor(Math.sqrt(Math.floor(Math.sqrt(numTiles)))) * 20;
  }
  this.numMines = numMines;

  var randomSample = function(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
  };

  /* Populate mines */
  var linear = Array(numTiles);
  var idx;
  for(idx = 0; idx < numTiles; idx += 1) {
    linear[idx] = idx;
  }
  var mineIdx = randomSample(linear, numMines);
  this.mineIdx = mineIdx;
  this.createPaddedMatrix();
  this.createPressedMatrix();
  this.markTiles();
};


Board.prototype.getColIndex = function(idx) {
  return idx % this.cols;
};

Board.prototype.getRowIndex = function(idx) {
  return Math.floor(idx / this.cols);
};


Board.prototype.neighbors = function(paddedCol, paddedRow) {
  var board = this;
  return [
    board._paddedMatrix[paddedCol - 1][ paddedRow - 1],
    board._paddedMatrix[paddedCol - 1][ paddedRow    ],
    board._paddedMatrix[paddedCol - 1][ paddedRow + 1],
    board._paddedMatrix[paddedCol    ][ paddedRow - 1],
    board._paddedMatrix[paddedCol    ][ paddedRow + 1],
    board._paddedMatrix[paddedCol + 1][ paddedRow - 1],
    board._paddedMatrix[paddedCol + 1][ paddedRow    ],
    board._paddedMatrix[paddedCol + 1][ paddedRow + 1],
    ];
};


Board.prototype.markTiles = function() {
  var board = this;
  var col, row, paddedCol, paddedRow;

  var rcs = _.map(this.mineIdx, function(idx) {
    var colIndex = board.getColIndex(idx);
    var rowIndex = board.getRowIndex(idx);

    return [colIndex, rowIndex];
  });

  console.log(rcs);

  for(col = 0; col < board.cols; col +=1) {
    for(row = 0; row < board.rows; row +=1) {
      paddedCol = col + 1;
      paddedRow = row + 1;

      if(_.any(rcs, function(idx) {
        return col === idx[0] &&  row === idx[1];
      })) {
        // Mark tile as mine
        board._paddedMatrix[paddedCol][paddedRow] = null;
      }
    }
  }

  for(col = 0; col < board.cols; col +=1) {
    for(row = 0; row < board.rows; row +=1) {
      paddedCol = col + 1;
      paddedRow = row + 1;

      if(!_.isNull(board._paddedMatrix[paddedCol][paddedRow])) {
        var mark = 0;
        var neighbors = board.neighbors(paddedCol, paddedRow);
        mark += _.select(neighbors, function(neighbor) {
          return _.isNull(neighbor);  
        }).length;
        board._paddedMatrix[paddedCol][paddedRow] = mark;
      }
    }
  }
};

Board.prototype.createPaddedMatrix = function() {
  this._paddedMatrix = Array(this.cols + 2);

  for(var paddedCol = 0; paddedCol < this.cols + 2 ; paddedCol += 1) {
    this._paddedMatrix[paddedCol] = Array(this.rows + 2);
    _.each(this._paddedMatrix[paddedCol], function(elem) {
      elem = 0;
    });
  }

  return this._paddedMatrix;
};

Board.prototype.createPressedMatrix = function() {
  this._pressedMatrix = Array(this.cols + 2);

  for(var pressedCol = 0; pressedCol < this.cols + 2 ; pressedCol += 1) {
    this._pressedMatrix[pressedCol] = Array(this.rows + 2);
    _.each(this._pressedMatrix[pressedCol], function(elem) {
      elem = false;
    });
  }

  return this._pressedMatrix;
};

Board.prototype.getPaddedMatrix = function() {
  return this._paddedMatrix;
};

Board.prototype.press = function(paddedCol, paddedRow, done) {
  var board = this;
  var opens;

  if(board._pressedMatrix[paddedCol][paddedRow] === 'mine') {
    return; // no-op
  }

  board._pressedMatrix[paddedCol][paddedRow] = true;

  if(_.isNull(board._paddedMatrix[paddedCol][paddedRow])) {

    done({
      terminate: {
              paddedCol: paddedCol,
              paddedRow: paddedRow,
              termination: 'mine'
            }
    });

  } else {

    done({
      open: {
          paddedCol: paddedCol,
          paddedRow: paddedRow
      }
    });

    board.openAnyUnopenedNeighbors(paddedCol, paddedRow, done);

  }
};

Board.prototype.allMinesDetected = function() {
  var board = this;

  var numMarkedMines = 0;
  var allDetected = true;

  for(var c=0; c<board.cols; c+=1) {
    for(var r=0; r<board.rows; r+=1) {

      if(board._pressedMatrix[c+1][r+1] === 'mine' && board._paddedMatrix[c+1][r+1] !== null) {
        allDetected = false;
      }

      if(board._pressedMatrix[c+1][r+1] !== 'mine' && board._paddedMatrix[c+1][r+1] === null) {
        allDetected = false;
      }

    }
  }

  return allDetected;
};

Board.prototype.markAsMine = function(paddedCol, paddedRow, done) {
  var board = this;

  if(board._pressedMatrix[paddedCol][paddedRow] !== 'mine') {
    board._pressedMatrix[paddedCol][paddedRow] = 'mine'; // denotes mark as mine
  } else {
    board._pressedMatrix[paddedCol][paddedRow] = false; // revert mark
  }

  if(board.allMinesDetected()) {
    done({
      terminate: {
                    paddedCol: paddedCol,
                    paddedRow: paddedRow,
                    termination: 'complete'
                  }
    });
  }
}

Board.prototype.openAnyUnopenedNeighbors = function(paddedCol, paddedRow, done) {
  var board = this;

  const neighboringIndices = [
   [paddedCol - 1, paddedRow - 1],
   [paddedCol - 1, paddedRow    ],
   [paddedCol - 1, paddedRow + 1],
   [paddedCol    , paddedRow - 1],
   [paddedCol    , paddedRow + 1],
   [paddedCol + 1, paddedRow - 1],
   [paddedCol + 1, paddedRow    ],
   [paddedCol + 1, paddedRow + 1],
  ];

  _.each(neighboringIndices, function(colRow) {
    const _paddedRow = colRow[1];
    const _paddedCol = colRow[0];

    const neighborMark = board._paddedMatrix[_paddedCol][_paddedRow];
    //console.log("neighbor mark: ", neighborMark);

    if(!board._pressedMatrix[_paddedCol][_paddedRow] && !_.isNull(board._paddedMatrix[_paddedCol][_paddedRow])) {
      board._pressedMatrix[_paddedCol][_paddedRow] = true;

      done({
        open: {
                paddedCol: _paddedCol,
                paddedRow: _paddedRow
              }
      });

      if(neighborMark === 0) {
        setTimeout(function() {
          board.openAnyUnopenedNeighbors(_paddedCol, _paddedRow, done);
        }, 0);
      }
    }
  });
};


