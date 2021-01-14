import React from 'react';
import { render } from 'react-dom';
import { Registration } from './Registration/Registration';
import { AccountValidated } from './Registration/AccountValidated';
import { AccountManagement } from './AccountManagement/AccountManagement';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AppContextProvider } from '@weco/common/views/components/AppContext/AppContext';
import { ThemeProvider } from 'styled-components';
import theme from '@weco/common/views/themes/default';
import styled from 'styled-components';

import '@weco/common/styles/styleguide.scss';

const root = typeof document !== 'undefined' ? document.getElementById('root') : undefined;

const Wrapper = styled.div`
<<<<<<< HEAD
   {
    width: 70%;
    margin: auto;
    background-color: #f0ede3;
    padding: 42px;
  }
=======
  width: 70%;
  margin: auto;
  background-color: #f0ede3;
  padding: 0 42px;
  max-height: 100%;
  overflow: auto;
>>>>>>> Adjust ProfileForm in line with UX design
`;

if (root) {
  render(
    <ThemeProvider theme={theme}>
      <Wrapper>
        <style id="styleguide-sass"></style>
        <AppContextProvider>
          <BrowserRouter>
            <Switch>
              <Route exact path="/register" component={Registration} />
              <Route exact path="/validated" component={AccountValidated} />
              <Route exact path="/account">
                <AccountManagement
                  firstName="Samuel"
                  lastName="Beckett"
                  emailAddress="beckett@provider.com"
                  libraryCardNumber="123456"
                />
              </Route>
            </Switch>
          </BrowserRouter>
        </AppContextProvider>
      </Wrapper>
    </ThemeProvider>,
    root
  );
} else {
  console.warn('Could not mount application, #root not found');
}
