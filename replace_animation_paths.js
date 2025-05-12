import fs from 'fs';

// Read the content template data file
const filePath = 'client/src/data/contentTemplateData.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Define a function to convert kebab case to title case
function kebabToTitleCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Regular expression to find all animation preview paths
const regex = /animationPreview: "\/assets\/animations\/([^"]+)"/g;

// Replace each path with a placeholder URL
content = content.replace(regex, (match, p1) => {
  const fileName = p1.replace('.gif', '');
  const titleCaseName = kebabToTitleCase(fileName);
  return `animationPreview: "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${titleCaseName.replace(/ /g, '+')}+Workflow"`;
});

// Write the updated content back to the file
fs.writeFileSync(filePath, content);

console.log('Animation paths replaced successfully!');