import { describe, expect, it } from 'vitest';
import { parseChatResult } from '../index';
import { PRESS_FIXTURES, PRESS_INTENT } from './press-fixtures';

describe('press-speaking-other fixtures', () => {
  it.each(PRESS_FIXTURES)('$name preserves the intent and ready contract', (fixture) => {
    const result = parseChatResult(fixture.raw, PRESS_INTENT, fixture.locale);

    expect(result.intent).toBe(PRESS_INTENT);
    expect(result.readyForContact).toBe(fixture.readyForContact);
    expect(result.classification).toBe('genuine');
    expect(result.reply).not.toContain('"readyForContact"');
    expect(result.summary).not.toMatch(/@|\b\d{3}[-ー－]\d{4}\b/);
    expect(result.structuredLead?.purpose).toBeTruthy();
  });
});
