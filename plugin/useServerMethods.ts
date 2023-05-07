import { getCurrentInstance } from "vue"

export const useServerMethods = () => {
    const inst = getCurrentInstance()
    const opts = inst?.type
    return (opts as any).serverMethods
}