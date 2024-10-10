type Field = string | NestedField;

interface NestedField {
  name: string;
  fields: Field[];
}

interface Operation {
  name: string;
  fields: Field[];
  parameters?: string; // Optional parameters for operations
}

interface QueryObject {
  name: string;
  variableDefinitions: string;
  operations: Operation[];
}

function normalizeFields(fields: Field[], indentLevel: number = 1): string {
  const indent = '    '.repeat(indentLevel);

  return fields
    .map(field => {
      if (typeof field === 'string') {
        return `${indent}${field}`; // Add indentation for simple field names
      }

      if (typeof field === 'object') {
        // Recursively handle nested fields with increased indentation level
        return `${indent}${field.name} {\n${normalizeFields(field.fields, indentLevel + 1)}\n${indent}}`;
      }

      return ''; // Fallback for any unexpected type
    })
    .filter(Boolean) // Remove any empty strings
    .join('\n'); // Join fields with the correct indentation
}

function buildQuery(object: QueryObject): string {
  const operations = object.operations
    .map(op => {
      const fields = normalizeFields(op.fields);
      const params = op.parameters ? `(${op.parameters})` : '';

      return `    ${op.name}${params} {\n${fields}\n    }`;
    })
    .join('\n');

  return `query ${object.name}(${object.variableDefinitions}) {\n${operations}\n}`;
}
