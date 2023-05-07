import hash from 'hash-it';
export const ACTION_PREFIX = "/_actions/"
export const getId = (fileName: string, name: string) => {
    return hash([fileName, name]).toString(36)
}
export class RedirectError extends Error {
    name = 'RedirectError'
    url: string
    constructor (url: string) {
        super('Redirected to ' + url)
        this.url = url
    }
}
export function redirect(url: string) {
    throw new RedirectError(url)
}