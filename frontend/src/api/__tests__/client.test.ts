import { describe, it, expect } from 'vitest';
import { generateUUID, apiClient } from '../client';

describe('API Client & Idempotency', () => {
  it('generates valid RFC-compliant UUIDv4 strings', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();

    expect(uuid1).toBeDefined();
    expect(uuid2).toBeDefined();
    expect(uuid1).not.toBe(uuid2);

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuid1).toMatch(uuidRegex);
    expect(uuid2).toMatch(uuidRegex);
  });

  it('configures base API URL and content type', () => {
    expect(apiClient.defaults.baseURL).toBe('/api');
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});

