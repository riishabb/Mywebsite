# Browser library assets

These production files are hosted locally so document processing remains reliable on the static site. User files are processed only in the browser.

| Library | Version | License | Purpose |
| --- | --- | --- | --- |
| pdf-lib | 1.17.1 | MIT | PDF page organization |
| PDF.js | 3.11.174 | Apache-2.0 | PDF inspection and page rendering |
| jsPDF | 2.5.1 | MIT | Browser PDF generation |
| JSZip | 3.10.1 | MIT or GPL-3.0-or-later | Multi-file downloads and DOCX support |
| html2canvas | 1.4.1 | MIT | HTML and DOCX preview rendering |
| Tesseract.js | 6.0.1 | Apache-2.0 | Local OCR for scanned PDF-to-Word/Excel conversion |
| docx-preview | 0.3.6 | Apache-2.0 | DOCX browser preview |

The filenames include pinned versions. Corresponding license terms remain available from each package’s published distribution.

PDF-to-Office downloads the pinned Tesseract.js 6.0.0 WASM core and the selected Tesseract language data from jsDelivr only when OCR is needed. The JavaScript entry and worker are hosted here. These requests download program/model assets; document contents are never uploaded. English, Nepali + English and Hindi + English are selectable. DOCX and XLSX are generated locally with JSZip and Office Open XML.
