import { ComponentOptions } from "vue";
import { getId } from "./server-function-utils";

export const handlers: { [k: string]: Function } = {}

export default (Comp: ComponentOptions, id: string, items: [string, Function][]) => {
    for (const [name, handler] of items) {
        handlers[getId(id, name)] = Object.assign(handler, {
            exportSource: id,
            exportName: name
        })
    }
}
