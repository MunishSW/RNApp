import { classifyApiError } from '../apiErrors';

function failure(status: number, data?: unknown) {
  return { response: { status, data } };
}

describe('classifyApiError', () => {
  // Covers: BRD 8.4.4, FR-4.4-09, N-01 - network and timeout failures are retryable
  it('classifies a failure with no response as Network and retryable', () => {
    expect(classifyApiError(new Error('Network Error'))).toEqual({
      errorCategory: 'Network',
      retryable: true,
    });
    expect(classifyApiError({ code: 'ECONNABORTED' })).toEqual({
      errorCategory: 'Network',
      retryable: true,
    });
    expect(classifyApiError(undefined).errorCategory).toBe('Network');
  });

  // Covers: BRD 8.4.3, 8.4.4 - 401 and 400-with-auth-code are Auth and not retryable
  it('classifies HTTP 401 and HTTP 400 with an auth code as Auth', () => {
    expect(classifyApiError(failure(401))).toEqual({
      status: 401,
      errorCategory: 'Auth',
      retryable: false,
    });
    expect(classifyApiError(failure(400, { statusCode: '401' })).errorCategory).toBe('Auth');
    expect(classifyApiError(failure(400, { statusCode: 'API_3000' })).errorCategory).toBe('Auth');
    expect(
      classifyApiError(failure(400, { returnStatus: { returnCode: 'API_3000' } })).errorCategory,
    ).toBe('Auth');
  });

  // Covers: BRD 8.4.4, N-02 - 429 and 5xx are Server and retryable
  it('classifies 429 and 5xx as Server and retryable', () => {
    [429, 500, 503].forEach(status => {
      expect(classifyApiError(failure(status))).toEqual({
        status,
        errorCategory: 'Server',
        retryable: true,
      });
    });
  });

  // Covers: BRD 8.4.4 - other 4xx are Validation and not retryable
  it('classifies other 4xx as Validation and not retryable', () => {
    expect(classifyApiError(failure(400, { message: 'bad' }))).toEqual({
      status: 400,
      errorCategory: 'Validation',
      retryable: false,
    });
    expect(classifyApiError(failure(404)).retryable).toBe(false);
  });
});
