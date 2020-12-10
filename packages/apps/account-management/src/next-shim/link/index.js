const React = require('react');
module.exports = props => {
  props.style = { textDecoration: 'none', ...(props.style || {}) };
  return React.createElement('a', props);
};
