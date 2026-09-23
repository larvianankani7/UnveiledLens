const fs = require('fs');

let css = fs.readFileSync('frontend/src/index.css', 'utf8');

// 1. @theme values
css = css.replace(/--color-accent-amber:\s*#[a-fA-F0-9]+;/g, '--color-accent-amber: #07545A;');
css = css.replace(/--color-accent-burnt:\s*#[a-fA-F0-9]+;/g, '--color-accent-burnt: #06483F;');
css = css.replace(/--color-accent-dark:\s*#[a-fA-F0-9]+;/g, '--color-accent-dark: #083F45;');

// 2. Dark theme
css = css.replace(/--bg-primary:\s*#050505;/g, '--bg-primary: #020303;');
css = css.replace(/--bg-secondary:\s*#0b0b0b;/g, '--bg-secondary: #050708;');
css = css.replace(/--bg-surface:\s*rgba\(17,\s*17,\s*17,\s*0\.82\);/g, '--bg-surface: rgba(5, 7, 8, 0.82);');
css = css.replace(/--bg-surface-elevated:\s*#151515;/g, '--bg-surface-elevated: #050708;');

css = css.replace(/--border-hover:\s*rgba\(216,\s*107,\s*40,\s*0\.35\);/g, '--border-hover: rgba(18, 168, 174, 0.35);');

css = css.replace(/--accent-burnt:\s*#c65a1e;/g, '--accent-burnt: #06483F;');
css = css.replace(/--accent-amber:\s*#d86b28;/g, '--accent-amber: #07545A;');
css = css.replace(/--accent-glow:\s*rgba\(216,\s*107,\s*40,\s*0\.12\);/g, '--accent-glow: rgba(18, 168, 174, 0.12);');

css = css.replace(/--severity-med-bg:\s*rgba\(216,\s*107,\s*40,\s*0\.10\);/g, '--severity-med-bg: rgba(18, 168, 174, 0.10);');
css = css.replace(/--severity-med-text:\s*#e58a3a;/g, '--severity-med-text: #12A8AE;');
css = css.replace(/--severity-med-border:\s*#d86b28;/g, '--severity-med-border: #086357;');

// 3. Light theme
css = css.replace(/--bg-surface:\s*rgba\(190,\s*182,\s*182,\s*0\.88\);/g, '--bg-surface: rgba(255, 255, 255, 0.88);');
css = css.replace(/--bg-surface-elevated:\s*#8b8a89;/g, '--bg-surface-elevated: #ffffff;');

css = css.replace(/--border-hover:\s*rgba\(180,\s*83,\s*9,\s*0\.4\);/g, '--border-hover: rgba(7, 84, 90, 0.4);');

css = css.replace(/--accent-burnt:\s*#b45309;/g, '--accent-burnt: #06483F;');
css = css.replace(/--accent-amber:\s*#c65a1e;/g, '--accent-amber: #07545A;');
css = css.replace(/--accent-glow:\s*rgba\(180,\s*83,\s*9,\s*0\.08\);/g, '--accent-glow: rgba(7, 84, 90, 0.08);');

css = css.replace(/--severity-med-bg:\s*rgba\(216,\s*107,\s*40,\s*0\.08\);/g, '--severity-med-bg: rgba(7, 84, 90, 0.08);');
css = css.replace(/--severity-med-text:\s*#9a3412;/g, '--severity-med-text: #07545A;');
css = css.replace(/--severity-med-border:\s*#c2410c;/g, '--severity-med-border: #06483F;');

// 4. Other occurrences of orange RGB in index.css
// rgba(216, 107, 40, X)
css = css.replace(/rgba\(216,\s*107,\s*40,\s*([0-9.]+)\)/g, 'rgba(18, 168, 174, )');
// rgba(180, 83, 9, X)
css = css.replace(/rgba\(180,\s*83,\s*9,\s*([0-9.]+)\)/g, 'rgba(7, 84, 90, )');

// 5. Update CyberBackground specific css just in case there are remnants
// We don't really need nodes and scanline anymore, but if they are there, their colors are updated.

fs.writeFileSync('frontend/src/index.css', css);
console.log('index.css updated successfully.');
