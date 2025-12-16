export const BIBLE_BOOKS: Record<string, string> = {
  Gen: "Genesis",
  Exod: "Exodus",
  Lev: "Leviticus",
  Num: "Numbers",
  Deut: "Deuteronomy",
  Josh: "Joshua",
  Judg: "Judges",
  Ruth: "Ruth",
  "1Sam": "1 Samuel",
  "2Sam": "2 Samuel",
  "1Kgs": "1 Kings",
  "2Kgs": "2 Kings",
  "1Chr": "1 Chronicles",
  "2Chr": "2 Chronicles",
  Ezra: "Ezra",
  Neh: "Nehemiah",
  Esth: "Esther",
  Job: "Job",
  Ps: "Psalms",
  Prov: "Proverbs",
  Eccl: "Ecclesiastes",
  Song: "Song of Solomon",
  Isa: "Isaiah",
  Jer: "Jeremiah",
  Lam: "Lamentations",
  Ezek: "Ezekiel",
  Dan: "Daniel",
  Hos: "Hosea",
  Joel: "Joel",
  Amos: "Amos",
  Obad: "Obadiah",
  Jonah: "Jonah",
  Mic: "Micah",
  Nah: "Nahum",
  Hab: "Habakkuk",
  Zeph: "Zephaniah",
  Hag: "Haggai",
  Zech: "Zechariah",
  Mal: "Malachi",
  Matt: "Matthew",
  Mark: "Mark",
  Luke: "Luke",
  John: "John",
  Acts: "Acts",
  Rom: "Romans",
  "1Cor": "1 Corinthians",
  "2Cor": "2 Corinthians",
  Gal: "Galatians",
  Eph: "Ephesians",
  Phil: "Philippians",
  Col: "Colossians",
  "1Thess": "1 Thessalonians",
  "2Thess": "2 Thessalonians",
  "1Tim": "1 Timothy",
  "2Tim": "2 Timothy",
  Titus: "Titus",
  Phlm: "Philemon",
  Heb: "Hebrews",
  Jas: "James",
  "1Pet": "1 Peter",
  "2Pet": "2 Peter",
  "1John": "1 John",
  "2John": "2 John",
  "3John": "3 John",
  Jude: "Jude",
  Rev: "Revelation",
};

export const BIBLE_STRUCTURE: Record<string, { chapters: number }> = {
  Genesis: { chapters: 50 },
  Exodus: { chapters: 40 },
  Leviticus: { chapters: 27 },
  Numbers: { chapters: 36 },
  Deuteronomy: { chapters: 34 },
  Joshua: { chapters: 24 },
  Judges: { chapters: 21 },
  Ruth: { chapters: 4 },
  "1 Samuel": { chapters: 31 },
  "2 Samuel": { chapters: 24 },
  "1 Kings": { chapters: 22 },
  "2 Kings": { chapters: 25 },
  "1 Chronicles": { chapters: 29 },
  "2 Chronicles": { chapters: 36 },
  Ezra: { chapters: 10 },
  Nehemiah: { chapters: 13 },
  Esther: { chapters: 10 },
  Job: { chapters: 42 },
  Psalms: { chapters: 150 },
  Proverbs: { chapters: 31 },
  Ecclesiastes: { chapters: 12 },
  "Song of Solomon": { chapters: 8 },
  Isaiah: { chapters: 66 },
  Jeremiah: { chapters: 52 },
  Lamentations: { chapters: 5 },
  Ezekiel: { chapters: 48 },
  Daniel: { chapters: 12 },
  Hosea: { chapters: 14 },
  Joel: { chapters: 3 },
  Amos: { chapters: 9 },
  Obadiah: { chapters: 1 },
  Jonah: { chapters: 4 },
  Micah: { chapters: 7 },
  Nahum: { chapters: 3 },
  Habakkuk: { chapters: 3 },
  Zephaniah: { chapters: 3 },
  Haggai: { chapters: 2 },
  Zechariah: { chapters: 14 },
  Malachi: { chapters: 4 },
  Matthew: { chapters: 28 },
  Mark: { chapters: 16 },
  Luke: { chapters: 24 },
  John: { chapters: 21 },
  Acts: { chapters: 28 },
  Romans: { chapters: 16 },
  "1 Corinthians": { chapters: 16 },
  "2 Corinthians": { chapters: 13 },
  Galatians: { chapters: 6 },
  Ephesians: { chapters: 6 },
  Philippians: { chapters: 4 },
  Colossians: { chapters: 4 },
  "1 Thessalonians": { chapters: 5 },
  "2 Thessalonians": { chapters: 3 },
  "1 Timothy": { chapters: 6 },
  "2 Timothy": { chapters: 4 },
  Titus: { chapters: 3 },
  Philemon: { chapters: 1 },
  Hebrews: { chapters: 13 },
  James: { chapters: 5 },
  "1 Peter": { chapters: 5 },
  "2 Peter": { chapters: 3 },
  "1 John": { chapters: 5 },
  "2 John": { chapters: 1 },
  "3 John": { chapters: 1 },
  Jude: { chapters: 1 },
  Revelation: { chapters: 22 },
};

