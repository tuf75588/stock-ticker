import React, { useEffect, useState } from 'react';
import protobuf from 'protobufjs';
const Buffer = require('buffer/');

const emojis = {
  '': '',
  up: '🚀',
  down: '💩',
};

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

function App() {
  const [stock, setStock] = useState<[] | null>(null);
  const [direction, setDirection] = useState<string>('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ws = new WebSocket('wss://streamer.finance.yahoo.com');
    protobuf.load('./YPricingData.proto', (error, root) => {
      if (error) {
        return console.error(error);
      }
      const Yaticker = root?.lookupType('yaticker');

      ws.onopen = function open() {
        console.log('connected');
        ws.send(
          JSON.stringify({
            subscribe: [(params.get('symbol') || 'GME').toUpperCase()],
          })
        );
      };
      ws.onclose = function closed() {
        console.log('disconnected');
      };

      ws.onmessage = function incoming(message) {
        const next = Yaticker?.decode(new Buffer(message.data, 'base64'));
      };
    });
  });
  return <h1>temp</h1>
}

export default App;
