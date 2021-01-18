import React, { useState } from 'react';
import { SolidButton } from '@weco/common/views/components/ButtonSolid/ButtonSolid';
// @ts-ignore
import TextInput from '@weco/common/views/components/TextInput/TextInput';
import SpacingComponent from '@weco/common/views/components/SpacingComponent/SpacingComponent';

import { ErrorMessage } from '../Shared/ErrorMessage';

// At least 8 characters, one uppercase, one lowercase and number
const passwordPolicy = /(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*/;

export const PasswordForm: React.FC = () => {
  const [password, setPassword] = useState<string>();
  const [confirmation, setConfirmation] = useState<string>();

  const isValid = password && !passwordPolicy.test(password || '');
  const isConfirmed = password === confirmation;

  const updatePassword = () => {
    // Update Password
  };

  return (
    <>
      <h1 className="font-wb font-size-4">Change your password using the form below.</h1>
      <form>
        <SpacingComponent />
        <TextInput
          placeholder=""
          required={true}
          aria-label="Type new password"
          label="Type new password"
          value={password}
          setValue={(value: string) => setPassword(value)}
          type="password"
          pattern={passwordPolicy}
        />
        {!isValid && (
          <ErrorMessage>
            The password you have entered does not meet the password policy. Please enter a password with at least 8
            characters, a combination of upper and lowercase letters and at least one number.
          </ErrorMessage>
        )}
        <SpacingComponent />
        <TextInput
          required={true}
          aria-label="Retype new password"
          label="Retype new password"
          value={confirmation}
          setValue={(value: string) => setConfirmation(value)}
          type="password"
        />
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
