import React from 'react';
import { ProfileForm } from '../src/frontend/AccountManagement/ProfileForm';
import { PasswordForm } from '../src/frontend/AccountManagement/PasswordForm';
import { DeleteAccount } from '../src/frontend/AccountManagement/DeleteAccount';

import { withKnobs, text } from '@storybook/addon-knobs';

export default { title: 'Account Admin', decorators: [withKnobs] };


export const ProfileFormUI: React.FC = () => {
  return (
    <ProfileForm
      existingTitle={text('Title', 'Lord')}
      existingFirstName={text('First Name', 'Samuel')}
      existingLastName={text('Surname', 'Beckett')}
      existingEmail={text('email', 'Becketts@provider.com')}
    />
  );
};

export const PasswordFormUI: React.FC = () => {
  return <PasswordForm />;
};

export const DeleteAccountUI: React.FC = () => {
  return <DeleteAccount />;
};
