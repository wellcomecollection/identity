import React from 'react';
import SpacingComponent from '@weco/common/views/components/SpacingComponent/SpacingComponent';
// @ts-ignore
import SectionHeader from '@weco/common/views/components/SectionHeader/SectionHeader';
import { OutlinedButton } from '@weco/common/views/components/ButtonOutlined/ButtonOutlined';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

// TODO: Update this to prod.
const logo = 'https://identity-public-assets-stage.s3.eu-west-1.amazonaws.com/images/wellcomecollections-150x50.png';

const LogoContainer = styled.div`
   {
    margin: auto;
    padding: 42px;
    width: 200px;
  }
`;

const PageContainer = styled.div`
   {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

export const ErrorPage = () => {
  const history = useHistory();

  const redirectToWellcomeHelpPage = () => {
    // Is it possible to configure the support url through auth0.
    history.push('/support');
  };

  return (
    <PageContainer>
      <LogoContainer>
        <img src={logo} alt="Wellcome Collection Logo" />
      </LogoContainer>
      <SpacingComponent />
      <h1 className="font-wb font-size-1">Error Page</h1>
      <SpacingComponent />
      <p className="font-wb font-size-5">Something went wrong verifying your account.</p>
      <SpacingComponent />
      <OutlinedButton onClick={redirectToWellcomeHelpPage}>
        Visit our help desk
      </OutlinedButton>
    </PageContainer>
  );
};
