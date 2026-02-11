// ==========================================
// CODE EXECUTION VISUALIZER (Day 6 — Universal)
// ==========================================
// Lightweight educational interpreter for Java & C++.
// Produces a step-by-step execution trace from code.
//
// Supports:
//   - int variables, for loops, while loops
//   - if / else / else-if (single comparison)
//   - int arrays (Java: int[], C++: vector<int>)
//   - array.length / .size()
//   - basic arithmetic (+, -, *, /, %)
//   - Auto-detection of language & entry function
//   - Auto test-case generation for function params
//
// Does NOT support:
//   - recursion, classes, STL (except vector)
//   - logical AND/OR (&&, ||)
//   - strings, floats, user input
// ==========================================


// ============ LANGUAGE DETECTION ============

/**
 * Detect whether code is Java, C++, or unsupported.
 * @param {string} code
 * @returns {"java"|"cpp"|"unsupported"}
 */
export function detectLanguage(code) {
    const javaIndicators = [
        /public\s+class\b/,
        /static\s+void\s+main/,
        /System\.out/,
        /int\[\]/,
        /boolean\[\]/,
        /String\[\]/,
    ];
    const cppIndicators = [
        /#include/,
        /using\s+namespace\s+std/,
        /vector\s*</,
        /\bcout\b/,
        /\bstd::/,
    ];

    const javaScore = javaIndicators.filter(r => r.test(code)).length;
    const cppScore = cppIndicators.filter(r => r.test(code)).length;

    if (cppScore > 0 && cppScore >= javaScore) return "cpp";
    if (javaScore > 0) return "java";

    // Fallback heuristics for generic snippets (no strong indicators)
    if (/\bint\b/.test(code) && /\bfor\s*\(/.test(code)) {
        // Could be either; default to Java since int[] is more common in user base
        return "java";
    }

    return "unsupported";
}


// ============ FUNCTION DETECTION ============

/**
 * Detect the entry function in a snippet.
 * @param {string} code
 * @param {"java"|"cpp"} lang
 * @returns {{ name: string, parameters: Array<{name: string, type: string}> } | null}
 */
export function detectEntryFunction(code, lang) {
    const lines = code.split("\n");

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip main()
        if (/\bmain\s*\(/.test(trimmed)) continue;

        let match = null;

        if (lang === "java") {
            // Java method: optional (public|private|static) + return_type + name(params)
            match = trimmed.match(
                /^(?:public\s+|private\s+|protected\s+|static\s+)*(?:int|long|boolean|void|String)\s+(\w+)\s*\(([^)]*)\)\s*\{?\s*$/
            );
        } else {
            // C++ function: return_type + name(params)
            match = trimmed.match(
                /^(?:int|long|bool|void|string)\s+(\w+)\s*\(([^)]*)\)\s*\{?\s*$/
            );
        }

        if (match) {
            const name = match[1];
            const paramStr = match[2].trim();

            // Skip constructors (name same as class)
            if (/^[A-Z]/.test(name) && lang === "java") continue;

            const parameters = parseParameters(paramStr, lang);
            return { name, parameters };
        }
    }

    return null;
}

/**
 * Parse a comma-separated parameter list into typed objects.
 */
function parseParameters(paramStr, lang) {
    if (!paramStr) return [];

    return paramStr.split(",").map(p => {
        p = p.trim();
        // Remove reference/pointer markers for C++
        p = p.replace(/&/g, "").trim();

        // Java: int[] arr
        let m = p.match(/^(int\[\]|long\[\]|boolean\[\]|String\[\]|String|int|long|boolean)\s+(\w+)$/);
        if (m) return { type: m[1], name: m[2] };

        // C++: vector<int> arr
        m = p.match(/^(vector\s*<\s*int\s*>|string|int|long|bool)\s+(\w+)$/);
        if (m) return { type: m[1].replace(/\s/g, ""), name: m[2] };

        // Fallback
        const parts = p.split(/\s+/);
        if (parts.length >= 2) {
            return { type: parts.slice(0, -1).join(" "), name: parts[parts.length - 1] };
        }
        return { type: "int", name: p };
    });
}


// ============ TEST INPUT GENERATION ============

/**
 * Generate test inputs for function parameters.
 * @param {Array<{name: string, type: string}>} parameters
 * @param {Object} [customInputs] - Optional kv pairs of variable inputs
 * @returns {Object} map of param name → generated value (as display string + actual value)
 */
export function generateTestInputs(parameters, customInputs = {}) {
    const inputs = {};

    for (const param of parameters) {
        // Use custom input if available
        if (customInputs && customInputs[param.name] !== undefined) {
            const val = customInputs[param.name];
            inputs[param.name] = {
                display: Array.isArray(val) ? JSON.stringify(val) : String(val),
                value: val
            };
            continue;
        }

        const t = param.type.replace(/\s/g, "").toLowerCase();

        if (t === "int" || t === "long") {
            inputs[param.name] = { display: "3", value: 3 };
        } else if (t === "boolean" || t === "bool") {
            inputs[param.name] = { display: "true", value: 1 }; // 1 = true
        } else if (t === "int[]" || t === "vector<int>") {
            inputs[param.name] = { display: "[1, 2, 3]", value: [1, 2, 3] };
        } else if (t === "long[]") {
            inputs[param.name] = { display: "[1, 2, 3]", value: [1, 2, 3] };
        } else if (t === "string" || t === "String") {
            inputs[param.name] = { display: '"abc"', value: "abc" };
        } else if (t === "boolean[]" || t === "bool[]") {
            inputs[param.name] = { display: "[1, 0, 1]", value: [1, 0, 1] };
        } else {
            inputs[param.name] = { display: "3", value: 3 };
        }
    }

    return inputs;
}


// ============ WRAPPER CONSTRUCTION ============

/**
 * Build a synthetic code body that:
 * 1. Declares test-input variables
 * 2. Pastes the function body lines
 * so the existing interpreter can step through it.
 */
function buildSyntheticBody(code, funcInfo, testInputs, lang) {
    const lines = code.split("\n");

    // Find function body start
    let bodyStartIdx = -1;
    let braceDepth = 0;
    let funcLineIdx = -1;

    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (funcLineIdx === -1) {
            // Look for the function signature
            if (trimmed.includes(funcInfo.name + "(") || trimmed.includes(funcInfo.name + " (")) {
                funcLineIdx = i;
                // Count braces on this line
                for (const ch of trimmed) {
                    if (ch === "{") braceDepth++;
                }
                if (braceDepth > 0) {
                    bodyStartIdx = i + 1;
                }
            }
        } else if (bodyStartIdx === -1) {
            // Looking for opening brace
            for (const ch of trimmed) {
                if (ch === "{") {
                    braceDepth++;
                    bodyStartIdx = i + 1;
                    break;
                }
            }
        }
    }

    if (bodyStartIdx === -1) return null;

    // Find function body end
    let bodyEndIdx = lines.length - 1;
    let depth = braceDepth;
    for (let i = bodyStartIdx; i < lines.length; i++) {
        for (const ch of lines[i]) {
            if (ch === "{") depth++;
            if (ch === "}") {
                depth--;
                if (depth === 0) {
                    bodyEndIdx = i - 1;
                    i = lines.length; // break outer
                    break;
                }
            }
        }
    }

    // Build preamble: declare each parameter as a local variable
    const preamble = [];
    for (const param of funcInfo.parameters) {
        const input = testInputs[param.name];
        if (!input) continue;

        const t = param.type.replace(/\s/g, "").toLowerCase();

        if (t === "int[]") {
            preamble.push(`int[] ${param.name} = {${input.value.join(", ")}};`);
        } else if (t === "vector<int>") {
            preamble.push(`vector<int> ${param.name} = {${input.value.join(", ")}};`);
        } else if (Array.isArray(input.value)) {
            if (lang === "java") {
                preamble.push(`int[] ${param.name} = {${input.value.join(", ")}};`);
            } else {
                preamble.push(`vector<int> ${param.name} = {${input.value.join(", ")}};`);
            }
        } else {
            // For strings or other primitives, use the value directly
            const val = typeof input.value === "string" ? `"${input.value}"` : input.value;
            preamble.push(`int ${param.name} = ${val};`); // Keeping 'int' for parser, but value is string
        }
    }

    // Extract body lines
    const bodyLines = lines.slice(bodyStartIdx, bodyEndIdx + 1);

    // Combine preamble + body
    const synthetic = [...preamble, ...bodyLines].join("\n");
    return synthetic;
}


