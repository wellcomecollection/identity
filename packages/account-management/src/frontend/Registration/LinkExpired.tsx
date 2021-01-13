import React from 'react';
import SpacingComponent from '@weco/common/views/components/SpacingComponent/SpacingComponent';
// @ts-ignore
import SectionHeader from '@weco/common/views/components/SectionHeader/SectionHeader';
import styled from 'styled-components';

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
}`

export const LinkExpired = () => {
  return (
    <PageContainer>
      <LogoContainer>
        <img src={logo} alt="Wellcome Collection Logo" />
      </LogoContainer>
      <SpacingComponent />
      <h1 className="font-wb font-size-1">Link Expired Page</h1>
    </PageContainer>
  );
};
