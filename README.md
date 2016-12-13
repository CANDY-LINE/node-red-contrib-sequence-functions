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
cd ~/.node-red
npm install node-red-contrib-sequence-functions
```

### Example flow

You can try the following flow for testing the node behaviors after installing this project.

```
[
    {
        "id": "8cefb4ce.83e7c",
        "type": "tab",
        "label": "seuqence-processing example"
    },
    {
        "id": "5d92a885.d883",
        "type": "inject",
        "z": "8cefb4ce.83e7c",
        "name": "value = 1",
        "topic": "",
        "payload": "1",
        "payloadType": "num",
        "repeat": "",
        "crontab": "",
        "once": false,
        "x": 100,
        "y": 120,
        "wires": [
            [
                "7797567f.19dad8"
            ]
        ]
    },
    {
        "id": "702dfed0.306c38",
        "type": "inject",
        "z": "8cefb4ce.83e7c",
        "name": "value = 2.5",
        "topic": "",
        "payload": "2.5",
        "payloadType": "num",
        "repeat": "",
        "crontab": "",
        "once": false,
        "x": 100,
        "y": 160,
        "wires": [
            [
                "7797567f.19dad8"
            ]
        ]
    },
    {
        "id": "d2559185.9c8548",
        "type": "inject",
        "z": "8cefb4ce.83e7c",
        "name": "value = 8.9",
        "topic": "",
        "payload": "8.9",
        "payloadType": "num",
        "repeat": "",
        "crontab": "",
        "once": false,
        "x": 100,
        "y": 240,
        "wires": [
            [
                "7797567f.19dad8"
            ]
        ]
    },
    {
        "id": "7797567f.19dad8",
        "type": "capture",
        "z": "8cefb4ce.83e7c",
        "name": "",
        "size": 10,
        "period": 30,
        "interval": "5",
        "onNewMessage": false,
        "x": 320,
        "y": 160,
        "wires": [
            [
                "f3dc3dd5.38d06",
                "ce0e161c.9552d"
            ]
        ]
    },
    {
        "id": "f3dc3dd5.38d06",
        "type": "map",
        "z": "8cefb4ce.83e7c",
        "name": "map: value = value * 2",
        "topic": "",
        "valueProperty": "payload",
        "readFromProperty": true,
        "mapFunctionExpr": "x * 2",
        "x": 340,
        "y": 240,
        "wires": [
            [
                "3ca5b242.4e56ce",
                "7a815652.6ccf4"
            ]
        ]
    },
    {
        "id": "3ca5b242.4e56ce",
        "type": "filter",
        "z": "8cefb4ce.83e7c",
        "name": "filter: < 10",
        "topic": "",
        "rules": [
            {
                "t": "lt",
                "v": "10",
                "vt": "num"
            }
        ],
        "checkall": "true",
        "x": 320,
        "y": 320,
        "wires": [
            [
                "31ba0b3d.32e42c",
                "5615b429.0884ec",
                "9dbf1b97.4b7b6"
            ]
        ]
    },
    {
        "id": "31ba0b3d.32e42c",
        "type": "stats",
        "z": "8cefb4ce.83e7c",
        "name": "",
        "topic": "",
        "statsFunction": "sum",
        "x": 320,
        "y": 480,
        "wires": [
            [
                "57b288a9.608718"
            ]
        ]
    },
    {
        "id": "5615b429.0884ec",
        "type": "reduce",
        "z": "8cefb4ce.83e7c",
        "name": "reduce: x - a",
        "topic": "",
        "reduceFunctionExpr": "x - a",
        "reduceRight": false,
        "x": 330,
        "y": 400,
        "wires": [
            [
                "3b1affad.3cc338"
            ]
        ]
    },
    {
        "id": "ce0e161c.9552d",
        "type": "debug",
        "z": "8cefb4ce.83e7c",
        "name": "capture result",
        "active": false,
        "console": "false",
        "complete": "payload",
        "x": 580,
        "y": 160,
        "wires": []
    },
    {
        "id": "7a815652.6ccf4",
        "type": "debug",
        "z": "8cefb4ce.83e7c",
        "name": "map result",
        "active": false,
        "console": "false",
        "complete": "payload",
        "x": 570,
        "y": 240,
        "wires": []
    },
    {
        "id": "9dbf1b97.4b7b6",
        "type": "debug",
        "z": "8cefb4ce.83e7c",
        "name": "filter result",
        "active": false,
        "console": "false",
        "complete": "payload",
        "x": 570,
        "y": 320,
        "wires": []
    },
    {
        "id": "3b1affad.3cc338",
        "type": "debug",
        "z": "8cefb4ce.83e7c",
        "name": "reduce result",
        "active": false,
        "console": "false",
        "complete": "payload",
        "x": 570,
        "y": 400,
        "wires": []
    },
    {
        "id": "57b288a9.608718",
        "type": "debug",
        "z": "8cefb4ce.83e7c",
        "name": "stats result",
        "active": true,
        "console": "false",
        "complete": "payload",
        "x": 570,
        "y": 480,
        "wires": []
    },
    {
        "id": "5f2902ae.f4c61c",
        "type": "inject",
        "z": "8cefb4ce.83e7c",
        "name": "reset",
        "topic": "clear",
        "payload": "",
        "payloadType": "date",
        "repeat": "",
        "crontab": "",
        "once": false,
        "x": 90,
        "y": 280,
        "wires": [
            [
                "7797567f.19dad8"
            ]
        ]
    },
    {
        "id": "f8b5e4f5.463708",
        "type": "inject",
        "z": "8cefb4ce.83e7c",
        "name": "emit",
        "topic": "capture",
        "payload": "",
        "payloadType": "date",
        "repeat": "",
        "crontab": "",
        "once": false,
        "x": 90,
        "y": 320,
        "wires": [
            [
                "7797567f.19dad8"
            ]
        ]
    },
    {
        "id": "13af9743.c07731",
        "type": "inject",
        "z": "8cefb4ce.83e7c",
        "name": "value = 4.9",
        "topic": "",
        "payload": "4.9",
        "payloadType": "num",
        "repeat": "",
        "crontab": "",
        "once": false,
        "x": 100,
        "y": 200,
        "wires": [
            [
                "7797567f.19dad8"
            ]
        ]
    },
    {
        "id": "893a9b52.54ed",
        "type": "comment",
        "z": "8cefb4ce.83e7c",
        "name": "Click the following inject nodes to generate a message sequence",
        "info": "",
        "x": 230,
        "y": 80,
        "wires": []
    }
]
```

# Revision History
* 1.1.0
    - Add a new property `Convert to String` into `map` node, which enables to convert the map function result into String

* 1.0.0
    - Initial release
