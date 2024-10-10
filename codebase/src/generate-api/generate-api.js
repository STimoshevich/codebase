const fs = require("fs");
const path = require("path");

const API_FILE = "src/app/api/common.ts";
const API_SERVICE_TEMPLATE_FILE = "templates/AngularClient.liquid";
const CONTRACTS_FOLDER = "src/app/api/contracts";
const API_MODELS_FOLDER = `${CONTRACTS_FOLDER}/ApiModels`;
const ENUMS_FOLDER = `${CONTRACTS_FOLDER}/enums`;
const API_SERVICES = "src/app/api/api-services";

function ensureFolderExists(folder) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
}

function splitGeneratedApiFile(apiFilePath) {
    if (!fs.existsSync(apiFilePath)) {
        console.error("❌ Error: API file not found. Ensure NSwag has generated it.");
        process.exit(1);
    }

    ensureFolderExists(CONTRACTS_FOLDER);
    ensureFolderExists(API_MODELS_FOLDER);
    ensureFolderExists(ENUMS_FOLDER);
    ensureFolderExists(API_SERVICES);

    const content = fs.readFileSync(apiFilePath, "utf8");
    const lines = content.split("\n");

    const importLines = new Set();
    const modelNames = [];
    const enumNames = [];
    const modelContents = {};
    const enumContents = {};
    const clientContents = {};
    const defaultApiServiceImports = extractDefaultImports(API_SERVICE_TEMPLATE_FILE);

    let insideModel = false;
    let insideEnum = false;
    let insideClient = false;
    let braceStack = [];
    let currentBlock = [];
    let currentName = "";

    for (const line of lines) {
        if (line.startsWith("import ")) {
            importLines.add(line);
        } else if (line.startsWith("export interface")) {
            insideModel = true;
            braceStack = ["{"];
            currentBlock = [line];
            currentName = extractTypeName(line);
        } else if (line.startsWith("export enum")) {
            insideEnum = true;
            braceStack = ["{"];
            currentBlock = [line];
            currentName = extractTypeName(line);
        } else if (line.startsWith("export class") && line.includes("ApiService")) {
            insideClient = true;
            braceStack = ["{"];
            currentBlock = [...defaultApiServiceImports, '\n', "@Injectable({ providedIn: 'root' })", line];
            currentName = extractTypeName(line);
        } else if (insideModel || insideEnum || insideClient) {
            currentBlock.push(line);
            trackBraces(line, braceStack);

            if (braceStack.length === 0) {
                if (insideModel) {
                    modelContents[currentName] = currentBlock.join("\n");
                    modelNames.push(currentName);
                } else if (insideEnum) {
                    enumContents[currentName] = currentBlock.join("\n");
                    enumNames.push(currentName);
                } else if (insideClient) {
                    clientContents[currentName] = currentBlock.join("\n");
                }
                insideModel = insideEnum = insideClient = false;
                currentBlock = [];
                currentName = "";
            }
        }
    }

    for (const [name, content] of Object.entries(modelContents)) {
        const usedTypes = extractUsedTypes(content, modelNames, enumNames, name);
        const imports = generateImports(usedTypes, modelNames, enumNames, "../ApiModels", "../enums");
        writeToFile(`${API_MODELS_FOLDER}/${name}.ts`, imports + content);
    }

    for (const [name, content] of Object.entries(enumContents)) {
        const usedTypes = extractUsedTypes(content, modelNames, enumNames, name);
        const imports = generateImports(usedTypes, modelNames, enumNames, "../ApiModels", "../enums");
        writeToFile(`${ENUMS_FOLDER}/${name}.ts`, imports + content);
    }

    for (const [name, content] of Object.entries(clientContents)) {
        const usedTypes = extractUsedTypes(content, modelNames, enumNames, name);
        const imports = generateImports(usedTypes, modelNames, enumNames, "../contracts");
        writeToFile(`${API_SERVICES}/${name}.ts`, imports + content);
    }

    generateIndexFile(API_MODELS_FOLDER, modelNames);
    generateIndexFile(ENUMS_FOLDER, enumNames);
    generateIndexFile(API_SERVICES, Object.keys(clientContents));
    generateIndexFile(CONTRACTS_FOLDER, ["ApiModels", "enums"]);

    try {
        fs.unlinkSync(apiFilePath);
        console.log(`🗑️ Successfully removed the original API file: ${apiFilePath}`);
    } catch (err) {
        console.error("❌ Error removing API file: ", err);
    }

    console.log("✅ Successfully split API into separate files!");
}

function extractDefaultImports(forFile) {
    if (!fs.existsSync(forFile)) {
        console.error(`❌ Error: File not found. Ensure file '${forFile}' exist.`);
        process.exit(1);
    }

    const importRegex =  /import\s+.*?\s+from\s+['"](.*?)['"];/g;

    const template = fs.readFileSync(forFile, "utf8")
    const imports = [];
    let match;
    while ((match = importRegex.exec(template)) !== null) {
        imports.push(match[0]); // match[0] contains the full import statement
    }

    return imports;
}

function extractTypeName(line) {
    const match = line.match(/export (interface|enum|class) (\w+)/);
    return match ? match[2] : "UnknownType";
}

function trackBraces(line, stack) {
    for (const char of line) {
        if (char === "{") stack.push("{");
        if (char === "}") stack.pop();
    }
}

function extractUsedTypes(content, modelNames, enumNames, selfName) {
    const matches = [...content.matchAll(/\b(\w+)\b/g)].map(m => m[1]);
    return new Set(
        matches.filter(type => (modelNames.includes(type) || enumNames.includes(type)) && type !== selfName)
    );
}

function generateImports(usedTypes, modelNames, enumNames, modelsPath, enumsPath) {
    const imports = [];
    const modelImports = [...usedTypes].filter(type => modelNames.includes(type));
    const enumImports = [...usedTypes].filter(type => enumNames.includes(type));

    if (modelImports.length > 0) {
        imports.push(`import { ${modelImports.join(", ")} } from '${modelsPath}';`);
    }
    if (enumImports.length > 0) {
        imports.push(`import { ${enumImports.join(", ")} } from '${enumsPath}';`);
    }

    return imports.length > 0 ? imports.join("\n") + "\n\n" : "";
}

function writeToFile(filePath, content) {
    fs.writeFileSync(filePath, content, "utf8");
}

function generateIndexFile(folder, typeNames) {
    const exports = typeNames.map(name => `export * from './${name}';`).join("\n");
    fs.writeFileSync(path.join(folder, "index.ts"), exports, "utf8");
}

function main() {
    console.log("🚀 Running NSwag postprocessing...");
    console.log("📌 Splitting generated API file...");
    splitGeneratedApiFile(API_FILE);
    console.log("✅ NSwag generation and file splitting complete!");
}

main();
