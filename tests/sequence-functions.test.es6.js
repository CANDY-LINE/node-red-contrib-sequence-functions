'use strict';

import 'source-map-support/register';
import * as sinon from 'sinon';
import { assert } from 'chai';
import RED from 'node-red';
import eventProcessing from '../lib/sequence-functions';

let server = sinon.spy();
let settings = sinon.spy();
RED.init(server, settings);

describe('sequence-functions module', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('should be successfully initialized', () => {
    let registerType = sandbox.stub(RED.nodes, 'registerType');
    eventProcessing(RED);
    assert.equal(5, registerType.callCount);
  });

  describe('CaptureNode', () => {
    let CaptureNode;
    beforeEach(() => {
      RED.nodes.createNode = t => {
        t.status = () => {};
        t.on = () => {};
        t.send = () => {};
      };
      RED.nodes.registerType = (n, t) => {
        if (n === 'capture') {
          CaptureNode = t;
        }
      };
    });
    afterEach(() => {
      sandbox.restore();
    });
    describe('#constructor()', () => {
      it('should be able to create a new CaptureNode', () => {
        eventProcessing(RED);
        assert.isDefined(CaptureNode);
        let node = new CaptureNode({
          name: 'my-name',
          interval: 123,
          onNewMessage: true
        });
        assert.equal('my-name', node.name);
        assert.isDefined(node.eventSequence);
        assert.equal(0, node.eventSequence.length);
      });
    });
  });

  describe('MapNode', () => {
    let MapNode;
    beforeEach(() => {
      RED.nodes.createNode = t => {
        t.status = () => {};
        t.on = () => {};
        t.send = () => {};
      };
      RED.nodes.registerType = (n, t) => {
        if (n === 'map') {
          MapNode = t;
        }
      };
    });
    afterEach(() => {
      sandbox.restore();
    });
    describe('#constructor()', () => {
      it('should be able to create a new MapNode', () => {
        eventProcessing(RED);
        assert.isDefined(MapNode);
        let node = new MapNode({
          name: 'my-name',
          topic: '123',
          valueProperty: 'payload',
          mapFunctionExpr: 'x',
          mapToString: true
        });
        assert.equal('my-name', node.name);
        assert.isDefined(node.mapFunction);
        assert.isString(node.mapFunction(1));
      });
      it('should be able to create a new MapNode with mapToString being false', () => {
        eventProcessing(RED);
        assert.isDefined(MapNode);
        let node = new MapNode({
          name: 'my-name',
          topic: '123',
          valueProperty: 'payload',
          mapFunctionExpr: 'x',
          mapToString: false
        });
        assert.equal('my-name', node.name);
        assert.isDefined(node.mapFunction);
        assert.isNumber(node.mapFunction(1));
      });
    });
  });

  describe('ReduceNode', () => {
    let ReduceNode;
    beforeEach(() => {
      RED.nodes.createNode = t => {
        t.status = () => {};
        t.on = () => {};
        t.send = () => {};
      };
      RED.nodes.registerType = (n, t) => {
        if (n === 'reduce') {
          ReduceNode = t;
        }
      };
    });
    afterEach(() => {
      sandbox.restore();
    });
    describe('#constructor()', () => {
      it('should be able to create a new ReduceNode', () => {
        eventProcessing(RED);
        assert.isDefined(ReduceNode);
        let node = new ReduceNode({
          name: 'my-name',
          topic: '123',
          valueProperty: 'payload',
          reduceFunctionExpr: 'x'
        });
        assert.equal('my-name', node.name);
        assert.isDefined(node.reduceFunction);
      });
    });
  });

  describe('FilterNode', () => {
    let FilterNode;
    beforeEach(() => {
      RED.nodes.createNode = t => {
        t.status = () => {};
        t.on = () => {};
        t.send = () => {};
      };
      RED.nodes.registerType = (n, t) => {
        if (n === 'filter') {
          FilterNode = t;
        }
      };
    });
    afterEach(() => {
      sandbox.restore();
    });
    describe('#constructor()', () => {
      it('should be able to create a new FilterNode', () => {
        eventProcessing(RED);
        assert.isDefined(FilterNode);
        let node = new FilterNode({
          name: 'my-name',
          checkall: 'true'
        });
        assert.equal('my-name', node.name);
        assert.isDefined(node.rules);
        assert.isDefined(node.checkall);
      });
    });
  });

  describe('StatsNode', () => {
    let StatsNode;
    beforeEach(() => {
      RED.nodes.createNode = t => {
        t.status = () => {};
        t.on = () => {};
        t.send = () => {};
      };
      RED.nodes.registerType = (n, t) => {
        if (n === 'stats') {
          StatsNode = t;
        }
      };
    });
    afterEach(() => {
      sandbox.restore();
    });
    describe('#constructor()', () => {
      it('should be able to create a new StatsNode', () => {
        eventProcessing(RED);
        assert.isDefined(StatsNode);
        let node = new StatsNode({
          name: 'my-name',
          topic: 'topic',
          statsFunction: 'mean'
        });
        assert.equal('my-name', node.name);
        assert.equal('topic', node.topic);
        assert.equal('mean', node.statsFunction);
      });
    });
  });
});
