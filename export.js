async function exportPageToPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size

	pdf.setFont("helvetica")

    const pageWidth = 180; // Max width for text (A4 = 210mm, with margins)
    const pageHeight = 280; // A4 page height (297mm, leaving bottom margin)
    let yPosition = 60; // Start Y position for content

	const parentDiv = document.querySelector(".content"); // Replace with your target div
	var elements = parentDiv.querySelectorAll("h1, h2, h3, table,p, span:not(table span), select:not(table select), input:not(table input)");

	// move results and header on top
	var reorderedElements = moveElementById(Array.from(elements), "heatloss_table", 1); 
	reorderedElements = moveElementById(Array.from(reorderedElements), "results_header", 1); 


	await addLogos(pdf)



    for (const element of reorderedElements) {
		
		if (window.getComputedStyle(element).display === "none") {
			continue; // Skip this iteration
		}        
		if (["H1", "H2", "H3"].includes(element.tagName)) {
			blackText(pdf)
			pdf.setFont("helvetica","bold")

            yPosition = checkNewPage(pdf,yPosition,pageHeight)
			
			sizes = {"H1":16,"H2":14,"H3":12}
			
            pdf.setFontSize(sizes[element.tagName]);
            //pdf.setFontSize(element.tagName === "H3" ? 24 : 18);
            pdf.text(element.innerText, 15, yPosition);
            yPosition += 10;
			pdf.setFont("helvetica","normal")

        } 
		
        else if (element.tagName === "TABLE") {
			const processedTable = [];
			const colorTable = []; // Sister array for colors (only for the body)

			var headers = Array.from(element.rows)[0]
				
			var currentCol = 0

			Array.from(element.rows).forEach((row, rowIndex) => {
				const rowData = [];

				currentCol = 0;
							
				// Only generate colors for the body (skip header row)
				const rowColors = rowIndex === 0 ? null : [];

				Array.from(row.cells).forEach(cell => {
					
					if (headers.cells[currentCol].textContent == ""){
						return
					}
					currentCol += 1;
					
					const input = cell.querySelector("input, textarea");
					const select = cell.querySelector("select");

					if (input) {
						if (input.type === "checkbox") {
							const checkboxSymbol = input.checked ? "X" : ""; 
							rowData.push(checkboxSymbol);
							if (rowIndex > 0) rowColors.push([0, 135, 183]);
						} else {
							rowData.push(input.value);
							if (rowIndex > 0) rowColors.push([0, 135, 183]);
						}
					}
 					else if (select) {
						rowData.push(select.options[select.selectedIndex].text);
						if (rowIndex > 0) rowColors.push([0, 135, 183]); // Blue for inputs/selects
					} 
					else {
						let cellText = Array.from(cell.childNodes).filter(node => node.nodeType === Node.TEXT_NODE) // Only get text nodes
										.map(node => node.textContent.trim()) // Clean up spaces
										.join(" "); // Join multiple text nodes (if any)
						rowData.push(cellText);
						if (rowIndex > 0) rowColors.push([78,99, 109]); // Black for regular text
					}
				});

				processedTable.push(rowData);
				if (rowIndex > 0) colorTable.push(rowColors); // Only push body rows to colorTable
			});


            // Ensure page split before adding table if needed
            yPosition = checkNewPage(pdf,yPosition,pageHeight)

			console.log(processedTable[0])
			
			console.log(processedTable.slice(1))
			

			pdf.autoTable({
				head: [processedTable[0]], // First row as header (unchanged)
				body: processedTable.slice(1), // Remaining rows as data
				styles: { halign: "center" }, // Default alignment for all columns (center)
				headStyles:{
					fillColor: [0,135,183]
				},
				columnStyles: {
					0: { halign: "left" }, // First column aligned to the left
				},
				startY: yPosition,
				theme: 'grid',
				didParseCell: function(data) {
					if (data.section === 'body') { // Apply only to the body, not the header
						data.cell.styles.textColor = colorTable[data.row.index][data.column.index];
					}
				}
			});


            yPosition = pdf.autoTable.previous.finalY + 10; // Move position after the table
        } 

        else if (element.tagName === "SELECT") {
            highlightText(pdf)

			// Get only the selected option from a <select>
            //const label = element.getAttribute("name") || element.id || "Dropdown";
            const selectedText = element.options[element.selectedIndex].text;

			yPosition = checkNewPage(pdf,yPosition,pageHeight)

            pdf.setFontSize(10);
            pdf.text(`${selectedText}`, 15, yPosition);
            yPosition += 10;
        }
		
		else if (element.tagName === "P"){
            pdf.setFontSize(10);

			var lastX = 15
			yPosition = checkNewPage(pdf,yPosition,pageHeight)
		
			subElements = element.querySelectorAll("span,input")
			
			var textToWrite=""
			
			subElements.forEach(subel => {
				
				if (window.getComputedStyle(subel).display === "none") {
					return; // Skip this iteration
				}        

				
				if (subel.tagName === "SPAN"){
					blackText(pdf)
					textToWrite = subel.innerText

				}
				else if (subel.tagName === "INPUT"){
					highlightText(pdf)
					textToWrite = subel.value

					if (subel.type == "checkbox"){
						textToWrite = subel.checked ? translate("yes"):translate("no")
					}
				
				}
				pdf.text(`${textToWrite}`, lastX, yPosition);
				const textWidth = pdf.getTextWidth(textToWrite);
				lastX += textWidth+2

			})
            yPosition += 10;
		}
			

    }
	
	addNumbersAndDates(pdf)
	addWatermark(pdf)
    pdf.save("exported_content.pdf");
}



