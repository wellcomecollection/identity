import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

type HasId = { id: number };

type SierraResultSet<Entry extends HasId> = {
  total?: number;
  start?: number;
  entries: Entry[];
};

const pageLimit = 50;

export const paginatedSierraResults = async <Entry extends HasId>(
  config: AxiosRequestConfig,
  axiosInstance: AxiosInstance = axios
): Promise<Entry[]> => {
  const getResults = async (
    lastId?: number,
    currentEntries: Entry[] = []
  ): Promise<Entry[]> => {
    const response = await axiosInstance.request<SierraResultSet<Entry>>({
      ...config,
      validateStatus: (status: number) =>
        config.validateStatus?.(status) ||
        axiosInstance.defaults.validateStatus?.(status) ||
        status === 404, // Sierra returns 404s for empty lists, so we always allow this
      params: {
        ...(config.params ?? {}),
        limit: pageLimit,
        id: typeof lastId !== 'undefined' ? `[${lastId + 1},]` : undefined,
      },
    });

    const entries = response.status === 404 ? [] : response.data.entries;
    if (entries.length >= pageLimit) {
      const lastId = entries[entries.length - 1].id
      return getResults(lastId, [
        ...currentEntries,
        ...entries,
      ]);
    } else {
      return [...currentEntries, ...entries];
    }
  };
  return getResults();
};
