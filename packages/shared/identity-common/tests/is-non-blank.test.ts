import {isNonBlank} from '../src';

describe('is-non-blank', () => {
    it('should return false for empty strings', () => {
        expect(isNonBlank('')).toBe(false);
    });

    it('should return false for whitespace', () => {
        expect(isNonBlank("\t ")).toBe(false);
    });
});
