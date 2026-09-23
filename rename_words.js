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
            if(file.endsWith('.jsx') || file.endsWith('.css')) results.push(file);
        }
    });
    return results;
}

const files = walk('frontend/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    content = content.replace(/\bamber\b/g, 'cyan');
    content = content.replace(/\bAmber\b/g, 'Cyan');
    
    content = content.replace(/\bburnt\b/g, 'peacock');
    content = content.replace(/\bBurnt\b/g, 'Peacock');
    
    content = content.replace(/\borange\b/gi, 'cyan');

    if (content !== originalContent) {
        fs.writeFileSync(file, content);
        console.log('Renamed variables/classes in:', file);
    }
});
