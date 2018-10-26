import {IToken, ISyntaxError} from "./tokenizer";
import SyntaxTree, {ISyntaxNode, SyntaxNodeType} from "./syntax-tree";
import {TokenType} from "./token-types";

export type IParsedTree = {
    readonly tree: SyntaxTree;
    readonly errors: ISyntaxError[];
}

type ParserSwitches = {
    // Function
    function: boolean;
    functionExpectingEnd: boolean;
    functionBody: boolean;

    // Function call
    functionCallExpectingEnd: boolean;
}

export default class Parser {
    private readonly tokens: IToken[];
    
    private tree: SyntaxTree;
    private index: number;
    private switches: ParserSwitches;

    public constructor(tokens: IToken[]) {
        this.tokens = tokens;
        this.tree = new SyntaxTree();

        this.switches = {
            // Function
            function: false,
            functionExpectingEnd: false,
            functionBody: false,

            // Function call
            functionCallExpectingEnd: false
        };

        this.index = 0;
    }

    public parse(): IParsedTree {
        // Reset
        this.tree = new SyntaxTree();

        const errors: ISyntaxError[] = [];

        for (this.index = 0; this.index < this.tokens.length; this.index++) {
            switch (this.$.type) {
                case TokenType.StringLiteralQuote: {
                    // TODO: Check if it's being assigned, or just ignore if it's not being performed any operation to.

                    break;
                }

                case TokenType.FunctionKeyword: {
                    if (this.switches.functionCallExpectingEnd) {
                        errors.push(this.createSyntaxError({
                            message: "Unexpected function declaration position"
                        }));
                    }
                    // Root-level function
                    else if (!this.switches.function && !this.switches.functionBody) {
                        this.switches.function = true;
                    }
                    // Nested function
                    else if (!this.switches.function && this.switches.functionBody) {
                        errors.push(this.createSyntaxError({
                            message: "Nested functions are not allowed"
                        }));
                    }
                    else {
                        errors.push(this.createSyntaxError({
                            message: "Expecting function definition"
                        }));
                    }

                    break;
                }

                case TokenType.Idenfitier: {
                    if (this.switches.function) {
                        this.tree.setChildAndNav(this.$.value as string, SyntaxTree.createEmptyNode(SyntaxNodeType.Function, this.$.value as string, this.index));
                        this.switches.functionExpectingEnd = true;
                    }
                    else if (this.next().type === TokenType.ParenthesesStart) {
                        this.tree.setChildAndNav(this.$.value as string, SyntaxTree.createEmptyNode(SyntaxNodeType.FunctionCall, this.$.value as string, this.index));
                        this.switches.functionCallExpectingEnd = true;
                        this.skip();
                    }
                    else {
                        // TODO: Use warnings for this
                        errors.push(this.createSyntaxError({
                            message: `Identifier '${this.$.value}' is redundant`
                        }));
                    }

                    break;
                }

                case TokenType.ParenthesesEnd: {
                    if (this.switches.functionCallExpectingEnd) {
                        this.switches.functionCallExpectingEnd = false;
                        this.tree.parent();

                        break;
                    }
                }

                case TokenType.BraceStart: {
                    if (this.switches.function && this.switches.functionExpectingEnd && !this.switches.functionBody) {
                        this.switches.functionBody = true;
                        this.switches.function = false;

                        break;
                    }
                }

                case TokenType.BraceEnd: {
                    if (this.switches.functionBody) {
                        this.switches.functionBody = false;
                        this.switches.functionExpectingEnd = false;
                        this.tree.parent();

                        break;
                    }
                }

                case TokenType.Comma: {
                    if (this.switches.functionCallExpectingEnd) {
                        this.tree.parent();
                    }
                }

                case TokenType.SemiColon: {
                    break;
                }

                // TODO: Expecting function identifier is repeated below
                case TokenType.NewLine: {
                    if (this.switches.function) {
                        errors.push(this.createSyntaxError({
                            message: "Expecting function identifier"
                        }));
                    }

                    break;
                }

                // TODO: Expecting function identifier is repeated above
                case TokenType.EndOfFile: {
                    if (this.switches.function) {
                        errors.push(this.createSyntaxError({
                            message: "Expecting function identifier"
                        }));
                    }
                    else if (this.switches.functionExpectingEnd) {
                        errors.push(this.createSyntaxError({
                            message: "Unterminated function"
                        }))
                    }
                    else if (this.switches.functionCallExpectingEnd) {
                        errors.push(this.createSyntaxError({
                            message: "Unterminated function call"
                        }));
                    }

                    break;
                }

                default: {
                    errors.push(this.createSyntaxError({
                        message: `Unexpected token type: ${this.$.type}`
                    }));
                }
            }
        }

        return {
            tree: this.tree,
            errors
        };
    }

    private next(): IToken {
        return this.tokens[this.index + 1];
    }

    private skip(amount: number = 1): this {
        this.index += amount;

        return this;
    }

    private get $(): IToken {
        return this.tokens[this.index];
    }

    private createSyntaxError(options: Partial<ISyntaxError>): ISyntaxError {
        if (!options.message) {
            throw new Error("[Tokenizer.createSyntaxError] Options must contain message");
        }

        return {
            // TODO:
            character: options.character || 0,
            line: options.line || 0,
            message: options.message,
            position: options.position || this.index
        };
    }
}