function checkNewPage(pdf,yPosition,pageHeight){
	
	if (yPosition + 10 > pageHeight) {
		pdf.addPage();
		yPosition = 25;
	}
	return yPosition
}


function highlightText(pdf){

	pdf.setTextColor(0, 135, 183); // Blue
}

function blackText(pdf){

	pdf.setTextColor(78, 99, 109); // Blue
}



async function addLogos(pdf){
   // Logo URLs
    const logoURL1 = "https://images.prismic.io/bbri/0f1c879e-8d5e-4201-a0d2-2dbf3bd95d33_Buildwise_Horizontaal_noir_marge.png?auto=compress,format&rect=0,0,2000,500&w=740&h=185";
    const logoURL2 = "https://images.prismic.io/bbri/6cb70e31-2f6b-4657-80b5-a512d17a71c1_heatload_logo.jpg?auto=compress,format";

    // Convert image URLs to Base64 and get aspect ratio
    const logo1 = await getBase64AndDimensions(logoURL1);
    const logo2 = await getBase64AndDimensions(logoURL2);

    // Fixed height for logos
    const fixedHeight = 20;

    // Calculate width based on original aspect ratio
    const width1 = (fixedHeight / logo1.height) * logo1.width;
    const width2 = (fixedHeight / logo2.height) * logo2.width;

    // Add images with calculated width to maintain aspect ratio
    pdf.addImage(logo1.base64, 'PNG', 10, 10, width1, fixedHeight);
    pdf.addImage(logo2.base64, 'JPEG', 120, 10, width2, fixedHeight);

    let yPosition = 40; // Adjust Y position after logos

 
}

// Function to fetch Base64 and get original image dimensions
async function getBase64AndDimensions(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    base64: reader.result,
                    width: img.width,
                    height: img.height
                });
            };
            img.src = reader.result;
        };
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


function addNumbersAndDates(doc){
	
	//const totalPages = doc.getNumberOfPages();

	
	const date = new Date().toLocaleDateString();
	
	for (let i = 1; i <= doc.getNumberOfPages(); i++) {
		doc.setPage(i); // Go to the page
		doc.setFontSize(10);
		doc.text(`${i}/${doc.getNumberOfPages()}`, 180, 290);
		doc.text(`Date: ${date}`, 20, 290);
	}
}


function addWatermark(doc){
	
	
	//var gState = doc.GState({ opacity: 0.5, stroke: 1 });

	
	for (let i = 1; i <= doc.getNumberOfPages(); i++) {
		doc.setPage(i); // Go to the page
		
		doc.saveGraphicsState();

		// Register the graphics state
		const gState = doc.GState({ opacity: 0.5, stroke: 1 });
		doc.setGState(gState);

		doc.setFontSize(60);
		doc.setTextColor(220, 220, 220)
		doc.text('TEST VERSION',doc.internal.pageSize.width/3, doc.internal.pageSize.height*2/3,{angle:60});
		doc.restoreGraphicsState();
	}

}



