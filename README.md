Sequence Processing function Node-RED nodes
===

[![GitHub release](https://img.shields.io/github/release/CANDY-LINE/node-red-contrib-sequence-functions.svg)](https://github.com/CANDY-LINE/node-red-contrib-sequence-functions/releases/latest)
[![master Build Status](https://travis-ci.org/CANDY-LINE/node-red-contrib-sequence-functions.svg?branch=master)](https://travis-ci.org/CANDY-LINE/node-red-contrib-sequence-functions/)
[![License MIT](https://img.shields.io/github/license/CANDY-LINE/node-red-contrib-sequence-functions.svg)](http://opensource.org/licenses/MIT)

Sequence processing function Node-RED nodes including `map`, `reduce` and `filter`.

There are 5 nodes in this project.

1. `capture` node ... Capture a message and append it into an array, emit the array with the given trigger conditions
1. `stats` node ... Provide statistical processing function applied to an array in `msg.payload`
1. `map` node ... Provide `map` function applied to an array in `msg.payload`
1. `reduce` node ... Provide `reduce` function applied to an array in `msg.payload`
1. `filter` node ... Provide `filter` function applied to an array in `msg.payload`

Each node handles and manipulates an array in `msg.payload`.

You can use existing `split` node and `function` node in conjunction with the above nodes in order to process a sequence of messages.

### Installation

```
cd ~\.node-red
npm install node-red-contrib-sequence-functions
```

### Example flow

You can try the following flow for testing the node behaviors after installing this project.

```
TBW
```

# Revision History
* ?.?.?
    - Initial release
