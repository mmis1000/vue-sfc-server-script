import { ComponentOptions } from "vue";
import { ACTION_PREFIX, getId } from "./server-function-utils";

export default (Comp: ComponentOptions, id: string, items: [string, Function][]) => {
    const serverMethods: { [name: string]: Function } = {}
    const serverPaths: { [name: string]: string } = {}

    for (const [name] of items) {
        const actionId = getId(id, name)
        serverMethods[name] = (args: any) => {
            console.log(name)
            if (args instanceof FormData) {
                return fetch(ACTION_PREFIX + actionId, {
                    body: args,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    method: "post",
                }).then((res) => {
                    return res.json()
                })
            } else {
                return fetch(ACTION_PREFIX + actionId, {
                    body: JSON.stringify(args),
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: "post",
                }).then((res) => {
                    return res.json()
                })
            }
        }

        serverPaths[name] = ACTION_PREFIX + actionId
    }

    Comp.computed = Comp.computed ?? {}
    Comp.computed.$actions = () => serverPaths

    Comp.serverMethods = serverMethods
}