// ============ SHARED HELPERS ============

function cloneState(variables, arrays, output) {
    return {
        variables: Object.fromEntries(
            Object.entries(variables).map(([k, v]) => [k, { ...v }])
        ),
        arrays: Object.fromEntries(
            Object.entries(arrays).map(([k, v]) => [k, [...v]])
        ),
        output: [...output]
    };
}

function evaluateExpression(expr, variables, arrays) {
    if (!expr) return 0;

    // 1. Basic Java -> JS syntax adjustments
    let jsExpr = expr.trim()
        .replace(/(\w+)\.length\(\)/g, "$1.length")   // s.length() -> s.length
        .replace(/(\w+)\.size\(\)/g, "$1.length")     // v.size() -> v.length
        .replace(/(\d+)L\b/g, "$1")                   // 100L -> 100
        .replace(/\b([0-9]*\.[0-9]+)[fF]\b/g, "$1");  // 3.14f -> 3.14

    // 2. Prepare function arguments from variable scope (handling {type, value} objects)
    const varNames = Object.keys(variables);
    const varValues = varNames.map(n => variables[n]?.value ?? variables[n]);

    const arrNames = Object.keys(arrays);
    const arrValues = arrNames.map(n => arrays[n]);

    const allNames = [...varNames, ...arrNames];
    const allValues = [...varValues, ...arrValues];

    // 3. Evaluate safely using Function constructor
    try {
        const func = new Function(...allNames, "return " + jsExpr);
        return func(...allValues);
    } catch (err) {
        // Fallback: try to interpret as simple number if eval failed (e.g. integer literal)
        if (!isNaN(expr)) return Number(expr);
        throw new Error(`Eval failed for "${expr}": ${err.message}`);
    }
}

