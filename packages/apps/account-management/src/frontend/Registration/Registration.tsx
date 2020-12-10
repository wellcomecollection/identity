import React, { useState, useEffect } from 'react';

import { SolidButton } from '@weco/common/views/components/ButtonSolid/ButtonSolid';
// @ts-ignore
import TextInput from '@weco/common/views/components/TextInput/TextInput';
import CheckboxRadio from '@weco/common/views/components/CheckboxRadio/CheckboxRadio';
// @ts-ignore
import SpacingComponent from '@weco/common/views/components/SpacingComponent/SpacingComponent';
// @ts-ignore
import SectionHeader from '@weco/common/views/components/SectionHeader/SectionHeader';

import { AccountCreated } from '../AccountManagement/AccountCreated';
import { AccountValidated } from '../AccountManagement/AccountValidated';
import { ErrorMessage } from '../Shared/ErrorMessage';

const logo = 'https://identity-public-assets-stage.s3.eu-west-1.amazonaws.com/images/wellcomecollections-150x50.png';
import styled from 'styled-components';

// At least 8 characters, one uppercase, one lowercase and number
const passwordPolicy = /(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*/;

const LogoContainer = styled.div`
   {
    display: flex;
    width: 200px;
  }
`;

export const Registration = () => {
  const [title, setTitle] = useState<string>();
  const [firstName, setFirstName] = useState<string>();
  const [lastName, setLastName] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [pass, setPass] = useState<string>();
  const [passCheck, setPassCheck] = useState<string>();
  const [consent, setConsent] = useState(false);
  const [valid, setValid] = useState<boolean | undefined | ''>(false);
  const [created, setCreated] = useState<boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [passQualifies, setPassQualifies] = useState(true);
  const [passMatch, setPassMatch] = useState(true);

  useEffect(() => {
    // check if email exists
    // setAlreadyExists(true);
  }, [email]);

  useEffect(() => {
    // check if password passes password policy
    pass && !passwordPolicy.test(pass || '') ? setPassQualifies(false) : setPassQualifies(true);
  }, [pass]);

  useEffect(() => {
    // check if password matches each other
    pass === passCheck ? setPassMatch(true) : setPassMatch(false);
  }, [passCheck]);

  useEffect(() => {
    setValid(
      title &&
        firstName &&
        lastName &&
        email &&
        passwordPolicy.test(pass || '') &&
        passwordPolicy.test(passCheck || '') &&
        pass === passCheck &&
        consent
    );
  }, [title, firstName, lastName, email, pass, passCheck, consent]);

  useEffect(() => {
    //determine if validated on mount
    // setValidated(true);
  }, []);

  const createAccount = () => {
    if (valid) setCreated(true);
    // Create account
  };
  return (
    <div>
      <LogoContainer>
        <img src={logo} alt="Wellcome Collection Logo" height="200px" />
      </LogoContainer>
      {validated ? (
        <AccountValidated />
      ) : created ? (
        <AccountCreated />
      ) : (
        <>
          <SpacingComponent />
          <h1 className="font-wb font-size-1">Register for Wellcome Collection</h1>
          <form>
            <SpacingComponent />
            <SectionHeader title="Personal details" />
            <TextInput
              placeholder=""
              required={true}
              aria-label="Title"
              label="Title"
              value={title}
              setValue={(value: string) => setTitle(value)}
            />
            <SpacingComponent />
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
            <SectionHeader title="Login details" />

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
              <></>
            )}
            <SpacingComponent />
            <TextInput
              required={true}
              aria-label="Retype password"
              label="Reype Password"
              value={passCheck}
              setValue={(value: string) => setPassCheck(value)}
              type="password"
              pattern={passwordPolicy}
            />
            {!passMatch ? <ErrorMessage>The passwords you have entered do not match</ErrorMessage> : <></>}
            <SpacingComponent />
            <CheckboxRadio
              type="checkbox"
              id="T&Cs"
              checked={consent}
              onChange={() => setConsent(!consent)}
              name="Terms and Conditions"
              value={''}
              // Need to update this component to accept more than just text
              text={`I have read and agreed to the ${(<a href="">Privacy and Terms</a>)} for Wellcome Collection.`}
            />
            <SpacingComponent />
            <SolidButton onClick={createAccount}>Create Account</SolidButton>
            <input type="submit" value="Submit" hidden={true} />
          </form>
        </>
      )}
    </div>
  );
};
