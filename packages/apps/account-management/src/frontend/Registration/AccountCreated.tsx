import React from 'react';
import SpacingComponent from '@weco/common/views/components/SpacingComponent/SpacingComponent';

export const AccountCreated = () => {
  return (
    <>
      <SpacingComponent />
      <h1 className="font-wb font-size-1">Account Created</h1>
      <SpacingComponent />
      <p className="font-wb font-size-5">
        Thank you for completing the registration form, you have succesfully created an acccount
      </p>
      <SpacingComponent />
      <p className="font-wb font-size-5">Please check your email inbox to verify your email address.</p>
    </>
  );
};