export const SHORT_TO_OSIS: Record<string, string> = {
  // OT
  gn: "Gen",
  gen: "Gen",
  ex: "Exod",
  exod: "Exod",
  lv: "Lev",
  lev: "Lev",
  nm: "Num",
  num: "Num",
  dt: "Deut",
  deut: "Deut",
  js: "Josh",
  josh: "Josh",
  jg: "Judg",
  judg: "Judg",
  ru: "Ruth",
  ruth: "Ruth",
  "1sa": "1Sam",
  "1sam": "1Sam",
  "2sa": "2Sam",
  "2sam": "2Sam",
  "1ki": "1Kgs",
  "1kings": "1Kgs",
  "2ki": "2Kgs",
  "2kings": "2Kgs",
  "1ch": "1Chr",
  "1chron": "1Chr",
  "2ch": "2Chr",
  "2chron": "2Chr",
  ez: "Ezra",
  ezra: "Ezra",
  ne: "Neh",
  neh: "Neh",
  es: "Esth",
  esth: "Esth",
  jb: "Job",
  job: "Job",
  ps: "Ps",
  psa: "Ps",
  psalm: "Ps",
  psalms: "Ps",
  pr: "Prov",
  prov: "Prov",
  ec: "Eccl",
  eccl: "Eccl",
  so: "Song",
  song: "Song",
  sos: "Song",
  is: "Isa",
  isa: "Isa",
  je: "Jer",
  jer: "Jer",
  la: "Lam",
  lam: "Lam",
  ek: "Ezek",
  ezek: "Ezek",
  da: "Dan",
  dan: "Dan",
  ho: "Hos",
  hos: "Hos",
  jl: "Joel",
  joel: "Joel",
  am: "Amos",
  amos: "Amos",
  ob: "Obad",
  obad: "Obad",
  jn: "John",
  john: "John", // Keep common collision
  jon: "Jonah",
  jonah: "Jonah",
  mi: "Mic",
  mic: "Mic",
  na: "Nah",
  nah: "Nah",
  hb: "Hab",
  hab: "Hab",
  ze: "Zeph",
  zeph: "Zeph",
  hg: "Hag",
  hag: "Hag",
  zc: "Zech",
  zech: "Zech",
  ma: "Mal",
  mal: "Mal",

  // NT
  mt: "Matt",
  matt: "Matt",
  mk: "Mark",
  mark: "Mark",
  lk: "Luke",
  luke: "Luke",
  jo: "John",
  joh: "John",
  ac: "Acts",
  acts: "Acts",
  ro: "Rom",
  rom: "Rom",
  "1co": "1Cor",
  "1cor": "1Cor",
  "2co": "2Cor",
  "2cor": "2Cor",
  ga: "Gal",
  gal: "Gal",
  ep: "Eph",
  eph: "Eph",
  ph: "Phil",
  phil: "Phil",
  philippians: "Phil",
  php: "Phil",
  co: "Col",
  col: "Col",
  "1th": "1Thess",
  "1thess": "1Thess",
  "2th": "2Thess",
  "2thess": "2Thess",
  "1ti": "1Tim",
  "1tim": "1Tim",
  "2ti": "2Tim",
  "2tim": "2Tim",
  ti: "Titus",
  tit: "Titus",
  phm: "Phlm",
  phlm: "Phlm",
  he: "Heb",
  heb: "Heb",
  ja: "Jas",
  jas: "Jas",
  "1pe": "1Pet",
  "1pet": "1Pet",
  "2pe": "2Pet",
  "2pet": "2Pet",
  "1jo": "1John",
  "1jn": "1John",
  "2jo": "2John",
  "2jn": "2John",
  "3jo": "3John",
  "3jn": "3John",
  jd: "Jude",
  jude: "Jude",
  re: "Rev",
  rev: "Rev",
};

