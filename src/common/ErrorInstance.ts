/**
 * Returns an error's message, converting non-Error values to ERROR instance or strings.
 *
 * @param error - The error value to convert.
 * @returns The error message or string representation of the value.
 */
export function errorInstance(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    return message;
}
