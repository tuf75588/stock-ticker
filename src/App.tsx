import React, { useEffect, useState } from 'react';
import protobuf from 'protobufjs';

const { Buffer } = require('buffer/');

const emojis: any = {
  '': '',
  up: '🚀',
  down: '💩',
};

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

function App() {
  const [stocks, setStock] = useState<any>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ws = new WebSocket('wss://streamer.finance.yahoo.com');
    protobuf.load('./YPricingData.proto', (error, root) => {
      if (error) {
        return console.log('error', error);
      }
      const Yaticker = root?.lookupType('yaticker');

      ws.onopen = function open() {
        console.log('connected');
        ws.send(
          JSON.stringify({
            subscribe: (params.get('symbols') || 'GME')
              .split(',')
              .map((symbol) => symbol.toUpperCase()),
          })
        );
      };

      ws.onclose = function close() {
        console.log('disconnected');
      };

      ws.onmessage = function incoming(message) {
        const next: any = Yaticker?.decode(new Buffer(message.data, 'base64'));
        setStock((current: any) => {
          let stock = current.find(
            (stock: { id: number }) => stock.id === next.id
          );
          if (stock) {
            return current.map(
              (stock: { id: number; direction: string; price: number }) => {
                if (stock.id === next.id) {
                  return {
                    ...next,
                    direction:
                      stock.price < next.price
                        ? 'up'
                        : stock.price > next.price
                        ? 'down'
                        : stock.direction,
                  };
                }
                return stock;
              }
            );
          } else {
            return [
              ...current,
              {
                ...next,
                direction: '',
              },
            ];
          }
        });
      };
    });
  }, []);

  useEffect(() => {
    if (stocks.length !== 0) {
      document.title = formatPrice(stocks[0].price);
    } else {
      document.title = '0';
    }
  });

  return (
    <div className="stocks">
      {stocks.map((stock: { id: number; direction: string; price: number }) => (
        <div className="stock" key={stock.id}>
          <h2 className={stock.direction}>
            {stock.id}
            {formatPrice(stock.price)} {emojis[stock.direction]}
          </h2>
        </div>
      ))}
    </div>
  );
}

export default App;
