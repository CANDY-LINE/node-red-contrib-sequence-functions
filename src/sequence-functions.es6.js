'use strict';

import { Parser } from 'expr-eval';
import statistics from 'simple-statistics';

export default function(RED) {

  class CaptureNode {
    constructor(n) {
      RED.nodes.createNode(this, n);
      this.name = n.name;
      this.size = n.size || 10;
      this.period = n.period || 30;
      this.interval = n.interval;
      this.onNewMessage = n.onNewMessage;
      this.eventSequence = [];
      let node = this;
      function canTrigger() {
        return node.eventSequence.length > 0;
      }
      function isClear(msg) {
        return ('clear' in msg) || (msg.topic === 'clear');
      }
      function isCapture(msg) {
        return ('capture' in msg) || (msg.topic === 'capture');
      }
      function appendEventSequnce(msg) {
        if ((msg.payload === undefined) || isCapture(msg)) {
          return;
        }
        msg._ts = Date.now();
        node.eventSequence.push(msg);
        while (node.eventSequence.length > node.size) {
          node.eventSequence.shift();
        }
      }
      function copy() {
        let ary = node.eventSequence.slice();
        return ary.map((ev) => {
          return {
            topic: ev.topic,
            payload: ev.payload
          };
        });
      }
      this.on('input', (msg) => {
        if (isClear(msg)) {
          node.eventSequence = [];
          return;
        }
        appendEventSequnce(msg);
        if (this.onNewMessage || isCapture(msg)) {
          this.send({
            topic: msg.topic,
            payload: copy()
          });
        }
      });
      this.testInterval = setInterval(() => {
        let criteria = Date.now() - this.period * 1000;
        this.eventSequence = this.eventSequence.filter((ev) => {
          return (ev._ts > criteria);
        });
      }, this.period * 1000);
      if (this.interval && (parseInt(this.interval) >= 1)) {
        this.triggerInterval = setInterval(() => {
          if (canTrigger()) {
            this.send({
              payload: copy()
            });
          }
        }, this.interval * 1000);
      }
      this.on('close', () => {
        clearInterval(this.testInterval);
        clearInterval(this.triggerInterval);
        delete this.eventSequence;
      });
    }
  }
  RED.nodes.registerType('capture', CaptureNode);

  class MapNode {
    constructor(n) {
      RED.nodes.createNode(this, n);
      this.name = n.name;
      this.topic = n.topic;
      this.valueProperty = n.valueProperty || 'payload';
      this.readFromProperty = n.readFromProperty;
      this.mapToString = n.mapToString;
      if (n.mapFunctionExpr) {
        this.parsedMapFunction = Parser.parse(n.mapFunctionExpr);
        try {
          this.parsedMapFunction.evaluate({ x: 0 });
          this.mapFunction = (val) => {
            let result = this.parsedMapFunction.evaluate({ x: val });
            if (this.mapToString) {
              return String(result);
            } else {
              result;
            }
          };
        } catch (e) {
          RED.log.error(RED._('sequence-functions.errors.parserError', { error: e }));
        }
      }
      if (!this.mapFunction) {
        this.mapFunction = (val) => {
          if (this.mapToString) {
            return String(val);
          } else {
            return val;
          }
        };
      }
      let node = this;
      function applyMapFunction(msg) {
        let ary = msg.payload;
        return ary.map((ele) => {
          let x = ele;
          if (node.readFromProperty) {
            x = RED.util.getMessageProperty(ele, node.valueProperty);
          }
          return node.mapFunction(x);
        });
      }
      this.on('input', (msg) => {
        if (!msg.payload) {
          return;
        }
        if (!Array.isArray(msg.payload)) {
          msg.payload = [msg.payload];
        }
        let result = applyMapFunction(msg);
        if (result) {
          this.send({
            topic: this.topic || msg.topic,
            payload: result
          });
        }
      });
    }
  }
  RED.nodes.registerType('map', MapNode);

  class ReduceNode {
    constructor(n) {
      RED.nodes.createNode(this, n);
      this.name = n.name;
      this.topic = n.topic;
      this.reduceRight = n.reduceRight;
      if (n.reduceFunctionExpr) {
        this.parsedReduceFunction = Parser.parse(n.reduceFunctionExpr);
        try {
          this.parsedReduceFunction.evaluate({ a: 0, x: 0 });
          this.reduceFunction = (accu, val) => {
            return this.parsedReduceFunction.evaluate({ a: accu, x: val });
          };
        } catch (e) {
          RED.log.error(RED._('sequence-functions.errors.parserError', { error: e }));
        }
      }
      if (!this.reduceFunction) {
        this.reduceFunction = (accu, val) => {
          return val;
        };
      }
      this.arrayReduce = this.reduceRight ? [].reduceRight : [].reduce;
      let node = this;
      function applyReduceFunction(msg) {
        let ary = msg.payload;
        if (!ary.length || ary.length === 0) {
          return null;
        }
        return node.arrayReduce.call(ary, (a, x) => {
          return node.reduceFunction(a, x);
        });
      }
      this.on('input', (msg) => {
        if (!msg.payload) {
          return;
        }
        if (!Array.isArray(msg.payload)) {
          msg.payload = [msg.payload];
        }
        let result = applyReduceFunction(msg);
        this.send({
          topic: this.topic || msg.topic,
          payload: result
        });
      });
    }
  }
  RED.nodes.registerType('reduce', ReduceNode);

  class FilterNode {
    constructor(n) {
      RED.nodes.createNode(this, n);
      this.name = n.name;
      this.topic = n.topic;
      this.rules = n.rules || [];
      this.checkall = n.checkall || 'true';

      let operators = {
        'eq': (a, b) => { return a == b; },
        'neq': (a, b) => { return a != b; },
        'lt': (a, b) => { return a < b; },
        'lte': (a, b) => { return a <= b; },
        'gt': (a, b) => { return a > b; },
        'gte': (a, b) => { return a >= b; },
        'btwn': (a, b, c) => { return a >= b && a <= c; },
        'cont': (a, b) => { return (a + '').indexOf(b) != -1; },
        'regex': (a, b, c, d) => { return (a + '').match(new RegExp(b,d?'i':'')); },
        'true': (a) => { return a === true; },
        'false': (a) => { return a === false; },
        'null': (a) => { return (typeof a === 'undefined' || a === null); },
        'nnull': (a) => { return (typeof a !== 'undefined' && a !== null); },
        'else': (a) => { return a === true; }
      };

      for (let i=0; i<this.rules.length; i+=1) {
        let rule = this.rules[i];
        if (!rule.vt) {
          if (!isNaN(Number(rule.v))) {
            rule.vt = 'num';
          } else {
            rule.vt = 'str';
          }
        }
        if (rule.vt === 'num') {
          if (!isNaN(Number(rule.v))) {
            rule.v = Number(rule.v);
          }
        }
        if (typeof rule.v2 !== 'undefined') {
          if (!rule.v2t) {
            if (!isNaN(Number(rule.v2))) {
              rule.v2t = 'num';
            } else {
              rule.v2t = 'str';
            }
          }
          if (rule.v2t === 'num') {
            rule.v2 = Number(rule.v2);
          }
        }
      }

      let node = this;
      function applyFilterBase(prop, evaluateNodeProperty) {
        var elseflag = true;
        for (var i=0; i<node.rules.length; i+=1) {
          var rule = node.rules[i];
          var test = prop;
          var v1,v2;
          v1 = evaluateNodeProperty(rule.v,rule.vt);
          v2 = rule.v2;
          if (typeof v2 !== 'undefined') {
            v2 = evaluateNodeProperty(rule.v2,rule.v2t);
          }
          if (rule.t == 'else') { test = elseflag; elseflag = true; }
          if (operators[rule.t](test,v1,v2,rule.case)) {
            elseflag = false;
            if (node.checkall === 'false') {
              return true;
            }
          } else {
            return false;
          }
        }
        return true;
      }

      this.on('input', (msg) => {
        if (!msg.payload) {
          return;
        }
        if (!Array.isArray(msg.payload)) {
          msg.payload = [msg.payload];
        }
        try {
          function evaluateNodeProperty(arg1, arg2) {
            return RED.util.evaluateNodeProperty(arg1, arg2, node, msg);
          }
          let result = msg.payload.filter((prop) => {
            return applyFilterBase(prop, evaluateNodeProperty);
          });
          this.send({
            topic: this.topic || msg.topic,
            payload: result
          });
        } catch(err) {
          RED.log.error(RED._('sequence-functions.errors.parserError', { error: e }));
        }
      });
    }
  }
  RED.nodes.registerType('filter', FilterNode);

  class StatsNode {
    constructor(n) {
      RED.nodes.createNode(this, n);
      this.name = n.name;
      this.topic = n.topic;
      this.statsFunction = n.statsFunction;
      this.on('input', (msg) => {
        if (!msg.payload) {
          return;
        }
        if (!Array.isArray(msg.payload)) {
          msg.payload = [msg.payload];
        }
        let result = statistics[this.statsFunction](msg.payload);
        this.send({
          topic: this.topic || msg.topic,
          payload: result
        });
      });
    }
  }
  RED.nodes.registerType('stats', StatsNode);
}
