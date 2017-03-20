function createDeferFifo(doublelinkedlistbase, inherit, q) {
  'use strict';

  var ListItemCtor = doublelinkedlistbase.Item,
    ListMixin = doublelinkedlistbase.Mixin;

  function DeferFifoItem(content) {
    ListItemCtor.call(this, content);
  }
  inherit(DeferFifoItem, ListItemCtor);
  DeferFifoItem.prototype.apply = function(item) {
    switch(item.action) {
      case 'r':
        return this.content.resolve(item.value);
      case 'n':
        return this.content.notify(item.progress);
      case 'e':
        return this.content.reject(item.error);
      default:
        throw Error('INVALID ITEM: '+JSON.stringify(item));
    }
    //return func(this.content);
  };

  function DeferFifo(){
    ListMixin.call(this);
  }
  ListMixin.addMethods(DeferFifo);
  DeferFifo.prototype.destroy = function () {
    this.reject(new Error('ABORTED'));
    ListMixin.prototype.destroy.call(this);
  };
  DeferFifo.prototype.defer = function(){
    var d, newItem;
    if (!this.assureForController()) {
      return q.reject(new Error('DESTROYED'));
    }
    d = q.defer();
    newItem = new DeferFifoItem(d);
    this.controller.addToBack(newItem);
    return d.promise;
  };
  DeferFifo.prototype.resolve = function (result) {
    if (!this.assureForController()) {
      return;
    }
    this.controller.drain({action:'r', value: result});
  };
  DeferFifo.prototype.reject = function (error) {
    if (!this.assureForController()) {
      return;
    }
    this.controller.drain({action:'e', error: error});
  };
  DeferFifo.prototype.notify = function (progress) {
    if (!this.assureForController()) {
      return;
    }
    this.controller.traverse({action:'n', progress: progress});
  };

  return DeferFifo;
}

module.exports = createDeferFifo;
