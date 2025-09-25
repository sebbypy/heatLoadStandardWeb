

function getElementsToRender() {

    const parentDiv = document.querySelector(".content"); // Replace with your target div
    var elements = parentDiv.querySelectorAll("h1, h2, h3, table:not(table table),p, span:not(table span), select:not(table select), input:not(table input)");
    var reorderedElements = moveElementById(Array.from(elements), "heatloss_table", 1);
    reorderedElements = moveElementById(Array.from(reorderedElements), "results_header", 1);
    return reorderedElements
}

class DocumentWriter {
    constructor() {
        if (new.target === DocumentWriter) {
            throw new Error("DocumentWriter is abstract and cannot be instantiated directly");
        }
    }

    async export() {
		
		await this.writeHeader()

        var reorderedElements = getElementsToRender()
            var divsToSkip = evaluateDivsToSkip()
            prepareForExport()

            for (const element of reorderedElements) {
                if (window.getComputedStyle(element).display === "none") {
                    continue;
                }

                //depending on element prop, we may have conditional page break
                this.checkPageBreak(element)

                if (divsToSkip.some(divid => document.getElementById(divid).contains(element))) {
                    continue;
                }

                if (["H1", "H2", "H3"].includes(element.tagName)) {
                    this.writeHeading(element)
                } else if (element.tagName === "TABLE") {
                    this.writeTable(element)
                } else if (element.tagName === "SELECT") {
                    this.writeSelect(element)
                } else if (element.tagName === "P") {
                    this.writeParagraph(element)
                }
            }
            this.exportFile()

    }

    writeHeading() {
        throw new Error("writeHeading() must be implemented by subclass");
    }

    writeSelect() {
        throw new Error("writeSelect() must be implemented by subclass");
    }

    writeParagraph() {
        throw new Error("writeParagraph() must be implemented by subclass");
    }

    writeTable() {
        throw new Error("writeTable() must be implemented by subclass");
    }

    async exportFile() {}

    newPage(orientation) {}

    checkPageBreak(el) {

        //function checkFloorSection(pdf,yPosition,el){

        if (el.hasAttribute("lang-key")) {

            if (el.getAttribute("lang-key") == "floor_heating") {
                this.newPage("landscape")
				}

            if (el.getAttribute("lang-key") == "floorsystems") {
                this.newPage("portrait")
				
            }

        }
    }
	
	writeHeader(){}

}

class PdfWriter extends DocumentWriter {
    constructor() {
        super();

        const {
            jsPDF
        } = window.jspdf;
        //const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size
        this.pdf = new jsPDF('p', 'mm', 'a4')

            this.pdf.setFont("Roboto")
            this.pageWidth = 180; // Max width for text (A4 = 210mm, with margins)
        this.pageHeight = 280; // A4 page height (297mm, leaving bottom margin)
        this.yPosition = 60; // Start Y position for content

        //to re-introduce later
        //await addLogos(pdf)


    }

    writeHeading(element) {

        this.blackText()
        this.pdf.setFont("Roboto", "bold")

        //this.checkNewPage()
        this.checkNewPage()

        var sizes = {
            "H1": 16,
            "H2": 14,
            "H3": 12
        }

        this.pdf.setFontSize(sizes[element.tagName]);
        //pdf.setFontSize(element.tagName === "H3" ? 24 : 18);
        this.pdf.text(element.innerText, 15, this.yPosition);
        this.yPosition += 10;
        this.pdf.setFont("Roboto", "normal")

    }

    writeSelect(element) {

        this.highlightText()

        // Get only the selected option from a <select>
        //const label = element.getAttribute("name") || element.id || "Dropdown";
        const selectedText = element.options[element.selectedIndex].text;

        this.checkNewPage()

        this.pdf.setFontSize(10);
        this.pdf.text(`${selectedText}`, 15, this.yPosition);
        this.yPosition += 10;

    }

