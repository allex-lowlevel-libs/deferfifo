var chai = require('chai'),
  expect = chai.expect,
  Checks = require('allex_checkslowlevellib'),
  DListBase = require('allex_doublelinkedlistbaselowlevellib'),
  Inherit = require('allex_inheritlowlevellib')(Checks.isFunction,Checks.isString).inherit,
  EventEmitter = require('allex_eventemitterlowlevellib')(DListBase,Inherit,Checks.isFunction,Checks.isArrayOfFunctions),
  DummyFunc = require('allex_functionmanipulationlowlevellib').dummyFunc,
  Fifo = require('allex_fifolowlevellib')(DListBase,Inherit),
  Timeout = require('allex_timeoutlowlevellib')(Checks.isFunction,Fifo),
  q = require('allex_qlowlevellib')(Timeout.runNext,Checks.isArray,Checks.isFunction,Inherit,DummyFunc,EventEmitter),
  DeferFifo = require('..')(DListBase,Inherit,q);

describe('\'DeferFifo\' lib testing: Basic', function(){
  function onFullfilled(df,done,r1,r2,r3){
    expect(df.length).to.be.equal(0);
    expect(df.head).to.be.null;
    expect(df.tail).to.be.null;
    expect(r1).to.be.equal(r2);
    expect(r1).to.be.equal(r3);
    expect(r2).to.be.equal(r3);
    done();
  }
  function onRejected(df,done,eArr){
    expect(df.length).to.be.equal(0);
    expect(df.head).to.be.null;
    expect(df.tail).to.be.null;
    expect(eArr[0]).to.be.equal('Rejected!');
    expect(eArr[0]).to.be.equal(eArr[1]);
    expect(eArr[0]).to.be.equal(eArr[2]);
    expect(eArr[1]).to.be.equal(eArr[2]);
    done();
  }
  function onNotify1(myObj,value){
    myObj.value += value;
  }
  function onNotify2(myObj,value){
    myObj.value += value*value;
  }
  function onNotify3(myObj,value){
    myObj.value *= value;
  }
  function onFullfilledWithNotify(df,done,myObj){
    expect(df.length).to.be.equal(0);
    expect(df.head).to.be.null;
    expect(df.tail).to.be.null;
    expect(myObj.value).to.be.equal(12);
    done();
  }
  it('resolve', function(done){
    var df = new DeferFifo();
    var p1 = df.defer();
    var p2 = df.defer();
    var p3 = df.defer();
    expect(df.length).to.be.equal(3);
    df.resolve(true); //whatever value you resolve df with, test will pass
    q.all([p1,p2,p3]).spread(onFullfilled.bind(null,df,done));
  });
  it('reject', function(done){
    var df = new DeferFifo();
    var p1 = df.defer();
    var p2 = df.defer();
    var p3 = df.defer();
    expect(df.length).to.be.equal(3);
    df.reject('Rejected!'); //whatever value you resolve df with, test will pass
    q.all([p1,p2,p3]).done(null,onRejected.bind(null,df,done));
  });
  it('resolve+notify', function(done){
    var df = new DeferFifo();
    var p1 = df.defer();
    var p2 = df.defer();
    var p3 = df.defer();
    var myObj = {value:0};
    p1.then(null,null,onNotify1.bind(null,myObj));
    p2.then(null,null,onNotify2.bind(null,myObj));
    p3.then(null,null,onNotify3.bind(null,myObj));
    q.all([p1,p2,p3]).spread(onFullfilledWithNotify.bind(null,df,done,myObj));
    expect(df.length).to.be.equal(3);
    df.notify(2);
    df.resolve(true); //whatever value you resolve df with, test will pass
  });
});
