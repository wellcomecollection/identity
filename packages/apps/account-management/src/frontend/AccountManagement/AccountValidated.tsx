import React from 'react';
// @ts-ignore
import SpacingComponent from '@weco/common/views/components/SpacingComponent/SpacingComponent';
// @ts-ignore
import SectionHeader from '@weco/common/views/components/SectionHeader/SectionHeader';

export const AccountValidated = () => {
  return (
    <>
      <SpacingComponent />
      <h1 className="font-wb font-size-1">Welcome back</h1>

      <SpacingComponent />
      <p>
        Your email has been verified and you can now <a href="TBC">login</a> to the site.
      </p>
      <SpacingComponent />
    </>
  );
};
