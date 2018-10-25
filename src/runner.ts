#!/usr/bin/env node

import fs from "fs";
import Tokenizer from "./tokenizer";

const args: string[] = [...process.argv];

args.splice(0, 2);

const targetFile: string = args[0];

if (!fs.existsSync(targetFile)) {
    console.log("No such file");
    process.exit();
}

console.log(targetFile);

const code: string = fs.readFileSync(targetFile).toString();
const tokenizer = new Tokenizer(code);

console.log(tokenizer.tokenize());