function evaluateCondition(condStr, variables, arrays) {
    // With the new evaluator, conditions are just expressions returning boolean
    try {
        const res = evaluateExpression(condStr, variables, arrays);
        return !!res;
    } catch (err) {
        // Fallback for simple boolean text
        if (condStr === "true") return true;
        if (condStr === "false") return false;
        throw new Error(`Condition error "${condStr}": ${err.message}`);
    }
}

function cleanLine(line) {
    return line.trim().replace(/;$/, "").trim();
}


// ============ LINE CLASSIFIERS ============

// ============ LINE CLASSIFIERS ============

function isVarDeclaration(line) {
    return /^(?:int|long|double|float|char|boolean|bool|string|String)\s+\w+\s*(=\s*.+)?$/.test(line);
}

function isAssignment(line) {
    return /^\w+\s*=\s*.+$/.test(line) && !line.startsWith("int ") && !line.includes("==");
}

function isIncrementDecrement(line) {
    return /^(\w+)\+\+$/.test(line) || /^(\w+)--$/.test(line) ||
        /^\+\+(\w+)$/.test(line) || /^--(\w+)$/.test(line);
}

function isCompoundAssignment(line) {
    return /^\w+\s*(\+=|-=|\*=|\/=|%=)\s*.+$/.test(line);
}

