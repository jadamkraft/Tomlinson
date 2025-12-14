const fs = require('fs');
const path = require('path');

// ==========================================
// CONFIGURATION
// ==========================================
const SBLGNT_DIR = './sblgnt'; 
const STRONGS_PATH = './public/assets/strongs_greek.xml';
const OUTPUT_DIR = './public/assets';

// Map Numeric Book Codes to OSIS IDs
const NUMERIC_BOOK_MAP = {
    '61': 'Matt', '62': 'Mark', '63': 'Luke', '64': 'John', '65': 'Acts', 
    '66': 'Rom', '67': '1Cor', '68': '2Cor', '69': 'Gal', '70': 'Eph', 
    '71': 'Phil', '72': 'Col', '73': '1Thess', '74': '2Thess', '75': '1Tim', 
    '76': '2Tim', '77': 'Titus', '78': 'Phlm', '79': 'Heb', '80': 'Jas', 
    '81': '1Pet', '82': '2Pet', '83': '1John', '84': '2John', '85': '3John', 
    '86': 'Jude', '87': 'Rev'
};

// Helper: Remove Greek accents for fuzzy matching
const stripAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").normalize('NFC').toLowerCase();
};

// ==========================================
// 1. LOAD DICTIONARY
// ==========================================
console.log('📖 Loading Strongs Dictionary...');
const strongsMap = new Map(); 
const fuzzyStrongsMap = new Map();

if (fs.existsSync(STRONGS_PATH)) {
    const strongsXml = fs.readFileSync(STRONGS_PATH, 'utf8');
    const entryRegex = /<entry[^>]*strongs="(\d+)"[^>]*>[\s\S]*?<greek[^>]*unicode="([^"]+)"/g;
    
    let match;
    let count = 0;
    while ((match = entryRegex.exec(strongsXml)) !== null) {
        const id = 'G' + parseInt(match[1]); 
        const word = match[2].trim().normalize('NFC');
        
        strongsMap.set(word, id);
        // Map accent-free version to ID
        fuzzyStrongsMap.set(stripAccents(word), id);
        count++;
    }
    console.log(`✅ Dictionary Loaded: ${count} entries.`);
} else {
    console.warn(`⚠️ Warning: Strongs file not found at ${STRONGS_PATH}.`);
}

// ==========================================
// 2. PROCESS FILES
// ==========================================
if (!fs.existsSync(SBLGNT_DIR)) {
    console.error(`❌ ERROR: Could not find folder "${SBLGNT_DIR}".`);
    process.exit(1);
}

const files = fs.readdirSync(SBLGNT_DIR);
let processedCount = 0;

files.forEach(file => {
    if (!file.endsWith('.txt')) return;

    const filenameMatch = file.match(/^(\d+)-/);
    if (!filenameMatch) return;
    
    const bookCode = filenameMatch[1];
    const osisId = NUMERIC_BOOK_MAP[bookCode];

    if (!osisId) return;

    console.log(`\n📘 Processing ${osisId} (${file})...`);

    const content = fs.readFileSync(path.join(SBLGNT_DIR, file), 'utf8');
    const lines = content.split('\n');

    let xmlOutput = `<?xml version="1.0" encoding="UTF-8"?>\n<osis>\n<osisText xml:lang="grc" osisIDWork="SBLGNT">\n<div type="book" osisID="${osisId}">\n`;

    let currentChapter = null;
    let currentVerse = null;
    let wordCount = 0;
    let missingStrongs = 0;
    const missingSample = new Set(); // Store unique missing words for debug

    lines.forEach(line => {
        // Data Format: 020101 N- ----NSF- Ἀρχὴ Ἀρχὴ ἀρχή ἀρχή
        // Col 0: Ref | Col 1: Pos | Col 2: Morph | Col 3: Text | Col 4: NormText | Col 5: Lemma | Col 6: Root
        
        const parts = line.trim().split(/\s+/);
        if (parts.length < 7) return; 

        const refCode = parts[0]; 
        const morph = parts[2];
        const text = parts[3];
        
        // CRITICAL FIX: Use Column 6 (Root) if available, fallback to Col 5 (Lemma)
        const rootWord = parts[6] || parts[5]; 

        const ch = parseInt(refCode.substring(2, 4)).toString();
        const vs = parseInt(refCode.substring(4, 6)).toString();

        if (ch !== currentChapter) {
            if (currentChapter) {
                if (currentVerse) xmlOutput += `</verse>\n`;
                xmlOutput += `</chapter>\n`;
            }
            xmlOutput += `<chapter osisID="${osisId}.${ch}">\n`;
            currentChapter = ch;
            currentVerse = null;
        }

        if (vs !== currentVerse) {
            if (currentVerse) xmlOutput += `</verse>\n`;
            xmlOutput += `<verse osisID="${osisId}.${ch}.${vs}">`; 
            currentVerse = vs;
        }

        // --- LOOKUP ---
        const rootNorm = rootWord.normalize('NFC');
        let strongsId = strongsMap.get(rootNorm);

        if (!strongsId) {
            // Fallback 1: Fuzzy match (accent stripped)
            strongsId = fuzzyStrongsMap.get(stripAccents(rootNorm));
        }
        
        if (!strongsId) {
            // Fallback 2: Try the Col 5 Lemma just in case Col 6 was weird
            const lemmaNorm = parts[5].normalize('NFC');
            strongsId = strongsMap.get(lemmaNorm) || fuzzyStrongsMap.get(stripAccents(lemmaNorm));
        }

        if (!strongsId) {
            missingStrongs++;
            if (missingSample.size < 5) missingSample.add(rootNorm);
        }

        const finalStrongs = strongsId || "";
        const safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        xmlOutput += `<w lemma="${finalStrongs}" morph="${morph}">${safeText}</w> `;
        wordCount++;
    });

    if (currentVerse) xmlOutput += `</verse>\n`;
    if (currentChapter) xmlOutput += `</chapter>\n`;
    xmlOutput += `</div>\n</osisText>\n</osis>`;

    fs.writeFileSync(path.join(OUTPUT_DIR, `${osisId}.xml`), xmlOutput);
    
    const missingPct = Math.round((missingStrongs/wordCount)*100);
    console.log(`   ✅ Generated ${osisId}.xml`);
    console.log(`   📊 Stats: ${wordCount} words. Missing: ${missingStrongs} (${missingPct}%)`);
    if (missingPct > 5) {
        console.log(`   ⚠️ Top Missing Words: ${Array.from(missingSample).join(', ')}`);
    }
    processedCount++;
});

if (processedCount === 0) {
    console.error("\n❌ ERROR: No books processed.");
} else {
    console.log(`\n🎉 SUCCESS: Processed ${processedCount} books.`);
}