    writeParagraph(element) {
        // TODO: implement PDF paragraph rendering
        this.pdf.setFontSize(10);

        var lastX = 15
            this.checkNewPage()

            const subElements = element.querySelectorAll("span,input")

            var textToWrite = ""

            subElements.forEach(subel => {

                if (window.getComputedStyle(subel).display === "none") {
                    return; // Skip this iteration
                }

                if (subel.tagName === "SPAN") {
                    this.blackText()
                    textToWrite = subel.innerText

                } else if (subel.tagName === "INPUT") {
                    this.highlightText()
                    textToWrite = subel.value

                        if (subel.type == "checkbox") {
                            textToWrite = subel.checked ? translate("yes") : translate("no")
                        }

                }
                this.pdf.text(`${textToWrite}`, lastX, this.yPosition);
                const textWidth = this.pdf.getTextWidth(textToWrite);
                lastX += textWidth + 2

            })
            this.yPosition += 10;
    }

    writeTable(element) {

        const [processedTable, colorTable] = extractTableFields(element)

            // Ensure page split before adding table if needed
            this.checkNewPage()

            this.pdf.autoTable({
                head: [processedTable[0]], // First row as header (unchanged)
                body: processedTable.slice(1), // Remaining rows as data
                styles: {
                    font: "Roboto",
                    halign: "center"
                }, // Default alignment for all columns (center)
                headStyles: {
                    fillColor: [0, 135, 183]
                },
                columnStyles: {
                    0: {
                        halign: "left"
                    }, // First column aligned to the left
                },
                startY: this.yPosition,
                theme: 'grid',
                didParseCell: function (data) {
                    if (data.section === 'body') { // Apply only to the body, not the header
                        data.cell.styles.textColor = colorTable[data.row.index][data.column.index];
                    }

                    /*	// if <sub> or <sub> in cell, skip default text, and we'll redraw it manually
                    const raw = String(data.cell.raw ?? '');
                    if (raw.includes('<sub>') || raw.includes('<sup>')) {
                    data.cell._parts = parseSubSup(raw);
                    data.cell.text = ['']; // suppress default drawing
                    }
                     */
                },
                /*didDrawCell: (data) => {
                // if there were <sub> or <sups>, there are partes, then manually writing text
                console.log(data)
                const parts = data.cell._parts; if (!parts) return;

                const base = data.table.styles.fontSize || 11;
                const subSize = Math.round(base * 0.7);
                const advance = partsWidth(pdf, parts,base,subSize);

                const dySub = base * 0.25, dySup = base * 0.45;

                const pad = data.cell.styles.cellPadding || 0; // number -> all sides
                const padL = pad, padR = pad, padT = pad, padB = pad;

                let x;
                if (data.cell.styles.halign === 'right') {
                x = data.cell.x + data.cell.width - padR - advance;
                } else if (data.cell.styles.halign === 'center') {
                x = data.cell.x + padL + (data.cell.width - padL - padR - advance) / 2;
                } else { // left/default
                x = data.cell.x + padL;
                }

                let y;
                if (data.cell.styles.valign === 'bottom') {
                y = data.cell.y + data.cell.height - padB - base * 0.25;
                } else if (data.cell.styles.valign === 'top') {
                y = data.cell.y + padT + base * 0.8;
                } else { // middle/default
                y = data.cell.y + data.cell.height / 2 + base * 0.35;
                }


                for (const p of parts) {
                if (!p.v) continue;
                console.log("PV",p.v,x,y)
                if (p.k === 'text') { pdf.setFontSize(base); pdf.text(p.v, x, y); x += pdf.getTextWidth(p.v); }
                else if (p.k === 'sub') { pdf.setFontSize(subSize); pdf.text(p.v, x, y + dySub); x += pdf.getTextWidth(p.v); }
                else if (p.k === 'sup') { pdf.setFontSize(subSize); pdf.text(p.v, x, y - dySup); x += pdf.getTextWidth(p.v); }
                }
                pdf.setFontSize(base);
                }*/
            });

        this.yPosition = this.pdf.autoTable.previous.finalY + 10; // Move position after the table


    }
	
