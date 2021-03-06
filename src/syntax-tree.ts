import {EventEmitter} from "events";
import {IDisposable} from "./structures";

export enum SyntaxTreeEvent {
    NodeChange = "nodeChange"
}

export enum SyntaxNodeType {
    Root,
    Function,
    FunctionCall,
    FunctionParameter,
    StringLiteral,
    NumberLiteral
}

export enum SpecialSyntaxNodes {
    Root = "$Root"
}

export type ISyntaxNodeValue = string | number | any | undefined;

export type ISyntaxNode = {
    readonly type: SyntaxNodeType;
    readonly name: SpecialSyntaxNodes | string;
    readonly position: number;

    value: ISyntaxNodeValue;
}

export default class SyntaxTree extends EventEmitter implements IDisposable {
    private readonly tree: ISyntaxNode;
    private readonly path: ISyntaxNode[];

    private currentNode: ISyntaxNode;
    private size: number;
    private rootParentCounter: number;

    public constructor() {
        super();

        this.tree = SyntaxTree.createEmptyNode(SyntaxNodeType.Root, SpecialSyntaxNodes.Root, -1);
        this.currentNode = this.tree;
        this.path = [this.currentNode];
        this.rootParentCounter = 0;
        this.size = 0;
    }

    public onRoot(): boolean {
        return this.currentNode.type === SyntaxNodeType.Root && this.currentNode.name === SpecialSyntaxNodes.Root;
    }

    public getParent(): ISyntaxNode {
        if (this.onRoot() || this.path.length - 2 < 0) {
            throw new RangeError("Cannot get parent of root node");
        }

        return this.path[this.path.length - 2];
    }

    public hasChild(name: string): boolean {
        return typeof this.currentNode.value === "object" && Object.keys(this.currentNode.value).includes(name);
    }

    public hasValue(): boolean {
        return (typeof this.currentNode.value === "object" && Object.keys(this.currentNode.value).length > 0) || this.currentNode.value === undefined;
    }

    public setValue(value: ISyntaxNodeValue): this {
        if (typeof value !== "object" && typeof value !== "string" && typeof value !== "number") {
            throw new Error("An invalid value type was provided; Expecting either object, string, or number");
        }

        this.currentNode.value = value;

        if (typeof value === "object") {
            this.size++;
        }

        return this;
    }

    public getChild(name: string): ISyntaxNode {
        if (!this.hasChild(name)) {
            throw new Error(`Current node does not have '${name}' as a child`);
        }

        return this.currentNode.value[name];
    }

    public parent(): this {
        this.currentNode = this.getParent();
        this.emit(SyntaxTreeEvent.NodeChange, this.currentNode);
        this.removeLastPath();

        return this;
    }

    public lastNodeOnParent(): boolean {
        if (this.getCurrent().name === SpecialSyntaxNodes.Root) {
            throw new Error("[SyntaxTree.lastNodeOnParent] Cannot determine last node on the parent node");
        }

        const parent: ISyntaxNode = this.getParent();

        if (!SyntaxTree.isTree(parent)) {
            throw new Error("[SyntaxTree.nextNode] Cannot get next node since parent is not a tree");
        }

        const keys: string[] = Object.keys(parent.value);

        if (keys.indexOf(this.getCurrent().name) + 1 >= keys.length) {
            return true;
        }

        return false;
    }

    public cycleParent(): this {
        if (!this.onRoot() && !this.parentIsRoot() && this.lastNodeOnParent()) {
            this.parent().parent();
        }

        return this;
    }

    public parentIsRoot(): boolean {
        if (this.onRoot()) {
            throw new Error("[SyntaxTree.parentIsRoot] Cannot determine if parent is root node on the root node");
        }

        const parent: ISyntaxNode = this.getParent();

        return parent.name === SpecialSyntaxNodes.Root && parent.type === SyntaxNodeType.Root;
    }

    public tryParent(): this {
        if (!this.onRoot()) {
            this.parent();
        }

        return this;
    }

    public child(name: string): this {
        this.currentNode = this.getChild(name);
        this.emit(SyntaxTreeEvent.NodeChange, this.currentNode);
        this.pushNewPath();

        return this;
    }

    public getChildren(): ISyntaxNode[] {
        return SyntaxTree.getChildren(this.currentNode);
    }

    public getSize(): number {
        return this.size;
    }

    public setChild(name: string, node: ISyntaxNode): this {
        if (this.hasChild(name)) {
            throw new Error(`Child with name '${name}' already exists`);
        }
        else if (!this.isTree()) {
            throw new Error(`Cannot set child '${name}' when value is not a tree`);
        }

        this.currentNode.value[name] = node;
        this.size++;

        return this;
    }

    public setChildAndNav(name: string, node: ISyntaxNode): this {
        this.setChild(name, node);
        this.child(name);

        return this;
    }

    public getTree(): ISyntaxNode {
        return this.tree;
    }

    public getCurrent(): ISyntaxNode {
        return this.currentNode;
    }

    public dispose(): void {
        //
    }

    private removeLastPath(): this {
        this.path.pop();

        return this;
    }

    private pushNewPath(): this {
        this.path.push(this.currentNode);

        return this;
    }

    private isTree(): boolean {
        return SyntaxTree.isTree(this.currentNode);
    }

    public static createEmptyNode(type: SyntaxNodeType, name: string, position: number): ISyntaxNode {
        return {
            type,
            name,
            position,
            value: {}
        };
    }

    public static getChildren(node: ISyntaxNode): ISyntaxNode[] {
        if (!SyntaxTree.isTree(node)) {
            throw new Error("Cannot get children when value is not a tree");
        }

        const children: ISyntaxNode[] = [];
        const keys: string[] = Object.keys(node.value);

        for (let i: number = 0; i < keys.length; i++) {
            children.push(node.value[keys[i]]);
        }

        return children;
    }

    public static isTree(node: ISyntaxNode): boolean {
        return typeof node.value === "object";
    }
}
