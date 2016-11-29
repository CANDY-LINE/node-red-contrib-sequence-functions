'use strict';

import { Parser } from 'expr-eval';

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
      function appendEventSequnce(msg) {
        if (!msg.payload || 'capture' in msg) {
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
        appendEventSequnce(msg);
        if (this.onNewMessage || ('capture' in msg)) {
          this.send({
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
      if (n.mapFunctionExpr) {
        this.parsedMapFunction = Parser.parse(n.mapFunctionExpr);
        try {
          this.parsedMapFunction.evaluate({ x: 0 });
          this.mapFunction = (val) => {
            return this.parsedMapFunction.evaluate({ x: val });
          };
        } catch (e) {
          RED.log.error(RED._('event-processing.errors.parserError', { error: e }));
        }
      }
      if (!this.mapFunction) {
        this.mapFunction = (val) => {
          return val;
        };
      }
      let node = this;
      function applyMapFunction(msg) {
        let ary = msg.payload;
        return ary.map((ele) => {
          let val = RED.util.getMessageProperty(ele, node.valueProperty);
          return node.mapFunction(val);
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
            topic: this.topic,
            payload: result
          });
        }
      });
    }
  }
  RED.nodes.registerType('map', MapNode);
}
