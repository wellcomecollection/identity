import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { paginatedSierraResults } from '../src/pagination';

const docsUrl = 'http://test.test/docs';
const paginatedServer = setupServer();
const createDocsHandler = ({ nDocs }: { nDocs: number }) => {
  const allDocs = Array.from({ length: nDocs }).map((_, i) => ({
    id: 1000000 + i,
  }));
  return rest.get(docsUrl, (req, res, ctx) => {
    const limitParam = req.url.searchParams.get('limit');
    const idParam = req.url.searchParams.get('id');

    const limit = limitParam ? Number(limitParam) : 50;
    const id = Number(idParam && /\[(\d+),\]/.exec(idParam)?.[1]);
    const startIndex = id ? allDocs.findIndex((doc) => doc.id === id) : 0;

    if (startIndex >= allDocs.length || startIndex === -1) {
      return res(ctx.status(404));
    }

    return res(
      ctx.json({
        total: Math.min(limit, nDocs),
        start: startIndex,
        entries: allDocs.slice(startIndex, startIndex + limit),
      })
    );
  });
};

describe('pagination', () => {
  beforeAll(() => paginatedServer.listen());
  afterAll(() => paginatedServer.close());

  it('fetches all entries from multiple pages', async () => {
    const nDocs = 213;
    const countRequests = jest.fn();
    paginatedServer.use(createDocsHandler({ nDocs }));
    paginatedServer.events.on('request:start', countRequests);

    const docs = await paginatedSierraResults<{ id: number }>({
      url: docsUrl,
      method: 'GET',
    });

    expect(docs.length).toBe(nDocs);
    // Make sure all docs are distinct
    expect(new Set(docs.map(({ id }) => id)).size).toBe(nDocs);
    expect(countRequests).toHaveBeenCalledTimes(Math.ceil(nDocs / 50.0));
  });

  it('just performs one fetch for pages smaller than the limit', async () => {
    const nDocs = 15;
    const countRequests = jest.fn();
    paginatedServer.use(createDocsHandler({ nDocs }));
    paginatedServer.events.on('request:start', countRequests);

    const docs = await paginatedSierraResults<{ id: number }>({
      url: docsUrl,
      method: 'GET',
    });

    expect(docs.length).toBe(nDocs);
    expect(countRequests).toHaveBeenCalledTimes(1);
  });

  it('performs an extra fetch and handles the 404 for pages at the limit', async () => {
    const nDocs = 50;
    const countRequests = jest.fn();
    paginatedServer.use(createDocsHandler({ nDocs }));
    paginatedServer.events.on('request:start', countRequests);

    const docs = await paginatedSierraResults<{ id: number }>({
      url: docsUrl,
      method: 'GET',
    });

    expect(docs.length).toBe(nDocs);
    expect(countRequests).toHaveBeenCalledTimes(2);
  });

  it('does not overwrite params from the original request', async () => {
    paginatedServer.use(createDocsHandler({ nDocs: 25 }));
    const captureRequest = jest.fn();
    paginatedServer.events.on('request:start', captureRequest);

    await paginatedSierraResults<{ id: number }>({
      url: docsUrl,
      method: 'GET',
      params: {
        beep: 'boop',
      },
    });

    const req = captureRequest.mock.calls[0][0];
    expect(req.url.searchParams.get('beep')).toBe('boop');
  });
});
