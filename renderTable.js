

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
                input.onchange = (e) => {
                    //rowData[col.value] = e.target.value;
                    //console.log(`Updated ${col.header} for ${rowData.spaceType} to`, e.target.value);
					input.onchange = (e) => col.onchange(e, rowData);               
                };
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

