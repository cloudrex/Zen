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
                this.unexpected();
            }
        }

        return this.tree;
    }

    private unexpected(char: string = this.$, at: number = this.pos): void {
        throw new Error(`Unexpected character '${char}' at position ${at}`);
    }

    private expecting(char: string, at: number = this.pos): void {
        throw new Error(`Expecting character '${char}' at position ${at}`);
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
