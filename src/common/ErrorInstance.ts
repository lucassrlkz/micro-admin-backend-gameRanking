export function errorInstance(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    return message;
}