	async writeHeader(){
		// Logo URLs
		const logoURL1 = "https://images.prismic.io/bbri/0f1c879e-8d5e-4201-a0d2-2dbf3bd95d33_Buildwise_Horizontaal_noir_marge.png?auto=compress,format&rect=0,0,2000,500&w=740&h=185";
		const logoURL2 = "https://images.prismic.io/bbri/6cb70e31-2f6b-4657-80b5-a512d17a71c1_heatload_logo.jpg?auto=compress,format";

		// Convert image URLs to Base64 and get aspect ratio
		//const logo1 = await getBase64AndDimensions(logoURL1);
		//const logo2 = await getBase64AndDimensions(logoURL2);
		const logo1 = await getImageAsset(logoURL1,'base64');
		const logo2 = await getImageAsset(logoURL2,'base64');
	
		// Fixed height for logos
		const fixedHeight = 20;

		// Calculate width based on original aspect ratio
		const width1 = (fixedHeight / logo1.height) * logo1.width;
		const width2 = (fixedHeight / logo2.height) * logo2.width;

		// Add images with calculated width to maintain aspect ratio
		this.pdf.addImage(logo1.base64, 'PNG', 10, 10, width1, fixedHeight);
		this.pdf.addImage(logo2.base64, 'JPEG', 120, 10, width2, fixedHeight);

		this.yPosition = 40; // Adjust Y position after logos
		
	}
	

    exportFile() {

        this.addNumbersAndDates()
        this.addWatermark()
        this.pdf.save("exported_content.pdf");
    }

    checkNewPage() {

        if (this.yPosition + 10 > this.pageHeight) {
            this.pdf.addPage();
            this.yPosition = 25;
        }

    }

    newPage(orientation = "portrait") {
        this.pdf.addPage("a4", orientation);
        this.yPosition = 25;
    }

    highlightText() {

        this.pdf.setTextColor(0, 135, 183); // Blue
    }

    blackText() {

        this.pdf.setTextColor(78, 99, 109); // Blue
    }
	
	addNumbersAndDates() {

		var doc = this.pdf

		const date = new Date().toLocaleDateString();

		for (let i = 1; i <= doc.getNumberOfPages(); i++) {
			doc.setPage(i); // Go to the page
			doc.setFontSize(10);
			doc.text(`${i}/${doc.getNumberOfPages()}`, 180, 290);
			doc.text(`Date: ${date}`, 20, 290);
		}
	}

	addWatermark() {

		var doc = this.pdf

		for (let i = 1; i <= doc.getNumberOfPages(); i++) {
			doc.setPage(i); // Go to the page

			doc.saveGraphicsState();

			// Register the graphics state
			const gState = doc.GState({
				opacity: 0.5,
				stroke: 1
			});
			doc.setGState(gState);

			doc.setFontSize(60);
			doc.setTextColor(220, 220, 220)
			doc.text('TEST VERSION', doc.internal.pageSize.width / 3, doc.internal.pageSize.height * 2 / 3, {
				angle: 60
			});
			doc.restoreGraphicsState();
		}

	}


}

// DOCX implementation
class DocxWriter extends DocumentWriter {
    constructor() {
        super();
        //this.docxDoc = docxDoc; // could be an instance of docx.js, PizZip + docxtemplater, etc.
        //const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, WidthType, AlignmentType } = docx;
        this.docx = docx
		this.docParagraphs = [];
		this.sections = [];
		this.sectionProperties =  {page: {size: {orientation: this.docx.PageOrientation.PORTRAIT}}}

    }

    writeHeading(element) {
        const levelMap = {
            H1: this.docx.HeadingLevel.HEADING_1,
            H2: this.docx.HeadingLevel.HEADING_2,
            H3: this.docx.HeadingLevel.HEADING_3,
        };

        this.docParagraphs.push(
            new this.docx.Paragraph({
                text: element.innerText,
                heading: levelMap[element.tagName],
                spacing: {
                    before: 200, // space before (in twentieths of a point)
                    after: 300, // space after (in twentieths of a point)
                },
            }));
    }

