'use strict';

// TODO: implement for stream reading?
module.exports = class SourceStream {
  constructor(str) {
    this._input = str
    this.pos = 0;
    this.row = 1;
    this.col = 0;
  }

  peek() {
    if(this.pos >= this._input.length)
      return null;
    else
      return this._input[this.pos];
  }

  read() {
    // Keep track of current line and column
    this.col++;
    if (isNewLine(this._input[this.pos])) {
      this.row++;
      this.col = 0;
    }

    if(this.pos >= this._input.length)
      return null;
    else
      return this._input[this.pos++];
  }

  eos() {
    return this.pos >= this._input.length;
  }
};

function isNewLine(ch) {
  return '\n' === ch;
}
