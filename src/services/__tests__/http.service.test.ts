import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FetchHttpClient } from '../http.service';

describe('FetchHttpClient', () => {
  let httpClient: FetchHttpClient;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = mockFetch;
    httpClient = new FetchHttpClient();
  });

  describe('#get', () => {
    const testUrl = 'https://api.example.com/data';
    const mockData = { id: 1, name: 'test' };

    it('should successfully fetch and return data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await httpClient.get<typeof mockData>(testUrl);

      expect(mockFetch).toHaveBeenCalledWith(testUrl);
      expect(result).toEqual(mockData);
    });

    it('should throw error when response is not ok', async () => {
      const errorStatus = 404;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
      });

      await expect(httpClient.get(testUrl)).rejects.toThrow(
        `HTTP error! Status: ${errorStatus}`
      );
    });
  });

  describe('#post', () => {
    const testUrl = 'https://api.example.com/data';
    const testData = { name: 'test' };
    const mockResponse = { id: 1, ...testData };

    it('should successfully post data and return response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await httpClient.post<typeof mockResponse>(
        testUrl,
        testData
      );

      expect(mockFetch).toHaveBeenCalledWith(testUrl, {
        method: 'POST',
        body: JSON.stringify(testData),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when response is not ok', async () => {
      const errorStatus = 500;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
      });

      await expect(httpClient.post(testUrl, testData)).rejects.toThrow(
        `HTTP error! Status: ${errorStatus}`
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(httpClient.post(testUrl, testData)).rejects.toThrow(
        networkError
      );
    });
  });
});