    writeSelect(element) {
        const selectedText = element.options[element.selectedIndex].text;
        this.docParagraphs.push(new this.docx.Paragraph({
                children: [new this.docx.TextRun(selectedText)],
            }));

    }

    writeParagraph(element) {
        const subElements = element.querySelectorAll("span, input");
        const paragraphChildren = [];

        subElements.forEach(subel => {
            if (window.getComputedStyle(subel).display === "none")
                return;

            let text = "";
            let runOptions = {};

            if (subel.tagName === "SPAN") {
                text = subel.innerText;
                runOptions = {
                    text
                };
            } else if (subel.tagName === "INPUT") {
                if (subel.type === "checkbox") {
                    text = subel.checked ? translate("yes") : translate("no");
                } else {
                    text = subel.value;
                }
                runOptions = {
                    text,
                    bold: true
                }; // Example: highlight inputs as bold
            }

            paragraphChildren.push(new this.docx.TextRun(runOptions));
        });

        this.docParagraphs.push(new this.docx.Paragraph({
                children: paragraphChildren,
            }));

    }

    writeTable(element) {
        const [processedTable, colorTable] = extractTableFields(element)

            const headers = processedTable[0]
            const bodyRows = processedTable.slice(1);

        const rows = [];

        // Build header row
        const headerRow = new this.docx.TableRow({
            children: headers.map(headerText =>
                new this.docx.TableCell({
                    children: [
                        new this.docx.Paragraph({
                            children: [
                                new this.docx.TextRun({
                                    text: headerText,
                                    bold: true,
                                    color: "FFFFFF", // White text
                                }),
                            ],
                        }),
                    ],
                    shading: {
                        fill: "0087b7", // Your blue (same as you use in PDF)
                    },
                    width: {
                        size: 20,
                        type: this.docx.WidthType.PERCENTAGE
                    },
                })),
        });

        const otherRows = bodyRows.map(row =>
                new this.docx.TableRow({
                    children: row.map(cellText =>
                        new this.docx.TableCell({
                            children: [new this.docx.Paragraph(String(cellText ?? ""))],
                            width: {
                                size: 20,
                                type: this.docx.WidthType.PERCENTAGE
                            }
                        }))
                }));

        this.docParagraphs.push(new this.docx.Table({
                rows: [headerRow, ...otherRows],
                width: {
                    size: 100,
                    type: this.docx.WidthType.PERCENTAGE,
                },
                alignment: this.docx.AlignmentType.CENTER,
            }));

    }

    async exportFile() {
		//push last section
		this.sections.push(
			{
				properties:this.sectionProperties,
				children: this.docParagraphs
			}
			)



        // Create document
        const doc = new this.docx.Document({
            sections: this.sections,
        });

        // Generate and download
        const blob = await this.docx.Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "export.docx";
        a.click();
        URL.revokeObjectURL(url);

    }
	
	newPage(orientation = "portrait") {
		
        //this.pdf.addPage("a4", orientation);
        //this.yPosition = 25;
		this.sections.push(
			{
				properties:this.sectionProperties,
				children: this.docParagraphs
			}
			)
		
		this.docParagraphs = []
		
		if (orientation == "landscape"){
			this.sectionProperties =  {page: {size: {orientation: this.docx.PageOrientation.LANDSCAPE}}}
		}
		else{
			this.sectionProperties =  {page: {size: {orientation: this.docx.PageOrientation.PORTRAIT}}}
		}

		
    }
	