/**
 * Comprehensive mapping from book identifiers (OSIS IDs, full names, abbreviations, lowercase variants)
 * to their exact filenames in the assets folder.
 * This is the single source of truth for book-to-filename resolution.
 */
export const BOOK_FILENAME_MAPPING: Record<string, string> = {
  // Old Testament - Genesis
  Genesis: "Gen.xml",
  Gen: "Gen.xml",
  genesis: "Gen.xml",
  gen: "Gen.xml",
  gn: "Gen.xml",

  // Old Testament - Exodus
  Exodus: "Exod.xml",
  Exod: "Exod.xml",
  exodus: "Exod.xml",
  exod: "Exod.xml",
  ex: "Exod.xml",

  // Old Testament - Leviticus
  Leviticus: "Lev.xml",
  Lev: "Lev.xml",
  leviticus: "Lev.xml",
  lev: "Lev.xml",
  lv: "Lev.xml",

  // Old Testament - Numbers
  Numbers: "Num.xml",
  Num: "Num.xml",
  numbers: "Num.xml",
  num: "Num.xml",
  nm: "Num.xml",

  // Old Testament - Deuteronomy
  Deuteronomy: "Deut.xml",
  Deut: "Deut.xml",
  deuteronomy: "Deut.xml",
  deut: "Deut.xml",
  dt: "Deut.xml",

  // Old Testament - Joshua
  Joshua: "Josh.xml",
  Josh: "Josh.xml",
  joshua: "Josh.xml",
  josh: "Josh.xml",
  js: "Josh.xml",

  // Old Testament - Judges
  Judges: "Judg.xml",
  Judg: "Judg.xml",
  judges: "Judg.xml",
  judg: "Judg.xml",
  jg: "Judg.xml",

  // Old Testament - Ruth
  Ruth: "Ruth.xml",
  ruth: "Ruth.xml",
  ru: "Ruth.xml",

  // Old Testament - 1 Samuel
  "1Samuel": "1Sam.xml",
  "1Sam": "1Sam.xml",
  "1 Samuel": "1Sam.xml",
  "1samuel": "1Sam.xml",
  "1sam": "1Sam.xml",
  "1sa": "1Sam.xml",

  // Old Testament - 2 Samuel
  "2Samuel": "2Sam.xml",
  "2Sam": "2Sam.xml",
  "2 Samuel": "2Sam.xml",
  "2samuel": "2Sam.xml",
  "2sam": "2Sam.xml",
  "2sa": "2Sam.xml",

  // Old Testament - 1 Kings
  "1Kings": "1Kgs.xml",
  "1Kgs": "1Kgs.xml",
  "1 Kings": "1Kgs.xml",
  "1kings": "1Kgs.xml",
  "1kgs": "1Kgs.xml",
  "1ki": "1Kgs.xml",
  "1kg": "1Kgs.xml",

  // Old Testament - 2 Kings
  "2Kings": "2Kgs.xml",
  "2Kgs": "2Kgs.xml",
  "2 Kings": "2Kgs.xml",
  "2kings": "2Kgs.xml",
  "2kgs": "2Kgs.xml",
  "2ki": "2Kgs.xml",
  "2kg": "2Kgs.xml",

  // Old Testament - 1 Chronicles
  "1Chronicles": "1Chr.xml",
  "1Chr": "1Chr.xml",
  "1 Chronicles": "1Chr.xml",
  "1chronicles": "1Chr.xml",
  "1chr": "1Chr.xml",
  "1ch": "1Chr.xml",
  "1chron": "1Chr.xml",

  // Old Testament - 2 Chronicles
  "2Chronicles": "2Chr.xml",
  "2Chr": "2Chr.xml",
  "2 Chronicles": "2Chr.xml",
  "2chronicles": "2Chr.xml",
  "2chr": "2Chr.xml",
  "2ch": "2Chr.xml",
  "2chron": "2Chr.xml",

  // Old Testament - Ezra
  Ezra: "Ezra.xml",
  ezra: "Ezra.xml",
  ez: "Ezra.xml",

  // Old Testament - Nehemiah
  Nehemiah: "Neh.xml",
  Neh: "Neh.xml",
  nehemiah: "Neh.xml",
  neh: "Neh.xml",
  ne: "Neh.xml",

  // Old Testament - Esther
  Esther: "Esth.xml",
  Esth: "Esth.xml",
  esther: "Esth.xml",
  esth: "Esth.xml",
  es: "Esth.xml",

  // Old Testament - Job
  Job: "Job.xml",
  job: "Job.xml",
  jb: "Job.xml",

  // Old Testament - Psalms
  Psalms: "Ps.xml",
  Ps: "Ps.xml",
  psalms: "Ps.xml",
  ps: "Ps.xml",
  psa: "Ps.xml",
  psalm: "Ps.xml",

  // Old Testament - Proverbs
  Proverbs: "Prov.xml",
  Prov: "Prov.xml",
  proverbs: "Prov.xml",
  prov: "Prov.xml",
  pr: "Prov.xml",

  // Old Testament - Ecclesiastes
  Ecclesiastes: "Eccl.xml",
  Eccl: "Eccl.xml",
  ecclesiastes: "Eccl.xml",
  eccl: "Eccl.xml",
  ec: "Eccl.xml",

  // Old Testament - Song of Solomon
  "Song of Solomon": "Song.xml",
  Song: "Song.xml",
  "song of solomon": "Song.xml",
  song: "Song.xml",
  so: "Song.xml",
  sos: "Song.xml",

  // Old Testament - Isaiah
  Isaiah: "Isa.xml",
  Isa: "Isa.xml",
  isaiah: "Isa.xml",
  isa: "Isa.xml",
  is: "Isa.xml",

  // Old Testament - Jeremiah
  Jeremiah: "Jer.xml",
  Jer: "Jer.xml",
  jeremiah: "Jer.xml",
  jer: "Jer.xml",
  je: "Jer.xml",

  // Old Testament - Lamentations
  Lamentations: "Lam.xml",
  Lam: "Lam.xml",
  lamentations: "Lam.xml",
  lam: "Lam.xml",
  la: "Lam.xml",

  // Old Testament - Ezekiel
  Ezekiel: "Ezek.xml",
  Ezek: "Ezek.xml",
  ezekiel: "Ezek.xml",
  ezek: "Ezek.xml",
  ek: "Ezek.xml",

  // Old Testament - Daniel
  Daniel: "Dan.xml",
  Dan: "Dan.xml",
  daniel: "Dan.xml",
  dan: "Dan.xml",
  da: "Dan.xml",

  // Old Testament - Hosea
  Hosea: "Hos.xml",
  Hos: "Hos.xml",
  hosea: "Hos.xml",
  hos: "Hos.xml",
  ho: "Hos.xml",

  // Old Testament - Joel
  Joel: "Joel.xml",
  joel: "Joel.xml",
  jl: "Joel.xml",

  // Old Testament - Amos
  Amos: "Amos.xml",
  amos: "Amos.xml",
  am: "Amos.xml",

  // Old Testament - Obadiah
  Obadiah: "Obad.xml",
  Obad: "Obad.xml",
  obadiah: "Obad.xml",
  obad: "Obad.xml",
  ob: "Obad.xml",

  // Old Testament - Jonah
  Jonah: "Jonah.xml",
  jonah: "Jonah.xml",
  jon: "Jonah.xml",

  // Old Testament - Micah
  Micah: "Mic.xml",
  Mic: "Mic.xml",
  micah: "Mic.xml",
  mic: "Mic.xml",
  mi: "Mic.xml",

  // Old Testament - Nahum
  Nahum: "Nah.xml",
  Nah: "Nah.xml",
  nahum: "Nah.xml",
  nah: "Nah.xml",
  na: "Nah.xml",

  // Old Testament - Habakkuk
  Habakkuk: "Hab.xml",
  Hab: "Hab.xml",
  habakkuk: "Hab.xml",
  hab: "Hab.xml",
  hb: "Hab.xml",

  // Old Testament - Zephaniah
  Zephaniah: "Zeph.xml",
  Zeph: "Zeph.xml",
  zephaniah: "Zeph.xml",
  zeph: "Zeph.xml",
  ze: "Zeph.xml",

  // Old Testament - Haggai
  Haggai: "Hag.xml",
  Hag: "Hag.xml",
  haggai: "Hag.xml",
  hag: "Hag.xml",
  hg: "Hag.xml",

  // Old Testament - Zechariah
  Zechariah: "Zech.xml",
  Zech: "Zech.xml",
  zechariah: "Zech.xml",
  zech: "Zech.xml",
  zc: "Zech.xml",

  // Old Testament - Malachi
  Malachi: "Mal.xml",
  Mal: "Mal.xml",
  malachi: "Mal.xml",
  mal: "Mal.xml",
  ma: "Mal.xml",

  // New Testament - Matthew
  Matthew: "Matt.xml",
  Matt: "Matt.xml",
  matthew: "Matt.xml",
  matt: "Matt.xml",
  Mt: "Matt.xml",
  mt: "Matt.xml",

  // New Testament - Mark
  Mark: "Mark.xml",
  mark: "Mark.xml",
  Mk: "Mark.xml",
  mk: "Mark.xml",

  // New Testament - Luke
  Luke: "Luke.xml",
  luke: "Luke.xml",
  Lk: "Luke.xml",
  lk: "Luke.xml",

  // New Testament - John
  John: "John.xml",
  john: "John.xml",
  Jn: "John.xml",
  jn: "John.xml",
  jo: "John.xml",
  joh: "John.xml",

  // New Testament - Acts
  Acts: "Acts.xml",
  acts: "Acts.xml",
  ac: "Acts.xml",

  // New Testament - Romans
  Romans: "Rom.xml",
  Rom: "Rom.xml",
  romans: "Rom.xml",
  rom: "Rom.xml",
  ro: "Rom.xml",

  // New Testament - 1 Corinthians
  "1Corinthians": "1Cor.xml",
  "1Cor": "1Cor.xml",
  "1 Corinthians": "1Cor.xml",
  "1corinthians": "1Cor.xml",
  "1cor": "1Cor.xml",
  "1co": "1Cor.xml",

  // New Testament - 2 Corinthians
  "2Corinthians": "2Cor.xml",
  "2Cor": "2Cor.xml",
  "2 Corinthians": "2Cor.xml",
  "2corinthians": "2Cor.xml",
  "2cor": "2Cor.xml",
  "2co": "2Cor.xml",

  // New Testament - Galatians
  Galatians: "Gal.xml",
  Gal: "Gal.xml",
  galatians: "Gal.xml",
  gal: "Gal.xml",
  ga: "Gal.xml",

  // New Testament - Ephesians
  Ephesians: "Eph.xml",
  Eph: "Eph.xml",
  ephesians: "Eph.xml",
  eph: "Eph.xml",
  ep: "Eph.xml",

  // New Testament - Philippians
  Philippians: "Phil.xml",
  Phil: "Phil.xml",
  philippians: "Phil.xml",
  phil: "Phil.xml",
  ph: "Phil.xml",
  Php: "Phil.xml",
  php: "Phil.xml",

  // New Testament - Colossians
  Colossians: "Col.xml",
  Col: "Col.xml",
  colossians: "Col.xml",
  col: "Col.xml",
  co: "Col.xml",

  // New Testament - 1 Thessalonians
  "1Thessalonians": "1Thess.xml",
  "1Thess": "1Thess.xml",
  "1 Thessalonians": "1Thess.xml",
  "1thessalonians": "1Thess.xml",
  "1thess": "1Thess.xml",
  "1th": "1Thess.xml",

  // New Testament - 2 Thessalonians
  "2Thessalonians": "2Thess.xml",
  "2Thess": "2Thess.xml",
  "2 Thessalonians": "2Thess.xml",
  "2thessalonians": "2Thess.xml",
  "2thess": "2Thess.xml",
  "2th": "2Thess.xml",

  // New Testament - 1 Timothy
  "1Timothy": "1Tim.xml",
  "1Tim": "1Tim.xml",
  "1 Timothy": "1Tim.xml",
  "1timothy": "1Tim.xml",
  "1tim": "1Tim.xml",
  "1ti": "1Tim.xml",

  // New Testament - 2 Timothy
  "2Timothy": "2Tim.xml",
  "2Tim": "2Tim.xml",
  "2 Timothy": "2Tim.xml",
  "2timothy": "2Tim.xml",
  "2tim": "2Tim.xml",
  "2ti": "2Tim.xml",

  // New Testament - Titus
  Titus: "Titus.xml",
  titus: "Titus.xml",
  ti: "Titus.xml",
  tit: "Titus.xml",

  // New Testament - Philemon
  Philemon: "Phlm.xml",
  Phlm: "Phlm.xml",
  philemon: "Phlm.xml",
  phlm: "Phlm.xml",
  Philem: "Phlm.xml",
  philem: "Phlm.xml",
  phm: "Phlm.xml",

  // New Testament - Hebrews
  Hebrews: "Heb.xml",
  Heb: "Heb.xml",
  hebrews: "Heb.xml",
  heb: "Heb.xml",
  he: "Heb.xml",

  // New Testament - James
  James: "Jas.xml",
  Jas: "Jas.xml",
  james: "Jas.xml",
  jas: "Jas.xml",
  ja: "Jas.xml",

  // New Testament - 1 Peter
  "1Peter": "1Pet.xml",
  "1Pet": "1Pet.xml",
  "1 Peter": "1Pet.xml",
  "1peter": "1Pet.xml",
  "1pet": "1Pet.xml",
  "1pe": "1Pet.xml",

  // New Testament - 2 Peter
  "2Peter": "2Pet.xml",
  "2Pet": "2Pet.xml",
  "2 Peter": "2Pet.xml",
  "2peter": "2Pet.xml",
  "2pet": "2Pet.xml",
  "2pe": "2Pet.xml",

  // New Testament - 1 John
  "1John": "1John.xml",
  "1 John": "1John.xml",
  "1john": "1John.xml",
  "1jo": "1John.xml",
  "1jn": "1John.xml",

  // New Testament - 2 John
  "2John": "2John.xml",
  "2 John": "2John.xml",
  "2john": "2John.xml",
  "2jo": "2John.xml",
  "2jn": "2John.xml",

  // New Testament - 3 John
  "3John": "3John.xml",
  "3 John": "3John.xml",
  "3john": "3John.xml",
  "3jo": "3John.xml",
  "3jn": "3John.xml",

  // New Testament - Jude
  Jude: "Jude.xml",
  jude: "Jude.xml",
  jd: "Jude.xml",

  // New Testament - Revelation
  Revelation: "Rev.xml",
  Rev: "Rev.xml",
  revelation: "Rev.xml",
  rev: "Rev.xml",
  re: "Rev.xml",
};
