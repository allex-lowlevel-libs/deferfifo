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
    this.reject(Error('ABORTED'));
    ListMixin.prototype.destroy.call(this);
  };
  DeferFifo.prototype.defer = function(){
    var d = q.defer(), newItem = new DeferFifoItem(d);
    this.assureForController();
    this.controller.addToBack(newItem);
    return d.promise;
  };
  DeferFifo.prototype.resolve = function (result) {
    this.assureForController();
    this.controller.drain({action:'r', value: result});
  };
  DeferFifo.prototype.reject = function (error) {
    this.assureForController();
    this.controller.drain({action:'e', error: error});
  };
  DeferFifo.prototype.notify = function (progress) {
    this.assureForController();
    this.controller.traverse({action:'n', progress: progress});
  };

  return DeferFifo;
}

module.exports = createDeferFifo;
