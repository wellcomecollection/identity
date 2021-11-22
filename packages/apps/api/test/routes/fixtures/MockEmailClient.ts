import { EmailClient } from '../../../src/utils/EmailClient';
import { successResponse } from '@weco/identity-common';

export default class MockEmailClient implements EmailClient {
  sendDeleteRequestAdmin = jest.fn().mockResolvedValue(successResponse({}));
  sendDeleteRequestUser = jest.fn().mockResolvedValue(successResponse({}));
}