async function exportToWord() {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, WidthType, AlignmentType } = docx;


	const parentDiv = document.querySelector(".content"); // Replace with your target div
	var elements = parentDiv.querySelectorAll("h1, h2, h3, table,p, span:not(table span), select:not(table select), input:not(table input)");

	var reorderedElements = moveElementById(Array.from(elements), "heatloss_table", 1); 
	reorderedElements = moveElementById(Array.from(reorderedElements), "results_header", 1); 

	
    const docParagraphs = [];

    for (const element of reorderedElements) {
        if (window.getComputedStyle(element).display === "none") {
            continue;
        }

        if (["H1", "H2", "H3"].includes(element.tagName)) {
            const levelMap = {
                H1: HeadingLevel.HEADING_1,
                H2: HeadingLevel.HEADING_2,
                H3: HeadingLevel.HEADING_3,
            };

            docParagraphs.push(
                new Paragraph({
                    text: element.innerText,
                    heading: levelMap[element.tagName],
					spacing: {
					before: 200, // space before (in twentieths of a point)
					after: 300,  // space after (in twentieths of a point)
					},
                })
            );
        }

        else if (element.tagName === "TABLE") {
            const rows = [];
            const tableRows = Array.from(element.rows);
            //const headers = Array.from(tableRows[0].cells).map(cell => cell.textContent.trim());
			const headers = Array.from(tableRows[0].cells).map(cell => {
				return Array.from(cell.childNodes)
					.filter(node => node.nodeType === Node.TEXT_NODE)
					.map(node => node.textContent.trim())
					.join(" ");
			});  // avoid taking nested elements with it (aka: tooltips)

            // Build header row
            const headerRow = new TableRow({
                children: headers.map(headerText =>
                    new TableCell({
                        children: [
							new Paragraph({
								children: [
									new TextRun({
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
                        width: { size: 20, type: WidthType.PERCENTAGE },
                    })
                ),
            });
            rows.push(headerRow);

            // Body rows
            for (let i = 1; i < tableRows.length; i++) {
                const cells = Array.from(tableRows[i].cells).map(cell => {
                    let text = "";
                    const input = cell.querySelector("input, textarea");
                    const select = cell.querySelector("select");

					if (input) {
						if (input.type === "checkbox") {
							text = input.checked ? "X" : ""; 
						} else {
							text = input.value;
						}
                    } else if (select) {
                        text = select.options[select.selectedIndex].text;
                    } else {
                        text = Array.from(cell.childNodes)
                            .filter(node => node.nodeType === Node.TEXT_NODE)
                            .map(node => node.textContent.trim())
                            .join(" ");
                    }

                    return new TableCell({
                        children: [new Paragraph(text)],
                        width: { size: 20, type: WidthType.PERCENTAGE },
                    });
                });

                rows.push(new TableRow({ children: cells }));
            }

            docParagraphs.push(new Table({
                rows,
                width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                },
                alignment: AlignmentType.CENTER,
            }));
        }

        else if (element.tagName === "SELECT") {
            const selectedText = element.options[element.selectedIndex].text;
            docParagraphs.push(new Paragraph({
                children: [new TextRun(selectedText)],
            }));
        }

        else if (element.tagName === "P") {
            const subElements = element.querySelectorAll("span, input");
            const paragraphChildren = [];

            subElements.forEach(subel => {
                if (window.getComputedStyle(subel).display === "none") return;

                let text = "";
                let runOptions = {};

                if (subel.tagName === "SPAN") {
                    text = subel.innerText;
                    runOptions = { text };
                }
                else if (subel.tagName === "INPUT") {
                    if (subel.type === "checkbox") {
                        text = subel.checked ? translate("yes") : translate("no");
                    } else {
                        text = subel.value;
                    }
                    runOptions = { text, bold: true }; // Example: highlight inputs as bold
                }

                paragraphChildren.push(new TextRun(runOptions));
            });

            docParagraphs.push(new Paragraph({
                children: paragraphChildren,
            }));
        }
    }
  // Create document
    const doc = new Document({
        sections: [{
            properties: {},
            children: docParagraphs,
        }],
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "export.docx";
    a.click();
    URL.revokeObjectURL(url);

}
