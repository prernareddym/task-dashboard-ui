/** @jest-environment node */
import { api, ApiError, configureClient } from './client';

const fetchMock = jest.fn();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
  configureClient({ getToken: () => 'abc', onUnauthorized: jest.fn() });
});

describe('api client', () => {
  it('sends the bearer token and omits empty query params', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 8 }));

    await api.listTasks({ status: 'DONE', q: '', page: 2, size: 8 });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/tasks?status=DONE&page=2&size=8');
    expect((init.headers as Headers).get('Authorization')).toBe('Bearer abc');
  });

  it('does not send the token on login', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ accessToken: 'x' }));

    await api.login('a@b.co', 'secret');

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Headers).has('Authorization')).toBe(false);
    expect((init.headers as Headers).get('Content-Type')).toBe('application/json');
  });

  it('throws ApiError with the problem detail and field errors', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: 'Validation failed', errors: { title: 'must not be blank' } }, 400));

    const error = await api.createTask({ title: '' }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Validation failed');
    expect(error.fieldErrors).toEqual({ title: 'must not be blank' });
  });

  it('calls the unauthorized handler on 401 for authenticated requests only', async () => {
    const onUnauthorized = jest.fn();
    configureClient({ getToken: () => 'abc', onUnauthorized });
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    await expect(api.summary()).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);

    await expect(api.login('a@b.co', 'bad')).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('returns undefined for 204 responses', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(api.deleteTask(5)).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
  });
});