function isForLoop(line) { return /^for\s*\(/.test(line); }
function isWhileLoop(line) { return /^while\s*\(/.test(line); }
function isIfStatement(line) { return /^if\s*\(/.test(line); }
function isElseIf(line) { return /^else\s+if\s*\(/.test(line); }
function isElse(line) { return /^else\s*\{?$/.test(line) || line === "else"; }

function isJavaArrayDecl(line) { return /^int\[\]\s+\w+\s*=\s*\{/.test(line); }
function isJavaNewArrayDecl(line) { return /^int\[\]\s+\w+\s*=\s*new\s+int\[/.test(line); }
function isCppVectorDecl(line) { return /^vector\s*<\s*int\s*>\s+\w+\s*=?\s*\{/.test(line); }
function isArrayAssignment(line) { return /^\w+\[\s*[^\]]+\s*\]\s*=\s*.+$/.test(line); }


// ============ STATEMENT EXECUTORS ============

function executeVarDeclaration(line, variables, arrays) {
    // Capture type in group 1
    const match = line.match(/^((?:int|long|double|float|char|boolean|bool|string|String))\s+(\w+)\s*(?:=\s*(.+))?$/);
    if (!match) throw new Error(`Cannot parse var declaration: ${line}`);
    const type = match[1];
    const name = match[2];
    let value = match[3] ? evaluateExpression(match[3], variables, arrays) : 0;

    // Enforce integer truncation
    if (["int", "long", "short", "byte", "char"].includes(type) && typeof value === "number") {
        value = Math.trunc(value);
    }

    return { name, value: { type, value } };
}

function executeAssignment(line, variables, arrays) {
    const match = line.match(/^(\w+)\s*=\s*(.+)$/);
    if (!match) throw new Error(`Cannot parse assignment: ${line}`);
    const name = match[1];
    let value = evaluateExpression(match[2], variables, arrays);

    // Check existing type and truncate if needed
    const existing = variables[name];
    if (existing && ["int", "long", "short", "byte", "char"].includes(existing.type) && typeof value === "number") {
        value = Math.trunc(value);
    }

    // Preserve type if exists, else assume inferred or dynamic
    const newObj = existing ? { ...existing, value } : { type: "unknown", value };
    return { name, value: newObj };
}

function executeIncrementDecrement(line, variables) {
    let match = line.match(/^(\w+)\+\+$/);
    if (match) return updateIncDec(match[1], 1, variables);
    match = line.match(/^(\w+)--$/);
    if (match) return updateIncDec(match[1], -1, variables);
    match = line.match(/^\+\+(\w+)$/);
    if (match) return updateIncDec(match[1], 1, variables);
    match = line.match(/^--(\w+)$/);
    if (match) return updateIncDec(match[1], -1, variables);
    throw new Error(`Cannot parse increment/decrement: ${line}`);
}

function updateIncDec(name, delta, variables) {
    const existing = variables[name];
    const currentVal = existing?.value ?? existing ?? 0;
    let newVal = currentVal + delta;

    if (existing && ["int", "long", "short", "byte", "char"].includes(existing.type)) {
        newVal = Math.trunc(newVal); // Should be int anyway, but safe
    }

    const newObj = existing ? { ...existing, value: newVal } : { type: "int", value: newVal };
    return { name, value: newObj };
}

function executeCompoundAssignment(line, variables, arrays) {
    const match = line.match(/^(\w+)\s*(\+=|-=|\*=|\/=|%=)\s*(.+)$/);
    if (!match) throw new Error(`Cannot parse compound assignment: ${line}`);
    const name = match[1], op = match[2];
    const rightVal = evaluateExpression(match[3], variables, arrays);

    const existing = variables[name];
    const current = existing?.value ?? existing ?? 0;

    let value;
    switch (op) {
        case "+=": value = current + rightVal; break;
        case "-=": value = current - rightVal; break;
        case "*=": value = current * rightVal; break;
        case "/=": value = Math.trunc(current / rightVal); break; // integer division if int? No, JS division.
        case "%=": value = current % rightVal; break;
        default: throw new Error(`Unknown operator: ${op}`);
    }

    // Enforce type truncation
    if (existing && ["int", "long", "short", "byte", "char"].includes(existing.type)) {
        value = Math.trunc(value);
    }

    const newObj = existing ? { ...existing, value } : { type: "unknown", value };
    return { name, value: newObj };
}

function executeJavaArrayDecl(line, variables, arrays) {
    const match = line.match(/^int\[\]\s+(\w+)\s*=\s*\{([^}]*)\}/);
    if (!match) throw new Error(`Cannot parse Java array: ${line}`);
    const values = match[2].split(",").map(v => evaluateExpression(v.trim(), variables, arrays));
    return { name: match[1], values };
}

function executeJavaNewArrayDecl(line, variables, arrays) {
    const match = line.match(/^int\[\]\s+(\w+)\s*=\s*new\s+int\[([^\]]+)\]/);
    if (!match) throw new Error(`Cannot parse Java new array: ${line}`);
    const size = evaluateExpression(match[2], variables, arrays);
    return { name: match[1], values: new Array(size).fill(0) };
}

function executeCppVectorDecl(line, variables, arrays) {
    const match = line.match(/^vector\s*<\s*int\s*>\s+(\w+)\s*=?\s*\{([^}]*)\}/);
    if (!match) throw new Error(`Cannot parse C++ vector: ${line}`);
    const values = match[2].split(",").map(v => evaluateExpression(v.trim(), variables, arrays));
    return { name: match[1], values };
}

function executeArrayAssignment(line, variables, arrays) {
    const match = line.match(/^(\w+)\[\s*([^\]]+)\s*\]\s*=\s*(.+)$/);
    if (!match) throw new Error(`Cannot parse array assignment: ${line}`);
    const arrName = match[1];
    const index = evaluateExpression(match[2], variables, arrays);
    const value = evaluateExpression(match[3], variables, arrays);
    if (!arrays[arrName]) throw new Error(`Unknown array: ${arrName}`);
    arrays[arrName][index] = value;
    return { name: arrName, index, value };
}

function parseForHeader(line) {
    const match = line.match(/^for\s*\(\s*(.+)\s*\)\s*\{?$/);
    if (!match) {
        const match2 = line.match(/^for\s*\(\s*(.+)\s*\)$/);
        if (!match2) throw new Error(`Cannot parse for-loop: ${line}`);
        return splitForParts(match2[1]);
    }
    return splitForParts(match[1]);
}

function splitForParts(inner) {
    const parts = inner.split(";").map(p => p.trim());
    if (parts.length !== 3) throw new Error(`Invalid for-loop format: ${inner}`);
    return { initLine: parts[0], condStr: parts[1], updateLine: parts[2] };
}

function extractIfCondition(line) {
    const match = line.match(/^(?:else\s+)?if\s*\(\s*(.+)\s*\)\s*\{?$/);
    if (!match) throw new Error(`Cannot parse if condition: ${line}`);
    return match[1].trim();
}

function extractWhileCondition(line) {
    const match = line.match(/^while\s*\(\s*(.+)\s*\)\s*\{?$/);
    if (!match) throw new Error(`Cannot parse while condition: ${line}`);
    return match[1].trim();
}

function findBlockEnd(lines, startIndex) {
    let depth = 0;
    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        for (const ch of line) {
            if (ch === "{") depth++;
            if (ch === "}") { depth--; if (depth === 0) return i; }
        }
    }
    return lines.length - 1;
}


// ============ MAIN INTERPRETER ============

function interpret(code, language) {
    const rawLines = code.split("\n");
    const steps = [];
    const variables = {};
    const arrays = {};
    const output = [];  // Captured print output

    const MAX_STEPS = 500;
    const MAX_LOOP_ITERATIONS = 50;

    function addStep(lineNumber) {
        const state = cloneState(variables, arrays, output);
        steps.push({ line: lineNumber, variables: state.variables, arrays: state.arrays, output: state.output });
        if (steps.length > MAX_STEPS) {
            throw new Error("Visualization stopped: possible infinite loop.");
        }
    }

    // === Output capture ===
    function isPrintStatement(raw) {
        return /^System\.out\.print/.test(raw) || /^cout\s*<</.test(raw) ||
            /^printf\s*\(/.test(raw) || /^Console\.Write/.test(raw);
    }

    function executePrint(raw) {
        let text = "";
        // Java: System.out.println(expr) or System.out.print(expr)
        let m = raw.match(/^System\.out\.(?:println|print)\s*\((.*)\)\s*;?$/);
        if (m) {
            text = resolvePrintContent(m[1]);
            output.push(text);
            addStep(0); // line will be set by caller
            return;
        }
        // C++: cout << expr << expr << endl;
        m = raw.match(/^cout\s*<<\s*(.+?)\s*;?$/);
        if (m) {
            const parts = m[1].split("<<").map(p => p.trim()).filter(p => p !== "endl" && p !== "'\\n'" && p !== "\"\\n\"");
            text = parts.map(p => resolvePrintContent(p)).join("");
            output.push(text);
            addStep(0);
            return;
        }
        // printf: printf("format", args) - simplified
        m = raw.match(/^printf\s*\((.*)\)\s*;?$/);
        if (m) {
            text = resolvePrintContent(m[1]);
            output.push(text);
            addStep(0);
            return;
        }
        // Fallback: skip
    }

    function resolvePrintContent(expr) {
        expr = expr.trim();
        // String literal
        if (/^"(.*)"$/.test(expr)) return expr.slice(1, -1);
        // Variable or expression
        try {
            return String(evaluateExpression(expr, variables, arrays));
        } catch {
            // Try as concatenated parts (Java: "str" + var)
            const parts = expr.split("+").map(p => p.trim());
            return parts.map(p => {
                if (/^"(.*)"$/.test(p)) return p.slice(1, -1);
                try { return String(evaluateExpression(p, variables, arrays)); }
                catch { return p; }
            }).join("");
        }
    }

    // === Skip filter ===
    function shouldSkipLine(raw) {
        if (!raw || raw === "{" || raw === "}") return true;
        if (raw.startsWith("//") || raw.startsWith("/*") || raw.startsWith("*") || raw.startsWith("*/")) return true;
        if (raw.startsWith("import ") || raw.startsWith("package ")) return true;
        if (raw.startsWith("public class ") || raw.startsWith("class ")) return true;
        if (raw.includes("public static void main")) return true;
        if (raw.startsWith("#include") || raw.startsWith("using ")) return true;
        if (raw.startsWith("int main")) return true;
        if (raw.startsWith("void ")) return true;
        // Print and return statements are handled separately (not skipped)
        if (raw.startsWith("cin") || raw.startsWith("scanf")) return true;
        if (raw.startsWith("cin") || raw.startsWith("scanf")) return true;
        // if (raw.startsWith("String ") || raw.startsWith("string ")) return true; // Don't skip strings!
        // if (raw.startsWith("double ") || raw.startsWith("float ")) return true;
        // if (raw.startsWith("boolean ") || raw.startsWith("bool ")) return true;
        // if (raw.startsWith("char ") || raw.startsWith("long ")) return true;
        if (raw.startsWith("new ")) return true;
        // Function calls (not for/if/while/else)
        if (/^\w+\s*\(/.test(raw) && !/^(for|if|else|while)\b/.test(raw)) return true;
        // Method calls
        if (/^\w+\.\w+/.test(raw)) return true;
        return false;
    }

    function isMethodSignature(raw) {
        return /^(public|private|protected)\s+/.test(raw) && raw.includes("(");
    }

    function tryExtractMethodArrayParams(raw) {
        const paramMatches = raw.matchAll(/int\[\]\s+(\w+)/g);
        for (const m of paramMatches) {
            if (!arrays[m[1]]) arrays[m[1]] = [];
        }
    }

    // === Main line executor ===
    function executeLine(lineIdx) {
        if (lineIdx >= rawLines.length) return lineIdx + 1;
        const raw = rawLines[lineIdx].trim();

        if (isMethodSignature(raw)) {
            tryExtractMethodArrayParams(raw);
            return lineIdx + 1;
        }

        // Capture print statements before skipping
        if (isPrintStatement(raw)) {
            try {
                executePrint(cleanLine(raw));
                // Fix line number on the last step we just added
                if (steps.length > 0) steps[steps.length - 1].line = lineIdx + 1;
            } catch (e) {
                console.warn(`[VISUALIZER] Print failed line ${lineIdx + 1}: ${e.message}`);
            }
            return lineIdx + 1;
        }

        // Capture return statements
        if (raw.startsWith("return")) {
            try {
                const retExpr = cleanLine(raw).replace(/^return\s*/, "").trim();
                if (retExpr) {
                    const val = evaluateExpression(retExpr, variables, arrays);
                    output.push(`Return: ${val}`);
                    addStep(lineIdx + 1);
                }
            } catch (e) {
                console.warn(`[VISUALIZER] Return eval failed line ${lineIdx + 1}: ${e.message}`);
            }
            return rawLines.length; // stop execution after return
        }

        if (shouldSkipLine(raw)) return lineIdx + 1;

        const cleaned = cleanLine(raw);

        try {
            if (isForLoop(cleaned)) return executeForLoop(lineIdx, cleaned);
            if (isWhileLoop(cleaned)) return executeWhileLoop(lineIdx, cleaned);
            if (isIfStatement(cleaned) || isElseIf(cleaned)) return executeIfChain(lineIdx);
            if (isElse(cleaned)) return findBlockEnd(rawLines, lineIdx) + 1;

            if (language === "java" && isJavaArrayDecl(cleaned)) {
                const r = executeJavaArrayDecl(cleaned, variables, arrays);
                arrays[r.name] = r.values; addStep(lineIdx + 1); return lineIdx + 1;
            }
            if (language === "java" && isJavaNewArrayDecl(cleaned)) {
                const r = executeJavaNewArrayDecl(cleaned, variables, arrays);
                arrays[r.name] = r.values; addStep(lineIdx + 1); return lineIdx + 1;
            }
            if (language === "cpp" && isCppVectorDecl(cleaned)) {
                const r = executeCppVectorDecl(cleaned, variables, arrays);
                arrays[r.name] = r.values; addStep(lineIdx + 1); return lineIdx + 1;
            }
            if (isArrayAssignment(cleaned)) {
                executeArrayAssignment(cleaned, variables, arrays);
                addStep(lineIdx + 1); return lineIdx + 1;
            }
            if (isVarDeclaration(cleaned)) {
                const r = executeVarDeclaration(cleaned, variables, arrays);
                variables[r.name] = r.value; addStep(lineIdx + 1); return lineIdx + 1;
            }
            if (isIncrementDecrement(cleaned)) {
                const r = executeIncrementDecrement(cleaned, variables);
                variables[r.name] = r.value; addStep(lineIdx + 1); return lineIdx + 1;
            }
            if (isCompoundAssignment(cleaned)) {
                const r = executeCompoundAssignment(cleaned, variables, arrays);
                variables[r.name] = r.value; addStep(lineIdx + 1); return lineIdx + 1;
            }
            if (isAssignment(cleaned)) {
                const r = executeAssignment(cleaned, variables, arrays);
                const oldVal = variables[r.name];
                variables[r.name] = r.value;
                if (oldVal !== r.value) addStep(lineIdx + 1);
                return lineIdx + 1;
            }
        } catch (lineError) {
            console.warn(`[VISUALIZER] Skipping line ${lineIdx + 1}: ${lineError.message}`);
            return lineIdx + 1;
        }

        return lineIdx + 1;
    }

    // === For loop ===
    function executeForLoop(lineIdx, cleaned) {
        const header = parseForHeader(cleaned);
        const blockEnd = findBlockEnd(rawLines, lineIdx);
        const bodyStart = lineIdx + 1;
        const bodyEnd = rawLines[blockEnd].trim() === "}" ? blockEnd - 1 : blockEnd;

        const initCleaned = cleanLine(header.initLine);
        if (isVarDeclaration(initCleaned)) {
            const r = executeVarDeclaration(initCleaned, variables, arrays);
            variables[r.name] = r.value;
            addStep(lineIdx + 1);
        }

        let iterations = 0;
        while (evaluateCondition(header.condStr, variables, arrays)) {
            if (++iterations > MAX_LOOP_ITERATIONS) {
                throw new Error("Visualization stopped: possible infinite loop.");
            }
            let bodyIdx = bodyStart;
            while (bodyIdx <= bodyEnd) {
                const bodyRaw = rawLines[bodyIdx]?.trim();
                if (!bodyRaw || bodyRaw === "{" || bodyRaw === "}") { bodyIdx++; continue; }
                bodyIdx = executeLine(bodyIdx);
            }
            const updateCleaned = cleanLine(header.updateLine);
            if (isIncrementDecrement(updateCleaned)) {
                const r = executeIncrementDecrement(updateCleaned, variables);
                variables[r.name] = r.value; addStep(lineIdx + 1);
            } else if (isCompoundAssignment(updateCleaned)) {
                const r = executeCompoundAssignment(updateCleaned, variables, arrays);
                variables[r.name] = r.value; addStep(lineIdx + 1);
            } else if (isAssignment(updateCleaned)) {
                const r = executeAssignment(updateCleaned, variables, arrays);
                variables[r.name] = r.value; addStep(lineIdx + 1);
            }
        }
        return blockEnd + 1;
    }

    // === While loop ===
    function executeWhileLoop(lineIdx, cleaned) {
        const condStr = extractWhileCondition(cleaned);
        const blockEnd = findBlockEnd(rawLines, lineIdx);
        const bodyStart = lineIdx + 1;
        const bodyEnd = rawLines[blockEnd].trim() === "}" ? blockEnd - 1 : blockEnd;

        addStep(lineIdx + 1);

        let iterations = 0;
        while (evaluateCondition(condStr, variables, arrays)) {
            if (++iterations > MAX_LOOP_ITERATIONS) {
                throw new Error("Visualization stopped: possible infinite loop.");
            }
            let bodyIdx = bodyStart;
            while (bodyIdx <= bodyEnd) {
                const bodyRaw = rawLines[bodyIdx]?.trim();
                if (!bodyRaw || bodyRaw === "{" || bodyRaw === "}") { bodyIdx++; continue; }
                bodyIdx = executeLine(bodyIdx);
            }
            addStep(lineIdx + 1);
        }
        return blockEnd + 1;
    }

    // === If / else chain ===
    function executeIfChain(lineIdx) {
        let idx = lineIdx;
        while (idx < rawLines.length) {
            const raw = rawLines[idx].trim();
            const cleaned = cleanLine(raw);

            if (isIfStatement(cleaned) || isElseIf(cleaned)) {
                const condStr = extractIfCondition(cleaned);
                const result = evaluateCondition(condStr, variables, arrays);
                addStep(idx + 1);
                const blockEnd = findBlockEnd(rawLines, idx);

                if (result) {
                    let bodyIdx = idx + 1;
                    const bodyEnd = rawLines[blockEnd].trim() === "}" ? blockEnd - 1 : blockEnd;
                    while (bodyIdx <= bodyEnd) {
                        const bodyRaw = rawLines[bodyIdx]?.trim();
                        if (!bodyRaw || bodyRaw === "{" || bodyRaw === "}") { bodyIdx++; continue; }
                        bodyIdx = executeLine(bodyIdx);
                    }
                    idx = blockEnd + 1;
                    while (idx < rawLines.length) {
                        const nextCleaned = cleanLine(rawLines[idx].trim());
                        if (isElseIf(nextCleaned) || isElse(nextCleaned)) {
                            idx = findBlockEnd(rawLines, idx) + 1;
                        } else break;
                    }
                    return idx;
                } else {
                    idx = blockEnd + 1;
                    continue;
                }
            } else if (isElse(cleaned)) {
                addStep(idx + 1);
                const blockEnd = findBlockEnd(rawLines, idx);
                let bodyIdx = idx + 1;
                const bodyEnd = rawLines[blockEnd].trim() === "}" ? blockEnd - 1 : blockEnd;
                while (bodyIdx <= bodyEnd) {
                    const bodyRaw = rawLines[bodyIdx]?.trim();
                    if (!bodyRaw || bodyRaw === "{" || bodyRaw === "}") { bodyIdx++; continue; }
                    bodyIdx = executeLine(bodyIdx);
                }
                return blockEnd + 1;
            } else break;
        }
        return idx;
    }

    // --- Start execution ---
    let lineIdx = 0;
    while (lineIdx < rawLines.length) {
        lineIdx = executeLine(lineIdx);
    }
    return steps;
}


// ============ INTERNAL ENTRY POINTS ============

export function visualizeJava(code) { return interpret(code, "java"); }
export function visualizeCpp(code) { return interpret(code, "cpp"); }


// ============ UNIFIED PUBLIC API ============

/**
 * visualizeSnippet(code) — single entry point.
 *
 * 1. Detects language
 * 2. Detects entry function (if any)
 * 3. Generates test inputs (if function detected)
 * 4. Builds synthetic body (if function detected)
 * 5. Runs interpreter
 *
 * @param {string} code
 * @param {Object} [customInputs] - Optional kv pairs of variable inputs
 * @returns {{ steps: Array, language: string, dryRunInputs: Object|null, error: string|null }}
 */
export function visualizeSnippet(code, customInputs = null) {
    try {
        // 1. Language detection
        const language = detectLanguage(code);
        if (language === "unsupported") {
            return { steps: [], language, dryRunInputs: null, error: "__unsupported__" };
        }

        // 2. Function detection
        const funcInfo = detectEntryFunction(code, language);
        let dryRunInputs = null;
        let codeToRun = code;

        // 3 & 4. If function detected, build synthetic body
        if (funcInfo && funcInfo.parameters.length > 0) {
            const testInputs = generateTestInputs(funcInfo.parameters, customInputs);
            dryRunInputs = {};
            for (const [name, info] of Object.entries(testInputs)) {
                dryRunInputs[name] = info.display;
            }

            const synthetic = buildSyntheticBody(code, funcInfo, testInputs, language);
            if (synthetic) {
                codeToRun = synthetic;
            }
        }

        // 5. Run interpreter
        const steps = language === "java"
            ? visualizeJava(codeToRun)
            : visualizeCpp(codeToRun);

        if (!steps || steps.length === 0) {
            return { steps: [], language, dryRunInputs, error: "No executable steps found. Try a snippet with int variables, loops, or if/else." };
        }

        return { steps, language, dryRunInputs, error: null };

    } catch (err) {
        console.error("[VISUALIZER]", err.message);
        return { steps: [], language: "unknown", dryRunInputs: null, error: "This snippet cannot be visualized yet." };
    }
}
