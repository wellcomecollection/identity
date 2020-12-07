import React from 'react';
import { render } from 'react-dom';

const root = document.getElementById('root');

if (root) {
  render(
    <div>
      <h1>Hello world</h1>
    </div>,
    root
  );
} else {
  console.warn('Could not mount application, #root not found');
}
