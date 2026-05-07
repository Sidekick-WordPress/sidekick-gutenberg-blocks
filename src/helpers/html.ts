export const normalizeHtmlId = (value?: string): string => {
    return (value || '')
        .trim()
        .replace(/^#+/, '')
        .replace(/\s+/g, '-')
        .replace(/[^A-Za-z0-9\-_.:]/g, '-')
        .replace(/^-+|-+$/g, '');
};
