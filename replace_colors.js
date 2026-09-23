const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('frontend/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    content = content.replace(/rgba\(216,\s*107,\s*40,/g, 'rgba(18,168,174,');
    content = content.replace(/rgba\(180,\s*83,\s*9,/g, 'rgba(7,84,90,');
    
    // Tailwind classes
    content = content.replace(/\b(bg|text|border|from|to|via|ring|shadow)-amber-/g, '\-cyan-');
    content = content.replace(/\b(bg|text|border|from|to|via|ring|shadow)-orange-/g, '\-cyan-');
    
    // Hex colors
    content = content.replace(/#d86b28/gi, '#07545A');
    content = content.replace(/#c65a1e/gi, '#06483F');
    content = content.replace(/#b45309/gi, '#06483F');
    content = content.replace(/#92400e/gi, '#083F45');

    if (content !== originalContent) {
        fs.writeFileSync(file, content);
        console.log('Updated:', file);
    }
});
