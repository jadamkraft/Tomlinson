const fs = require('fs');
const path = require('path');

// CONFIGURATION
const SBLGNT_DIR = './sblgnt'; 
const STRONGS_PATH = './public/assets/strongs_greek.xml';
const OUTPUT_DIR = './public/assets';

// Map MorphGNT Numeric Book Codes to OSIS IDs
const NUMERIC_BOOK_MAP = {
    '01': 'Matt', '02': 'Mark', '03': 'Luke', '04': 'John', '05': 'Acts', 
    '06': 'Rom', '07': '1Cor', '08': '2Cor', '09': 'Gal', '10': 'Eph', 
    '11': 'Phil', '12': 'Col', '13': '1Thess', '14': '2Thess', '15': '1Tim', 
    '16': '2Tim', '17': 'Titus', '18': 'Philem', '19': 'Heb', '20': 'Jas', 
    '21': '1Pet', '22': '2Pet', '23': '1John', '24': '2John', '25': '3John', 
    '26': 'Jude', '27': 'Rev'
};

// 1. Load Strongs Dictionary
console.log('Loading Strongs Dictionary...');
const strongsMap = {};
if (fs.existsSync(STRONGS_PATH)) {
    const strongsXml = fs.readFileSync(STRONGS_PATH, 'utf8');
    const entryRegex = /<entry strongs="(\d+)">[\s\S]*?<greek[^>]*unicode="([^"]+)"/g;
    let match;
    while ((match = entryRegex.exec(strongsXml)) !== null) {
        const id = 'G' + parseInt(match[1]); 
        const word = match[2];
        strongsMap[word] = id;
    }
    console.log(`Mapped ${Object.keys(strongsMap).length} Greek words to Strongs IDs.`);
} else {
    console.warn(`Warning: Strongs file not found at ${STRONGS_PATH}. Lemmas will be empty.`);
}

// 2. Convert Files
if (!fs.existsSync(SBLGNT_DIR)) {
    console.error(`ERROR: Could not find folder "${SBLGNT_DIR}".`);
    process.exit(1);
}

const files = fs.readdirSync(SBLGNT_DIR);
let processedCount = 0;

files.forEach(file => {
    if (!file.endsWith('.txt')) return;

    const content = fs.readFileSync(path.join(SBLGNT_DIR, file), 'utf8');
    const lines = content.split('\n');
    
    // Find the first valid line to determine book ID
    const firstLine = lines.find(l => l.trim().length > 0);
    if (!firstLine) return;

    const firstParts = firstLine.trim().split(/\s+/);
    const bookCode = firstParts[0].substring(0, 2); 
    const bookId = NUMERIC_BOOK_MAP[bookCode];

    if (!bookId) {
        return;
    }

    console.log(`Processing ${bookId} from ${file}...`);

    let xmlOutput = `<?xml version="1.0" encoding="UTF-8"?>\n<osis><osisText xml:lang="grc" osisIDWork="SBLGNT">\n<div type="book" osisID="${bookId}">\n`;
    
    let currentChapter = null;
    let currentVerse = null;
    let wordCount = 0;

    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 7) return;

        // Parse Reference: 070101 -> Book 07, Ch 01, Vs 01
        const refCode = parts[0]; 
        const morph = parts[2]; 
        const text = parts[3];  
        const lemma = parts[6]; 

        const ch = parseInt(refCode.substring(2, 4)).toString(); 
        const vs = parseInt(refCode.substring(4, 6)).toString(); 

        // --- CHANGE CHAPTER ---
        if (ch !== currentChapter) {
            if (currentChapter) {
                // Close the last verse of the previous chapter if it's open
                if (currentVerse) xmlOutput += `</verse>`;
                xmlOutput += `</p></chapter>\n`;
            }
            xmlOutput += `<chapter osisID="${bookId}.${ch}"><p>\n`;
            currentChapter = ch;
            currentVerse = null;
        }

        // --- CHANGE VERSE ---
        if (vs !== currentVerse) {
            // Close the previous verse (if we are not at the very start of a chapter)
            if (currentVerse) xmlOutput += `</verse>\n`;
            
            xmlOutput += `<verse osisID="${bookId}.${ch}.${vs}"><verse-number>${ch}:${vs}</verse-number> `;
            currentVerse = vs;
        }

        const strongsId = strongsMap[lemma] || ""; 
        xmlOutput += `<w lemma="${strongsId}" morph="${morph}">${text}</w> `;
        wordCount++;
    });

    // Close final tags
    if (currentVerse) xmlOutput += `</verse>`;
    xmlOutput += `</p></chapter>\n</div>\n</osisText></osis>`;
    
    fs.writeFileSync(path.join(OUTPUT_DIR, `${bookId}.xml`), xmlOutput);
    console.log(`✅ Generated ${bookId}.xml (${wordCount} words)`);
    processedCount++;
});

if (processedCount === 0) {
    console.error("❌ ERROR: No files processed.");
} else {
    console.log(`\n🎉 SUCCESS: Processed ${processedCount} books.`);
}