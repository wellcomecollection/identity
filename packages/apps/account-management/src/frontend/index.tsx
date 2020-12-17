import React from 'react';
import { render } from 'react-dom';
import { Registration } from './Registration/Registration';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AppContextProvider } from '@weco/common/views/components/AppContext/AppContext';
import { ThemeProvider } from 'styled-components';
import theme from '@weco/common/views/themes/default';

// import '@weco/common/styles/styleguide.scss';
import './main.scss';

const root = document.getElementById('root');

if (root) {
  render(
    <ThemeProvider theme={theme}>
      <style id="styleguide-sass"></style>
      <AppContextProvider>
        <BrowserRouter>
          <Switch>
            <Route exact path="/register" component={Registration} />
          </Switch>
        </BrowserRouter>
      </AppContextProvider>
    </ThemeProvider>,
    root
  );
} else {
  console.warn('Could not mount application, #root not found');
}
