import {IToken, ISyntaxError} from "./tokenizer";
import SyntaxTree, {ISyntaxNode, SyntaxNodeType} from "./syntax-tree";
import {TokenType} from "./token-types";

export type IParsedTree = {
    readonly tree: SyntaxTree;
    readonly errors: ISyntaxError[];
}

export default class Parser {
    private readonly tokens: IToken[];

    private tree: SyntaxTree;
    private index: number;
    private expecting: SyntaxNodeType[];
    private errors: ISyntaxError[];

    public constructor(tokens: IToken[]) {
        this.tokens = tokens;
        this.tree = new SyntaxTree();
        this.expecting = [];
        this.errors = [];
        this.index = 0;
    }

    public parse(): IParsedTree {
        // Reset
        this.tree = new SyntaxTree();
        this.expecting = [];
        this.errors = [];

        for (this.index = 0; this.index < this.tokens.length; this.index++) {
            switch (this.$.type) {
                case TokenType.StringLiteralQuote: {
                    // TODO: Check if it's being assigned, or just ignore if it's not being performed any operation to.

                    break;
                }

                case TokenType.FunctionKeyword: {
                    

                    break;
                }

                case TokenType.Idenfitier: {
                    

                    break;
                }

                case TokenType.ParenthesesEnd: {
                    
                }

                case TokenType.BraceStart: {
                    
                }

                case TokenType.BraceEnd: {
                    
                }

                case TokenType.Comma: {
                    
                }

                case TokenType.SemiColon: {
                    break;
                }

                // TODO: Expecting function identifier is repeated below
                case TokenType.NewLine: {
                    

                    break;
                }

                // TODO: Expecting function identifier is repeated above
                case TokenType.EndOfFile: {
                    

                    break;
                }

                default: {
                    this.appendError({
                        message: `Unexpected token type: ${this.$.type}`
                    });
                }
            }
        }

        return {
            tree: this.tree,
            errors: this.errors
        };
    }

    private next(): IToken {
        return this.tokens[this.index + 1];
    }

    private nextNotNewLine(): IToken {
        let counter: number = 0;

        while (counter < this.tokens.length) {
            if (this.tokens[counter].type === TokenType.NewLine) {
                continue;
            }

            return this.tokens[counter];
        }

        return this.tokens[this.tokens.length - 1];
    }

    private skip(amount: number = 1): this {
        this.index += amount;

        return this;
    }

    private get $(): IToken {
        return this.tokens[this.index];
    }

    private appendError(options: Partial<ISyntaxError>): this {
        if (!options.message) {
            throw new Error("[Tokenizer.createSyntaxError] Options must contain message");
        }

        this.errors.push({
            // TODO:
            character: options.character || 0,
            line: options.line || 0,
            message: options.message,
            position: options.position || this.index
        });

        return this;
    }
}