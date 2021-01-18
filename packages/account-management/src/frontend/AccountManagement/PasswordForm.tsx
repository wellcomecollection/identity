import React, { useState } from 'react';
import { SolidButton } from '@weco/common/views/components/ButtonSolid/ButtonSolid';
import SpacingComponent from '@weco/common/views/components/SpacingComponent/SpacingComponent';

import { ErrorMessage } from '../Shared/ErrorMessage';
import { PasswordInput } from '../Shared/PasswordInput';

// At least 8 characters, one uppercase, one lowercase and number
const passwordPolicy = /(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*/;

export const PasswordForm: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmation, setConfirmation] = useState<string>('');

  const isValid = newPassword && passwordPolicy.test(newPassword);
  const isConfirmed = newPassword === confirmation;

  const updatePassword = () => {
    // Update Password
  };

  return (
    <>
      <h1 className="font-wb font-size-4">Change your password using the form below.</h1>
      <form>
        <SpacingComponent />
        <PasswordInput
          label="Type new password"
          value={newPassword}
          setValue={setNewPassword}
          pattern={passwordPolicy}
        />
        {!isValid && (
          <ErrorMessage>
            The password you have entered does not meet the password policy. Please enter a password with at least 8
            characters, a combination of upper and lowercase letters and at least one number.
          </ErrorMessage>
        )}
        <SpacingComponent />
        <PasswordInput label="Retype new password" value={confirmation} setValue={setConfirmation} />
        {!isConfirmed && <ErrorMessage>The passwords you entered did not match.</ErrorMessage>}
        <SpacingComponent />
        <SolidButton disabled={!isValid} onClick={updatePassword}>
          Update Password
        </SolidButton>
        <input type="submit" value="Submit" hidden={true} />
      </form>
    </>
  );
};
