
import { PluginOption, defineConfig } from "vite";
import { ResolvedConfig } from "vite";
import { simple } from "acorn-walk";
import { generate } from 'escodegen'
import path, { resolve } from 'path'
import { globSync } from "glob";

export const Plugin: (env: 'client' | 'server') => PluginOption = (env: 'client' | 'server') => {
    const SERVER_FUNCTION_FILE_ID = 'virtual:server-function'
    const SERVER_SFC_LIST = 'virtual:sfc-list'
    let resolvedConfig: ResolvedConfig;
    return {
        name: "server-function:" + env,
        resolveId(id) {
          if (id === SERVER_FUNCTION_FILE_ID) {
            return resolve(__dirname, `./server-function.${env}.ts`)
          }
          if (id === SERVER_SFC_LIST) {
            return '\0' + SERVER_SFC_LIST
          }
        },
        configResolved(config) {
            resolvedConfig = config;
        },
        transform(code, id) {
            if (id.startsWith(resolvedConfig.root)) {
                const trimmed = id.slice(resolvedConfig.root.length);
                if (id.includes("type=script:server")) {
                    const parsed = this.parse(code);
                    const names: string[] = [];
                    simple(parsed, {
                        ExportNamedDeclaration(node) {
                            for (const item of (node as any).declaration
                                .declarations as Node[]) {
                                if ((item as any).id.type === "Identifier") {
                                    names.push((item as any).id.name);
                                    // console.log((item as any).id.name)
                                }
                            }
                        },
                    });
                    const importDecl = {
                        "type": "ImportDeclaration",
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "local": {
                                    "type": "Identifier",
                                    "name": "registerServerFunction"
                                }
                            }
                        ],
                        "source": {
                            "type": "Literal",
                            "value": SERVER_FUNCTION_FILE_ID,
                        }
                    };
                    const exportDecl = {
                        type: "ExportDefaultDeclaration",
                        declaration: {
                            type: "ArrowFunctionExpression",
                            params: [
                                {
                                    type: "Identifier",
                                    name: "Comp",
                                },
                            ],
                            body: {
                                type: "BlockStatement",
                                body: [
                                    {
                                        type: "ExpressionStatement",
                                        expression: {
                                            type: "CallExpression",
                                            callee: {
                                                type: "Identifier",
                                                name: "registerServerFunction",
                                            },
                                            arguments: [
                                                {
                                                    type: "Identifier",
                                                    name: "Comp",
                                                },
                                                {
                                                    type: "Literal",
                                                    value: trimmed,
                                                },
                                                {
                                                    type: "ArrayExpression",
                                                    elements: names.map(name => ({
                                                        type: "ArrayExpression",
                                                        elements: [
                                                            {
                                                                type: "Literal",
                                                                value: name,
                                                            },
                                                            {
                                                                type: "Identifier",
                                                                name,
                                                            },
                                                        ]
                                                    })),
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    };
                    (parsed as any).body.unshift(importDecl);
                    (parsed as any).body.push(exportDecl);
                    if (env === 'server') {
                        return generate(parsed)
                    } else {
                        return generate({
                            "type": "Program",
                            "body": [
                                ...names.map(name => ({
                                    "type": "ExportNamedDeclaration",
                                    "declaration": {
                                      "type": "VariableDeclaration",
                                      "declarations": [
                                        {
                                          "type": "VariableDeclarator",
                                          "id": {
                                            "type": "Identifier",
                                            name
                                          },
                                          "init": {
                                            "type": "Literal",
                                            "value": null,
                                          }
                                        }
                                      ],
                                      "kind": "const"
                                    },
                                    "specifiers": [],
                                    "source": null
                                  }
                                )),
                                importDecl,
                                exportDecl
                            ]
                        })
                    }
                    // return this
                    // console.log(trimmed, parsed)
                }
            }
        },
        load(id) {
            if (id === '\0' + SERVER_SFC_LIST) {
                const names = globSync('**/*.vue', {
                    root: path.resolve(__dirname, '../'),
                    ignore: 'node_modules/**'
                })
                const paths = names.map(name => {
                    return path.resolve(__dirname, '../', name)
                })
                console.log(paths)
                
                return paths.map(i => `import ${JSON.stringify(i)}`).join('\n')
            }
        }
    };
};
