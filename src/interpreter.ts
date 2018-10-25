import {IDisposable} from "./structures";
import NodeTree, {INodeValue, ITreeNode, NodeType} from "./node-tree";

export type IMethodHandler = (args: any) => void;

export default class Interpreter implements IDisposable {
    private readonly tree: NodeTree;
    private readonly internalMethods: Map<string, IMethodHandler>;

    public constructor(tree: NodeTree) {
        this.tree = tree;
        this.internalMethods = new Map();

        // Setup
        this.setupInternalMethods();
    }

    private setupInternalMethods(): void {
        this.internalMethods.set("out", (args: string[]) => {
            console.log(...args);
        });

        this.internalMethods.set("add", (args: string[]) => {
            // TODO: Should be automated
            if (args.length !== 2) {
                throw new Error("Method 'add' expects 2 parameters");
            }

            const num1: number = parseInt(args[0]);
            const num2: number = parseInt(args[1]);

            if (isNaN(num1) || isNaN(num2)) {
                throw new Error("Method 'add' expects 2 numbers");
            }

            console.log(num1 + num2);
        });

        this.internalMethods.set("mult", (args: string[]) => {
            // TODO: Should be automated
            if (args.length !== 2) {
                throw new Error("Method 'mult' expects 2 parameters");
            }

            const num1: number = parseInt(args[0]);
            const num2: number = parseInt(args[1]);

            if (isNaN(num1) || isNaN(num2)) {
                throw new Error("Method 'mult' expects 2 numbers");
            }

            console.log(num1 * num2);
        });

        this.internalMethods.set("subs", (args: string[]) => {
            // TODO: Should be automated
            if (args.length !== 2) {
                throw new Error("Method 'subs' expects 2 parameters");
            }

            const num1: number = parseInt(args[0]);
            const num2: number = parseInt(args[1]);

            if (isNaN(num1) || isNaN(num2)) {
                throw new Error("Method 'subs' expects 2 numbers");
            }

            console.log(num1 - num2);
        });

        this.internalMethods.set("div", (args: string[]) => {
            // TODO: Should be automated
            if (args.length !== 2) {
                throw new Error("Method 'div' expects 2 parameters");
            }

            const num1: number = parseInt(args[0]);
            const num2: number = parseInt(args[1]);

            if (isNaN(num1) || isNaN(num2)) {
                throw new Error("Method 'div' expects 2 numbers");
            }

            console.log(num1 / num2);
        });

        this.internalMethods.set("pow", (args: string[]) => {
            // TODO: Should be automated
            if (args.length !== 2) {
                throw new Error("Method 'pow' expects 2 parameters");
            }

            const num1: number = parseInt(args[0]);
            const num2: number = parseInt(args[1]);

            if (isNaN(num1) || isNaN(num2)) {
                throw new Error("Method 'pow' expects 2 numbers");
            }

            console.log(num1 ** num2);
        });
    }

    public interpret(): void {
        let queue: ITreeNode[] = this.tree.getChildren();
        let rootSeen: boolean = false;

        for (let i = 0; i < queue.length; i++) {
            const node: ITreeNode = queue[i];

            /* if (NodeTree.isTree(node)) {
                this.tree.child(Object.keys(this.tree.getCurrent().value)[i]).getChildren().forEach((child: ITreeNode) => {
                    queue.push(child);
                });

                this.tree.parent();
            } */

            switch (node.type) {
                case NodeType.Root: {
                    if (rootSeen) {
                        throw new Error("Program cannot have multiple root nodes");
                    }

                    rootSeen = true;

                    break;
                }

                case NodeType.StringLiteral: {
                    //

                    break;
                }

                case NodeType.MethodCall: {
                    const methodName: string = Interpreter.getMethodName(node.name);

                    if (!this.internalMethods.has(methodName)) {
                        throw new Error(`Method '${methodName}' is not defined`);
                    }

                    (this.internalMethods.get(methodName) as IMethodHandler)(Interpreter.getMethodCallArgs(node));

                    break;
                }

                default: {
                    throw new Error(`Unable to process unknown node type: ${node.type}`);
                }
            }
        }
    }

    private static getMethodCallArgs(value: INodeValue): string[] {
        if (typeof value !== "object") {
            throw new Error("Cannot obtain method call args because value is not a tree");
        }

        return NodeTree.getChildren(value).map((child: ITreeNode) => {
            // TODO: Make sure arguments are always literal value
            return child.value.toString();
        });
    }

    private static getMethodName(nodeName: string): string {
        return nodeName.split(":")[0];
    }

    public dispose(): void {
        //
    }
}
