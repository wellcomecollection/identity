import { EmailClient } from '../../../src/utils/EmailClient';
import { successResponse } from '@weco/identity-common';

export default class MockEmailClient implements EmailClient {
  sendDeleteRemovalUser = jest.fn().mockResolvedValue(successResponse({}));
  sendDeleteRequestAdmin = jest.fn().mockResolvedValue(successResponse({}));
  sendDeleteRequestUser = jest.fn().mockResolvedValue(successResponse({}));
}
