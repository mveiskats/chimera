'use strict';

exports.symbolName = (sym) => sym.toString().slice(7, -1);

// TODO: implement for stream reading?
exports.SyncStream = class SyncStream {
  constructor(str) {
    this._input = str
    this.pos = 0;
    this.row = 0;
    this.col = 0;
  }

  peek() {
    if(this.pos >= this._input.length)
      return null;
    else
      return this._input[this.pos];
  }

  read() {
    if(this.pos >= this._input.length)
      return null;
    else
      return this._input[this.pos++];
  }

  eos() {
    return this.pos >= this._input.length;
  }
};
