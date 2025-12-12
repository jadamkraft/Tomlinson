
export const BIBLE_BOOKS: Record<string, string> = {
  "Gen": "Genesis",
  "Exod": "Exodus",
  "Lev": "Leviticus",
  "Num": "Numbers",
  "Deut": "Deuteronomy",
  "Josh": "Joshua",
  "Judg": "Judges",
  "Ruth": "Ruth",
  "1Sam": "1 Samuel",
  "2Sam": "2 Samuel",
  "1Kgs": "1 Kings",
  "2Kgs": "2 Kings",
  "1Chr": "1 Chronicles",
  "2Chr": "2 Chronicles",
  "Ezra": "Ezra",
  "Neh": "Nehemiah",
  "Esth": "Esther",
  "Job": "Job",
  "Ps": "Psalms",
  "Prov": "Proverbs",
  "Eccl": "Ecclesiastes",
  "Song": "Song of Solomon",
  "Isa": "Isaiah",
  "Jer": "Jeremiah",
  "Lam": "Lamentations",
  "Ezek": "Ezekiel",
  "Dan": "Daniel",
  "Hos": "Hosea",
  "Joel": "Joel",
  "Amos": "Amos",
  "Obad": "Obadiah",
  "Jonah": "Jonah",
  "Mic": "Micah",
  "Nah": "Nahum",
  "Hab": "Habakkuk",
  "Zeph": "Zephaniah",
  "Hag": "Haggar",
  "Zech": "Zechariah",
  "Mal": "Malachi",
  "Matt": "Matthew",
  "Mark": "Mark",
  "Luke": "Luke",
  "John": "John",
  "Acts": "Acts",
  "Rom": "Romans",
  "1Cor": "1 Corinthians",
  "2Cor": "2 Corinthians",
  "Gal": "Galatians",
  "Eph": "Ephesians",
  "Phil": "Philippians",
  "Col": "Colossians",
  "1Thess": "1 Thessalonians",
  "2Thess": "2 Thessalonians",
  "1Tim": "1 Timothy",
  "2Tim": "2 Timothy",
  "Titus": "Titus",
  "Phlm": "Philemon",
  "Heb": "Hebrews",
  "Jas": "James",
  "1Pet": "1 Peter",
  "2Pet": "2 Peter",
  "1John": "1 John",
  "2John": "2 John",
  "3John": "3 John",
  "Jude": "Jude",
  "Rev": "Revelation"
};

export const SHORT_TO_OSIS: Record<string, string> = {
  "gn": "Gen", "gen": "Gen",
  "jn": "John", "john": "John",
  "mt": "Matt", "matt": "Matt",
  "mk": "Mark", "mark": "Mark",
  "lk": "Luke", "luke": "Luke",
  "ro": "Rom", "rom": "Rom"
};

// Updated with provided sample XML
export const BIBLE_SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<osis xmlns="http://www.bibletechnologies.net/2003/OSIS/namespace" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.bibletechnologies.net/2003/OSIS/namespace http://www.bibletechnologies.net/osisCore.2.1.1.xsd">
  <osisText xml:lang="he" osisIDWork="BibleWorksClone" osisRefWork="Bible">
    <header>
      <work osisWork="Strong" xml:lang="en">
         <refSystem>Dict.Strongs</refSystem>
      </work>
    </header>
    
    <div type="book" osisID="Gen">
      <chapter osisID="Gen.1">
        <verse osisID="Gen.1.1">
          <w lemma="b/7225" n="1.0" morph="HR/Ncfsa" id="01xeN">בְּ/רֵאשִׁ֖ית</w>
          <w lemma="1254 a" morph="HVqp3ms" id="01Nvk">בָּרָ֣א</w>
          <w lemma="430" n="1" morph="HNcmpa" id="01TyA">אֱלֹהִ֑ים</w>
          <w lemma="853" morph="HTo" id="01vuQ">אֵ֥ת</w>
          <w lemma="d/8064" n="0.0" morph="HTd/Ncmpa" id="01TSc">הַ/שָּׁמַ֖יִם</w>
          <w lemma="c/853" morph="HC/To" id="01k5P">וְ/אֵ֥ת</w>
          <w lemma="d/776" n="0" morph="HTd/Ncbsa" id="01nPh">הָ/אָֽרֶץ</w>
          <seg type="x-sof-pasuq">׃</seg>
        </verse>
      </chapter>
    </div>

    <div type="book" osisID="John">
      <chapter osisID="John.1">
        <verse osisID="John.1.1">
          <w lemma="1722" morph="PREP" id="n1">Ἐν</w>
          <w lemma="746" morph="N-DSF" id="n2">ἀρχῇ</w>
          <w lemma="1510" morph="V-IAI-3S" id="n3">ἦν</w>
          <w lemma="3588" morph="T-NSM" id="n4">ὁ</w>
          <w lemma="3056" morph="N-NSM" id="n5">λόγος</w>
        </verse>
      </chapter>
    </div>

  </osisText>
</osis>`;
