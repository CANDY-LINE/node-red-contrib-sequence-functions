'use strict';

import 'source-map-support/register';
import * as sinon from 'sinon';
import { assert } from 'chai';
import RED from 'node-red';
import eventProcessing from '../lib/event-processing';

let server = sinon.spy();
let settings = sinon.spy();
RED.init(server, settings);

describe('event-processing module', () => {
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
    assert.isTrue(registerType.calledOnce);
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
});
