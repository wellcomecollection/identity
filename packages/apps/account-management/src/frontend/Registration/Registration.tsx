import React, { useState, useEffect } from 'react';

import { SolidButton } from '@weco/common/views/components/ButtonSolid/ButtonSolid';
// @ts-ignore
import TextInput from '@weco/common/views/components/TextInput/TextInput';
import CheckboxRadio from '@weco/common/views/components/CheckboxRadio/CheckboxRadio';
import SpacingComponent from '@weco/common/views/components/SpacingComponent/SpacingComponent';
// @ts-ignore
import SectionHeader from '@weco/common/views/components/SectionHeader/SectionHeader';

import { AccountCreated } from './AccountCreated';
import { AccountValidated } from '../AccountManagement/AccountValidated';
import { ErrorMessage } from '../Shared/ErrorMessage';

const logo = 'https://identity-public-assets-stage.s3.eu-west-1.amazonaws.com/images/wellcomecollections-150x50.png';
import styled from 'styled-components';

// At least 8 characters, one uppercase, one lowercase and number
const passwordPolicy = /(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*/;

const LogoContainer = styled.div`
   {
    margin: auto;
    padding: 42px;
    width: 200px;
  }
`;

export const Registration = () => {
  const [firstName, setFirstName] = useState<string>();
  const [lastName, setLastName] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [pass, setPass] = useState<string>();
  const [valid, setValid] = useState<boolean | undefined | ''>(false);
  const [created, setCreated] = useState<boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [passQualifies, setPassQualifies] = useState(true);

  useEffect(() => {
    // check if email exists
    setAlreadyExists(false);
  }, [email]);

  useEffect(() => {
    // check if password passes password policy
    pass && !passwordPolicy.test(pass || '') ? setPassQualifies(false) : setPassQualifies(true);
  }, [pass]);


  useEffect(() => {
    setValid(
      firstName &&
        lastName &&
        email &&
        passwordPolicy.test(pass || '')
    );
  }, [firstName, lastName, email, pass]);

  useEffect(() => {
    //determine if validated on mount
    setValidated(false);
  }, []);

  const createAccount = () => {
    if (valid) setCreated(true);
    // Create account
  };
  return (
    <div>
      <LogoContainer>
        <img src={logo} alt="Wellcome Collection Logo" />
      </LogoContainer>
      {validated ? (
        <AccountValidated />
      ) : created ? (
        <AccountCreated />
      ) : (
        <>
          <SpacingComponent />
          <h1 className="font-wb font-size-1" style={{ textAlign: 'center' }}>
            Register
          </h1>
          <form>
            <SpacingComponent />
            <h1 className="font-wb font-size-4"> Personal Details</h1>
            <TextInput
              placeholder=""
              required={true}
              aria-label="First Name"
              label="First name"
              value={firstName}
              setValue={(value: string) => setFirstName(value)}
            />
            <SpacingComponent />
            <TextInput
              placeholder=""
              required={true}
              aria-label="Last name"
              label="Last name"
              value={lastName}
              setValue={(value: string) => setLastName(value)}
            />
            <SpacingComponent />
            <h1 className="font-wb font-size-4"> Login Details</h1>

            <TextInput
              placeholder=""
              required={true}
              aria-label="Email Address"
              label="Email address"
              value={email}
              type="email"
              setValue={(value: string) => setEmail(value)}
            />
            {alreadyExists ? (
              <ErrorMessage>
                This account already exists. You can try to <a href="TBC">{''}login</a>
              </ErrorMessage>
            ) : (
              <></>
            )}
            <SpacingComponent />
            <TextInput
              placeholder=""
              required={true}
              aria-label="Password"
              label="Password"
              value={pass}
              setValue={(value: string) => setPass(value)}
              type="password"
              pattern={passwordPolicy}
            />
            {!passQualifies ? (
              <ErrorMessage>
                The password you have entered does not meet the password policy. Please enter a password with at least 8
                characters, a combination of upper and lowercase letters and at least one number.
              </ErrorMessage>
            ) : (
              <ul>
                <li>One lowercase character</li>
                <li>One uppercase character</li>
                <li>One number</li>
                <li> 8 characters minimum</li>
              </ul>
            )}
            <SpacingComponent />
            <SolidButton onClick={createAccount}>Create Account</SolidButton>
            <SpacingComponent />
            <input type="submit" value="Submit" hidden={true} />
          </form>
        </>
      )}
    </div>
  );
};
