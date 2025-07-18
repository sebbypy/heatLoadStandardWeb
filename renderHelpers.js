


function createElement(tag, attributes = {}, innerText = '', children = [], tooltipKey = '') {
    const element = document.createElement(tag);

    // Loop through attributes
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'class') {
            // Handle class attribute
            element.className = value;
        } else if (key.startsWith('on')) {
            // Assign event handlers
            element[key] = value;
        } else {
            // Assign other attributes
            element.setAttribute(key, value);
        }
    }

    // Set innerText if provided
    if (innerText) {
        element.innerText = innerText;
    }

    // Append children if any
    children.forEach(child => element.appendChild(child));

    // Add tooltip directly inside the element
    if (tooltipKey) {
        element.classList.add('tooltip'); // Ensure it has the tooltip styling

        const tooltipSpan = document.createElement('span');
        tooltipSpan.className = 'tooltiptext';
        tooltipSpan.setAttribute('lang-key', tooltipKey);
        tooltipSpan.innerText = translations[getCurrentLanguage()][tooltipKey]

        element.appendChild(tooltipSpan);
    }

    return element;
}





function addCopyToAllButton(table,columnid,onclickfunction){
	if (table.rows.length>1){
		var targetCell = table.rows[1].cells[columnid]; //assume always row 1, i.e. after heading
		const button = document.createElement('button');
		button.innerHTML='<i class="material-symbols material-symbols-inline" >content_copy</i><i class="material-symbols material-symbols-inline">arrow_downward</i>'
		button.style.position = "absolute"
		button.style.padding = "2px"
		targetCell.appendChild(button)
		button.onclick = onclickfunction
	}
	
}





function renderTable(table, columns, data) {

    // Create header row
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = translate(col.header);
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement("tbody");

    data.forEach(rowData => {
        const tr = document.createElement("tr");

        columns.forEach(col => {
            const td = document.createElement("td");

            if (col.type === "text") {
                td.textContent = typeof col.value === "function" ? col.value(rowData) : rowData[col.value];

            } 
			else if (col.type === "number") {
                const input = document.createElement("input");
                input.type = "number";
                input.value = rowData[col.value] || 0;
                input.oninput = (e) => {
					col.oninput(e,rowData)
                    //console.log("on input ",e)
					//rowData[col.value] = e.target.value;
                    //console.log(`Updated ${col.header} for ${rowData.spaceType} to`, e.target.value);
					//input.oninput = (e) => col.oninput(e, rowData);               
                };
				if (col.step){input.step = col.step}
				if (col.min){input.min = col.min}
				if (col.max){input.max = col.max}
                td.appendChild(input);
            }
			else if (col.type === "select") {
                const select = document.createElement("select");
                
                col.options.forEach(option => {
                    const opt = document.createElement("option");
                    opt.value = option.value;
                    opt.textContent = option.label;
                    if (rowData[col.value] === option.value) {
                        opt.selected = true;
                    }
                    select.appendChild(opt);
                });

                if (col.onchange) {
                    select.onchange = (e) => col.onchange(e, rowData);
                }

                td.appendChild(select);
            }
			 else if (col.type === "multilevelselect") {
                if (col.onchange) {
				
					const multilevelSelect = new MultiLevelSelect(col.data,rowData[col.value], (value) => col.onchange(value,rowData));
					td.appendChild(multilevelSelect);

				}
				else{
					const multilevelSelect2 = new MultiLevelSelect(col.data,col.value)
					td.appendChild(multilevelSelect2);
				}
            }



            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
}



/**
 * Adds a total row to a given table.
 * @param {HTMLTableElement} table - The table element to append the total row to.
 * @param {Array<number|null>} totals - The list of total values (can contain null values).
 */
function addTotalRow(table, totals,nDecimals) {
    if (!table || !Array.isArray(totals)) {
        console.error("Invalid arguments: table must be an HTMLTableElement and totals must be an array.");
        return;
    }

    // Create a total row
    const totalRow = document.createElement("tr");
    totalRow.classList.add("total-row");

    // Create the first cell with "Total" label
    const totalLabelCell = document.createElement("td");
    totalLabelCell.setAttribute("lang-key", "total");
    totalLabelCell.textContent = translations[getCurrentLanguage()]["total"];
    totalRow.appendChild(totalLabelCell);

    // Append total values to the row, leaving the cell empty if value is null
    totals.forEach(total => {
        const totalCell = document.createElement("td");
        totalCell.textContent = total !== null ? total.toFixed(nDecimals) : ""; // Leave empty if null
        totalRow.appendChild(totalCell);
    });

    // Append the total row to the table
    table.appendChild(totalRow);
}
