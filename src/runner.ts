#!/usr/bin/env node

import fs from "fs";
import Tokenizer, {ITokenizeResult} from "./tokenizer";
import Parser, {IParsedTree} from "./parser";

const args: string[] = [...process.argv];

args.splice(0, 2);

const targetFile: string = args[0];

if (!fs.existsSync(targetFile)) {
    console.log("No such file");
    process.exit();
}

const code: string = fs.readFileSync(targetFile).toString();
const tokenizer = new Tokenizer(code);
const tokenizeResult: ITokenizeResult = tokenizer.tokenize();

if (tokenizeResult.errors.length > 0) {
    console.log(tokenizeResult.errors);

    process.exit(1);
}

const parser: Parser = new Parser(tokenizeResult.tokens);
const parsedTree: IParsedTree = parser.parse();

if (parsedTree.errors.length > 0) {
    console.log(parsedTree.errors);

    process.exit(1);
}

console.log(JSON.stringify(parsedTree.tree.getTree()));