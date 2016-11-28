'use strict';

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
}
