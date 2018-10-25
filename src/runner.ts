#!/usr/bin/env node

import fs from "fs";
import Lexer from "./lexer";
import NodeTree from "./node-tree";
import Interpreter from "./interpreter";

const args: string[] = [...process.argv];

args.splice(0, 2);

const targetFile: string = args[0];

if (!fs.existsSync(targetFile)) {
    console.log("No such file");
    process.exit();
}

console.log(targetFile);

const code: string = fs.readFileSync(targetFile).toString();
const lexer: Lexer = new Lexer(code);
const tree: NodeTree = lexer.lex();

console.log(`\nInterpreting ${tree.getSize()} nodes ...\n`);

const interpreter: Interpreter = new Interpreter(tree);

interpreter.interpret();
