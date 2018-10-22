import {IDisposable} from "./structures";
import NodeTree from "./node-tree";

export default class Lexer implements IDisposable {
    private readonly code: string;

    private pos: number;
    private tree: NodeTree;
    private buffer: string;

    public constructor(code: string) {
        this.code = code;
        this.pos = 0;
        this.buffer = "";
        this.tree = new NodeTree();
    }

    public lex(): NodeTree {
        this.tree = new NodeTree();
        this.buffer = "";

        for (this.pos = 0; this.pos < this.code.length; this.pos++) {
            if (this.$ === "\"" && !this.buffer) {
                this.append();
            }
            else {
                this.unexpected()
            }
        }

        return this.tree;
    }

    private get at(): string {
        return this.pos.toString();
    }

    private unexpected(char: string = this.$, at: string = this.at): void {
        throw new Error();
    }

    private append(): this {
        this.buffer += this.$;

        return this;
    }

    private get $(): string {
        return this.code[this.pos];
    }

    public dispose(): this {
        // TODO

        return this;
    }
}