	async writeHeader(){
		
		// Logo URLs
		const logoURL1 = "https://images.prismic.io/bbri/0f1c879e-8d5e-4201-a0d2-2dbf3bd95d33_Buildwise_Horizontaal_noir_marge.png?auto=compress,format&rect=0,0,2000,500&w=740&h=185";
		const logoURL2 = "https://images.prismic.io/bbri/6cb70e31-2f6b-4657-80b5-a512d17a71c1_heatload_logo.jpg?auto=compress,format";

		const logo1 = await getImageAsset(logoURL1,'bytes');
		const logo2 = await getImageAsset(logoURL2,'bytes');

		// Fixed height for logos
		const fixedHeight = 60;

		// Calculate width based on original aspect ratio
		const width1 = (fixedHeight / logo1.height) * logo1.width;
		const width2 = (fixedHeight / logo2.height) * logo2.width;

		const table = new this.docx.Table({
			width: { size: 100, type: this.docx.WidthType.PERCENTAGE },
			rows: [
				new this.docx.TableRow({
					children: [
						new this.docx.TableCell({
							 borders: {
								top: { style: this.docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
								bottom: { style: this.docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
								left: { style: this.docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
								right: { style: this.docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
								},
							children: [ new this.docx.Paragraph({ alignment: this.docx.AlignmentType.LEFT, children: [ new this.docx.ImageRun({ data: logo1.bytes, transformation: { width: width1, height: fixedHeight } }) ] }) ],
							width: { size: 50, type: this.docx.WidthType.PERCENTAGE }
						}),
						new this.docx.TableCell({
							 borders: {
							top: { style: this.docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
							bottom: { style: this.docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
							left: { style: this.docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
							right: { style: this.docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
							},
					
							children: [ new this.docx.Paragraph({ alignment: this.docx.AlignmentType.RIGHT, children: [ new this.docx.ImageRun({ data: logo2.bytes, transformation: { width: width2, height: fixedHeight } }) ] }) ],
							width: { size: 50, type: this.docx.WidthType.PERCENTAGE }
						})
					]
				})
			]
		});
		this.docParagraphs.push(table)
		
	}
	


	

}


async function exportPageToPDF() {

    var doc = new PdfWriter()
        doc.export()

}

/*function partsWidth(doc, parts,base, subSize) {
let w = 0;
for (const p of parts) {
if (!p.v) continue;
doc.setFontSize(p.k === 'text' ? base : subSize);
w += doc.getTextWidth(p.v);
}
doc.setFontSize(base);
return w;
}
 */

function extractTableFields(tableElement, checkheaders = true, log = false) {
    // returns 2D array with text content; including headers
    // returns 2D array with color of text; without headers

    const processedTable = [];
    const colorTable = []; // Sister array for colors (only for the body)

    var headers = Array.from(tableElement.rows)[0]

        var currentCol = 0

        Array.from(tableElement.rows).forEach((row, rowIndex) => {
            const rowData = [];

            currentCol = 0;

            // Only generate colors for the body (skip header row)
            const rowColors = rowIndex === 0 ? null : [];

            Array.from(row.cells).forEach(cell => {

                if (checkheaders && (headers.cells[currentCol].textContent == "")) {
                    return
                }
                currentCol += 1;

                const subtable = cell.querySelector("table");
                const input = cell.querySelector("input, textarea");
                const select = cell.querySelector("select");
                const text = cell.querySelector("text");

                if (subtable) {
                    var subtabledata = extractTableFields(subtable, false, false)
                        var multistring = tableToMultiline(subtabledata[0], {
                            'sep': '  |  '
                        })
                        rowData.push(multistring)

                } else if (input) {
                    if (input.type === "checkbox") {
                        const checkboxSymbol = input.checked ? "X" : "";
                        rowData.push(checkboxSymbol);
                        if (rowIndex > 0)
                            rowColors.push([0, 135, 183]);
                    } else {
                        rowData.push(input.value);
                        if (rowIndex > 0)
                            rowColors.push([0, 135, 183]);
                    }
                } else if (select) {

                    rowData.push(select.options[select.selectedIndex].text);
                    if (rowIndex > 0)
                        rowColors.push([0, 135, 183]); // Blue for inputs/selects
                } else if (text) {
                    rowData.push(text.innerHTML);
                    

                } else {
                    /*let cellText = Array.from(cell.childNodes).filter(node => node.nodeType === Node.TEXT_NODE) // Only get text nodes
                    .map(node => node.textContent.trim()) // Clean up spaces
                    .join(" "); // Join multiple text nodes (if any)
                    rowData.push(cellText);
                    console.log("CELL TEXT ",cellText)*/
                    var clone = cloneWithoutSpans(cell)
                        //rowData.push(clone.innerHTML)
                        rowData.push(clone.innerText)

                        if (rowIndex > 0)
                            rowColors.push([78, 99, 109]); // Black for regular text
                }
            });

            processedTable.push(rowData);
            if (rowIndex > 0)
                colorTable.push(rowColors); // Only push body rows to colorTable
        });

    return [processedTable, colorTable]

}

function cloneWithoutSpans(original) {
    // Clone the element without its children
    const clone = original.cloneNode(false);

    // Loop over *all* childNodes (includes text, comments, elements, etc.)
    for (const node of original.childNodes) {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'span') {
            // skip spans
            continue;
        }
        clone.appendChild(node.cloneNode(true));
    }

    return clone;
}

const parseSubSup = s => {
    const re = /<(sub|sup)>(.*?)<\/\1>/gi,
    parts = [],
    t = s;
    let m,
    last = 0;
    while ((m = re.exec(t))) {
        if (m.index > last)
            parts.push({
                k: 'text',
                v: t.slice(last, m.index)
            });
        parts.push({
            k: m[1],
            v: m[2]
        });
        last = re.lastIndex;
    }
    if (last < t.length)
        parts.push({
            k: 'text',
            v: t.slice(last)
        });
    return parts;
};

function tableToMultiline(table, opts = {}) {
    const {
        sep = ' ',
        skipEmpty = true
    } = opts;

    const lines = (table || []).map((row = []) => {
        const cells = row.map(cell =>
                (cell == null ? '' : String(cell)).trim());
        const line = cells.join(sep).trim();
        return line;
    });

    return (skipEmpty ? lines.filter(l => l.length) : lines).join('\n');
}



async function getImageAsset(url, format = "base64") {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const img = new Image();
            img.onload = async () => {
                const width = img.width;
                const height = img.height;

                if (format === "base64") {
                    // return the base64 string (strip prefix for clean base64)
                    const base64 = reader.result.split(",")[1];
                    resolve({ width, height, base64, bytes: null });
                } else {
                    // return raw bytes
                    const buf = await blob.arrayBuffer();
                    resolve({ width, height, base64: null, bytes: new Uint8Array(buf) });
                }
            };
            img.onerror = reject;
            img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}


function moveElementById(elementsArray, elementId, newIndex) {
    const currentIndex = elementsArray.findIndex(el => el.id === elementId);

    if (currentIndex === -1) {
        console.warn(`Element with ID "${elementId}" not found.`);
        return elementsArray;
    }

    // Remove the element from its current position
    const [element] = elementsArray.splice(currentIndex, 1);

    // Insert the element at the new position
    elementsArray.splice(newIndex, 0, element);

    return elementsArray;
}


async function exportToWord() {

    var doc = new DocxWriter()
        doc.export()

}

function evaluateDivsToSkip() {

    var toSkip = ['home', 'helpdialog', 'floorsystemeditor-select']

    if (Object.keys(floorModel.spaces).length == 0) {
        toSkip.push("floorheating")
    }
    if (radModel.spaces.length == 0) {
        toSkip.push("radiators")
    }

    return toSkip

}

function prepareForExport() {
    // setting the system editor select to the same value, so that it is ok when exporting
    document.getElementById("floorsystemeditor-select").value = document.getElementById("floor_system_select").value
        renderSelectedSystemData(document.getElementById("floorsystemeditor-select"))
}
