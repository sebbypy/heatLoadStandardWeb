function getCurrentLanguage() {
    var selector = document.getElementById('languageSelector');
    return selector.value;
}

// INITIALIZE function --> create main components of the HTML page programatically 
// -------------------------------------------------------------------------------

function initializeVentilationTable() {
    var container = document.getElementById('ventilation');
    var table = document.createElement('table');
    table.id = 'ventilationTable';
    container.appendChild(table);

    // Initialize headers and rows with empty inputs
    renderVentilationTable();
}



// --------------------------------------------------
// HANDLE functions --> handling user UI interactions 
// --------------------------------------------------

function handleAddSpace() {

	model.createNewSpace(`Space ${model.spaceIdCounter}`)
	renderAll() // new space has 0 flow and no walls --> no computation
	
}

function handleAddBoundary() {

	model.createNewBoundary(`Environnement ${model.spaceIdCounter}`)
	renderAll()
}

function addOutsideBoundary() {
	
	model.createNewBoundary('Ext',type='unheated',bc_type='outside')
	renderAll()
}


function handleSpacePropertyChange(spaceId, property, value) {
    const space = model.spaces.find(space => space.id === spaceId);
    if (space) {
        space[property] = isNaN(Number(value)) ? value : Number(value);
		computeAll()
		renderAll()
		console.log(space)
	}
}

function handleAddWallElement() {
    
	model.createNewWallElement("Mur")
	renderAll() // new element not yet used, no calc
}

function handleAddWallInstance(indexSpace) {

    const space = model.spaces[indexSpace];

	model.createNewWallInstance(space.id)
	renderAll() // 0 area wall, no calculation needed

    toggleVisibility(`space-${indexSpace}`);
}


function handleSpaceNameChange(id, newName) {
    const index = model.spaces.findIndex(space => space.id === id);
    if (index !== -1) {  // Check if the space was found
        model.spaces[index].name = newName;
        renderWallInstances();
    } else {
        console.error("Space not found with id:", id);
    }
	renderAll()
}


function handleWallNameChange(wallElementId, newName) {
    const element = model.wallElements.find(element => element.id === wallElementId);
    if (element) {
        element.name = newName;
    }
	renderAll() // no calc needed
}

function handleWalUValueChange(wallElementId, newUValue) {
	
	// updating model
    const welement = model.wallElements.find(element => element.id === wallElementId);
    if (welement) {
        welement.uValue = parseFloat(newUValue);
    }
	computeAll()
	renderAll()
}

function handleWallThermalBridgeChange(wallElementId, newThermalBridge) {
    const welement = model.wallElements.find(welement => welement.id === wallElementId);
    if (welement) {
        welement.thermalBridge = parseFloat(newThermalBridge);
    }
	computeAll()
	renderAll()
}

function handleVentilationChange(spaceId, parameter, value){
    var space = model.spaces.find(e => e.id === spaceId);
    if (space) {
        space.ventilation[parameter] = value;
		computeAll()
		renderAll()
    }
}

function handleWallInstanceAreaChange(wallId, newArea,callerspaceid) {
    const wallInstance = model.wallInstances.find(m => m.id === wallId);
    if (wallInstance) {
        wallInstance.Area = Number(newArea);
	}
	computeAll()
	renderAll()
	toggleVisibility(`space-${callerspaceid}`)
}



function handleWallInstanceTypeChange(wallId, newTypeId,callerspaceid) {
	wallId = Number(wallId);  // Convert to number
    newTypeId = Number(newTypeId);
    const wallInstance = model.wallInstances.find(m => m.id === wallId);
    if (wallInstance) {
        wallInstance.elementId = newTypeId;
    } else {
        console.error('Mur not found with id:', wallId);
    }
	
	computeAll()
	renderAll()
	
	toggleVisibility(`space-${callerspaceid}`)
}

function handleNeighbourSpaceChange(wallId, newSpaceId,callerspaceid) {
	wallId = Number(wallId);  // Convert to number
    newSpaceId = Number(newSpaceId);


    // Find the wall object in wallInstances array with the given id
    const wallInstance = model.wallInstances.find(m => m.id === wallId);
    if (wallInstance) {
        if (wallInstance.spaces.length === 1) {
            wallInstance.spaces.push(newSpaceId); // Add new linked space if only one was initially present
        } else {
            wallInstance.spaces[1] = newSpaceId; // Replace existing linked space
        }
		
    } else {
        console.error('Mur not found with id:', wallId);
    }

	computeAll()
	renderAll()
	toggleVisibility(`space-${callerspaceid}`)


}

function handleDeleteWallInstance(wallId,callerspaceid) {

    model.wallInstances = model.wallInstances.filter(wall => wall.id !== wallId);

    computeAll()
	renderAll()

	toggleVisibility(`space-${callerspaceid}`)

}

function handleDeleteSpace(spaceId) {
    // Check if the space is referenced in any wall instances
    const isReferenced = model.wallInstances.some(wall => wall.spaces.includes(spaceId));

    if (isReferenced) {
        alert("Cannot delete this space because it is referenced in wall instances.");
    } else {
        // Proceed with deletion: Remove the space from the array
        model.spaces = model.spaces.filter(space => space.id !== spaceId);

		renderTabs();
        renderSpacesTable();  
		renderBoundariesTable();
		renderWallInstances();
		renderResults()
    }
}


function handleDeleteWallElement(wallElementId) {
    // Check if the wall element is referenced in any wall instances
    const isReferenced = model.wallInstances.some(wall => wall.elementId === wallElementId);

    if (isReferenced) {
        alert("Cannot delete this wall element because it is referenced in wall instances.");
    } else {
        // Proceed with deletion: Remove the wall element from the array
        model.wallElements = model.wallElements.filter(wElement => wElement.id !== wallElementId);
        renderWallElements();  // Re-render the wall elements table to reflect deletion

        // Optional: Update other components that might be affected
        renderWallInstances();
    }
}

function handleSetDefaultBoundaryTemperatures(){
	console.log("handle default bcs")
	model.setDefaultBoundaryTemperatures()
	computeAll()
	renderAll()

	
}


// ----------------------
// Compute full case
// ----------------------

function computeAll(){
	//computeEquilibriumTemperatures()
	model.computeExtractMeanTemperature()
	model.computeSupplyTemperature()
	model.computeAllWallInstanceLosses()
	model.computeAllVentilationLosses()
}



// ----------------
// RENDER functions
// ----------------

function renderAll(){
	// render all visible screens
	
	renderTabs()
	renderSpacesTable()
	renderBoundariesTable()
	
	renderWallElements()
	renderWallInstances()
	
	renderAirTightness()
	renderHeatRecovery()
	renderVentilationTable()
	renderResults()
	
}


function renderSpaceRow(table, space) {
    const row = table.insertRow(-1);  // Append row at the end of the table
    const heatingOptions = [
        { value: "radiators", label: "Radiateurs" },
        { value: "floor", label: "Sol" },
        { value: "equilibrium", label: "No heating" }
    ];


    // Create cells with input/select elements and set their contents
    row.insertCell(0).innerHTML = `<input type="text" name="nameSpace${space.id}" value="${space.name}" onchange="handleSpaceNameChange(${space.id}, this.value)">`;
    row.insertCell(1).innerHTML = `<input type="number" name="tempRef${space.id}" value="${Number(space.temperature).toFixed(0)}" onchange="handleSpacePropertyChange(${space.id}, 'temperature', this.value)">`;
    row.insertCell(2).innerHTML = `<input type="number" name="surfaceSol${space.id}" value="${space.floorarea}" onchange="handleSpacePropertyChange(${space.id}, 'floorarea', this.value)">`;
    row.insertCell(3).innerHTML = `<input type="number" name="volume${space.id}" value="${space.volume}" onchange="handleSpacePropertyChange(${space.id}, 'volume', this.value)">`;
    row.insertCell(4).innerHTML = `<select name="typeChauffage${space.id}" onchange="handleSpacePropertyChange(${space.id}, 'heating_type', this.value)">` +
        heatingOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('') +
        `</select>`;
    //row.insertCell(5).innerHTML = `<button onclick="handleDeleteSpace(${space.id})">Delete</button>`;

    const cell = row.insertCell(5)
    const button = document.createElement('button');
    button.innerHTML = '<i class="material-icons">delete</i>'
	button.onclick = () => handleDeleteSpace(space.id);
	cell.appendChild(button)

	var dropdown = document.getElementsByName('typeChauffage'+space.id)[0];
    dropdown.value = space.heating_type; 

	renderEquilibrium(space);

}

function renderEquilibrium(space){
	if (space['heating_type']=="equilibrium"){
			input = document.getElementsByName(`tempRef${space.id}`)[0];			// disable the temperature field from this row
			input.disabled = true;
		}
	else{
			input = document.getElementsByName(`tempRef${space.id}`)[0];			// disable the temperature field from this row
			input.disabled = false;
		}
}


function renderBoundaryRow(table, space, index) {
    const row = table.insertRow(-1);  // Append row at the end of the table
    const bctype = model.getBoundaryConditionTypes()

    // Create cells with input/select elements and set their contents
    row.insertCell(0).innerHTML = `<input type="text" name="nameSpace${space.id}" value="${space.name}" onchange="handleSpaceNameChange(${space.id}, this.value)">`;

	if (index == 0){
		let cell = row.insertCell(1)
		cell.setAttribute('lang-key', 'outside');
		cell.innerHTML = translations[getCurrentLanguage()]['outside'];
	}
	else{
		let cell = row.insertCell(1);
		let select = document.createElement('select');
		select.name = `bcType${space.id}`;
		select.onchange = function () {
			handleSpacePropertyChange(space.id, 'bc_type', this.value);
		};
		bctype.forEach(opt => {
			let option = document.createElement('option');
			option.value = opt.value;
			option.textContent = translations[getCurrentLanguage()][opt.value];
			select.appendChild(option);
		});
		select.value = space.bc_type;
		cell.appendChild(select);
		
	}
  
  
    row.insertCell(2).innerHTML = `<input type="number" name="tempRef${space.id}" value="${space.temperature}" onchange="handleSpacePropertyChange(${space.id}, 'temperature', this.value)">`;

	if (space.id==0){
		row.insertCell(3).innerHTML = ``;	
	}
	else{
		const cell = row.insertCell(3)
		const button = document.createElement('button');
		button.innerHTML = '<i class="material-icons">delete</i>'
		button.onclick = () => handleDeleteSpace(space.id);
		cell.appendChild(button)


	}
}



function renderResults(){
    // Define the headers of the table
    const headers_keys = ["spaces", "transmission_heat_loss", "ventilation_heat_loss", "heatup_loss","total_heat_loss","per_m2"];
    
    // Get the 'results' div
    const resultsDiv = document.getElementById("resultsContainer");
    
	const header = document.createElement("h2");
    header.setAttribute("lang-key", "results");
    header.textContent = "Résultats";
    
    // Create the table element
    const table = document.createElement("table");
    table.border = "1"; // Optional: adds a border to the table

    // Create the table header row
    const headerRow = document.createElement("tr");
    headers_keys.forEach(header => {
        const th = document.createElement("th");
		th.setAttribute('lang-key',header)
		th.textContent = translations[getCurrentLanguage()][header];

        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

	let totals = [0, 0, 0, 0,0]; // For transmission_heat_loss, ventilation_heat_loss, heatup_loss, total_heat_loss


    // Create the table rows based on the provided data
    model.spaces.forEach(space => {
		
		if (space.type == "heated"){
		
       const row = document.createElement("tr");

            // Create and append the 'spaces' cell
            const spaceCell = document.createElement("td");
            spaceCell.textContent = space.name;
            row.appendChild(spaceCell);

            // Calculate values for the row
            const values = [
                space.transmission_heat_loss,
                space.ventilation.ventilation_loss,
                0, // Assuming heatup_loss is 0 for now
                space.transmission_heat_loss + space.ventilation.ventilation_loss,
				(space.transmission_heat_loss + space.ventilation.ventilation_loss)/space.floorarea
				
            ];

            // Append cells and update totals
            values.forEach((value, index) => {
                const cell = document.createElement("td");
                cell.textContent = value.toFixed(0);
                row.appendChild(cell);
                totals[index] += value;
            });

            table.appendChild(row);		}
    });

	// Create a total row and append it
    const totalRow = document.createElement("tr");
	totalRow.classList.add('total-row')
    totalRow.innerHTML = `<td lang-key="total">${translations[getCurrentLanguage()]["total"]}</td>`;
    totals.forEach(total => {
        const totalCell = document.createElement("td");
        totalCell.textContent = total.toFixed(0);
        totalRow.appendChild(totalCell);
    });
    table.appendChild(totalRow);


    // Clear previous content in 'results' and append the new table
    resultsDiv.innerHTML = "";
	resultsDiv.appendChild(header)
    resultsDiv.appendChild(table);
}


function renderWallElementRow(table, wElement) {
    const row = table.insertRow(-1); // Append row at the end of the table

    // Create cells with input/select elements and set their contents
    row.insertCell(0).innerHTML = `<input type="text" name="nameMur${wElement.id}" value="${wElement.name}" onchange="handleWallNameChange(${wElement.id}, this.value)">`;
    row.insertCell(1).innerHTML = `<input type="number" name="valeurU${wElement.id}" value="${wElement.uValue}" onchange="handleWalUValueChange(${wElement.id}, this.value)">`;
    row.insertCell(2).innerHTML = `<input type="number" name="pontThermique${wElement.id}" value="${wElement.thermalBridge}" onchange="handleWallThermalBridgeChange(${wElement.id}, this.value)">`;


    //row.insertCell(3).innerHTML = `<button onclick="handleDeleteWallElement(${wElement.id})">Delete</button>`;
	const cell = row.insertCell(3)
    const button = document.createElement('button');
    button.innerHTML = '<i class="material-icons">delete</i>'
	button.onclick = () => handleDeleteWallElement(wElement.id);
	cell.appendChild(button)


}

function renderTabs(){

    const activeTab = document.querySelector('.tab.active-tab');
	const activeTabId = activeTab ? activeTab.id :'tab-spaces';

    renderMainTabs(); 

	var spaceTabs = document.getElementById('spacetabs')
    spaceTabs.innerHTML = ''; // Clear previous tabs to refresh them

    var container = document.getElementById('spacesContainer');
    container.innerHTML = ''; // Clear existing tables

    model.spaces.forEach((space, index) => {

		if (space.type == "heated"){

			// Create a tab for each space
			var tab = document.createElement('button');
			tab.textContent = space.name;
			tab.setAttribute('class','tab');
			tab.id = 'tab-space-' + index;
			tab.onclick = function () {
				toggleVisibility(`space-${index}`);
			};
			spaceTabs.appendChild(tab);
		}
	})

	document.getElementById(activeTabId).classList.add('active-tab') // restore default active tab or previouslys active tabe

	
	setTabsColorBehavior()
	
	
}	

function setTabsColorBehavior(){
  // Select all buttons with the class 'myButton'
	const buttons = document.querySelectorAll('.tab');

	// Add event listener to each button
	buttons.forEach(button => {
		button.addEventListener('click', function() {
		// Remove 'active' class from all buttons
		buttons.forEach(btn => btn.classList.remove('active-tab'));

		// Add 'active' class to the clicked button
		this.classList.add('active-tab');
		});
	})
}


function renderWallInstances() {

    var container = document.getElementById('spacesContainer');
    container.innerHTML = ''; // Clear existing tables


    model.spaces.forEach((space, index) => {


		var spaceTotalLoss = 0;
		var spaceTotalSurface = 0;

        var spaceDiv = document.createElement('div');
        spaceDiv.className = 'space-section';
        spaceDiv.id = `space-${index}`;
        spaceDiv.style.display = 'none'; // Start with the table hidden

		header = document.createElement("h3")
		header.textContent = `Space: ${space.name}`;
		spaceDiv.appendChild(header);
 
		const addButton = document.createElement('button');
		//addButton.setAttribute('lang-key', 'add_wall');
		//addButton.textContent = translations[getCurrentLanguage()]['add_wall'];
		addButton.textContent = "+";
		addButton.classList.add("add-button")
		addButton.onclick = () => handleAddWallInstance(index);
		spaceDiv.appendChild(addButton);

		// Create table
		const table = document.createElement('table');
		spaceDiv.appendChild(table);

		// Add table header
		const headerRow = document.createElement('tr');
		['wall', 'neighbour_space', 'wall_area', 'transmission_heat_loss', ''].forEach(key => {
			const th = document.createElement('th');
			th.setAttribute('lang-key', key);
			th.textContent = translations[getCurrentLanguage()][key] || key;
			headerRow.appendChild(th);
		});
		table.appendChild(headerRow);

		// Add rows for each wall instance
			model.wallInstances
				.filter(wall => wall.spaces.includes(space.id))
				.forEach(wall => {
					const row = document.createElement('tr');
					const linkedSpaceId = wall.spaces.find(id => id !== space.id);
					const linkedSpace = model.spaces.find(e => e.id === linkedSpaceId);

					const multiplier = wall.spaces.indexOf(space.id) === 0 ? 1 : -1;
					spaceTotalLoss += multiplier * wall.transmissionLoss;
					spaceTotalSurface += wall.Area;

					// Wall Element Type Dropdown
					const wallElementCell = document.createElement('td');
					const wallElementSelect = document.createElement('select');
					wallElementSelect.onchange = () => handleWallInstanceTypeChange(wall.id, wallElementSelect.value, index);
					const placeholderOption = document.createElement('option');
					placeholderOption.value = '';
					wallElementSelect.appendChild(placeholderOption);

					model.wallElements.forEach(wElement => {
						const option = document.createElement('option');
						option.value = wElement.id;
						option.textContent = wElement.name;
						if (wElement.id === wall.elementId) {option.selected = true;}
						wallElementSelect.appendChild(option);
					});
					wallElementCell.appendChild(wallElementSelect);
					row.appendChild(wallElementCell);

					// Neighbour Space Dropdown
					const neighbourCell = document.createElement('td');
					const neighbourSelect = document.createElement('select');
					neighbourSelect.onchange = () => handleNeighbourSpaceChange(wall.id, neighbourSelect.value, index);
					const placeholderOption2 = document.createElement('option');
					placeholderOption2.value = '';
					neighbourSelect.appendChild(placeholderOption2);
					model.spaces
						.filter(otherSpace => otherSpace.id !== space.id)
						.forEach(otherSpace => {
							const option = document.createElement('option');
							option.value = otherSpace.id;
							option.textContent = otherSpace.name;
							if (otherSpace.id === linkedSpaceId) option.selected = true;
							neighbourSelect.appendChild(option);
						});
					neighbourCell.appendChild(neighbourSelect);
					row.appendChild(neighbourCell);

					// Wall Area Input
					const areaCell = document.createElement('td');
					const areaInput = document.createElement('input');
					areaInput.type = 'number';
					areaInput.value = wall.Area;
					areaInput.onchange = () => handleWallInstanceAreaChange(wall.id, areaInput.value, index);
					areaCell.appendChild(areaInput);
					row.appendChild(areaCell);

					// Transmission Loss Input
					const lossCell = document.createElement('td');
					//const lossInput = document.createElement('p');
					//lossInput.type = 'text';
					lossCell.name = `lossWallInstance${wall.id}`;
					lossCell.innerHTML = (wall.transmissionLoss * multiplier).toFixed(0);
					//lossInput.disabled = true;
					//lossCell.appendChild(lossInput);
					row.appendChild(lossCell);

					// Delete Button
					const actionsCell = document.createElement('td');
					const deleteButton = document.createElement('button');
					deleteButton.innerHTML = '<i class="material-icons">delete</i>'


					deleteButton.onclick = () => handleDeleteWallInstance(wall.id, index);
					actionsCell.appendChild(deleteButton);
					row.appendChild(actionsCell);

					table.appendChild(row);
				});

		
		
		 // Add total row
		const totalRow = document.createElement('tr');
		totalRow.classList.add('total-row');

		['Total', '', spaceTotalSurface.toFixed(1), spaceTotalLoss.toFixed(0), ''].forEach((text, i) => {
			const cell = document.createElement(i === 2 || i === 3 ? 'td' : 'td');
			cell.textContent = text;
			totalRow.appendChild(cell);
		});

		table.appendChild(totalRow);
		
        container.appendChild(spaceDiv);
		space.transmission_heat_loss = spaceTotalLoss
	});

	
    //renderVentilationTable(); // Ensure the ventilation table is also updated
	//computeAllVentilationLosses()
}


function renderVentilationTable() {
	
	
    var table = document.getElementById('ventilationTable');
    if (!table) {
        table = document.createElement('table');
        table.id = 'ventilationTable';
        document.getElementById('ventilation').appendChild(table);
    }
    table.innerHTML = '';

    // Define parameters for headers
    var parameters = [
        "natural_supply_flowrate",
        "mechanical_supply_flowrate",
        "transfer_flowrate",
        "transfer_temperature",
        "mechanical_extract_flowrate"
    ];

    // Create the header row for spaces
    var headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Parameter / Space</th>';
    parameters.forEach(param => {
        var th = document.createElement('th');
        th.setAttribute('lang-key', param);
        th.textContent = translations[getCurrentLanguage()][param];
        headerRow.appendChild(th);
    });
	
	var th = document.createElement('th');
	th.setAttribute('lang-key', 'ventilation_loss');
	th.textContent = translations[getCurrentLanguage()]["ventilation_loss"];
	headerRow.appendChild(th);
    
	
    table.appendChild(headerRow);

	// Initialize totals object
	var totals = {
		natural_supply_flowrate: 0,
		mechanical_supply_flowrate: 0,
		transfer_flow_rate: null,
		transfer_temperature: null,
		mechanical_extract_flowrate: 0,
		transfer_temperature:null,
		loss:0
	};

    // Create rows for each space
    model.spaces.forEach(space => {
			
		if (space.type == "heated"){
			
			var row = document.createElement('tr');
			var labelCell = document.createElement('td');
			labelCell.textContent = space.name;
			row.appendChild(labelCell);

			parameters.forEach(param => {
				var cell = document.createElement('td');
				var input = document.createElement('input');
				input.type = 'number';
				input.value = space.ventilation[param] || '';
				input.onchange = () => handleVentilationChange(space.id, param, input.value);
				cell.appendChild(input);
				row.appendChild(cell);
				
				// Update total for this parameter if the value is a valid number
                var value = parseFloat(input.value);
                if (!isNaN(value) && totals[param] != null) {
                    totals[param] += value;
                }
			});

			var cell = document.createElement('td');
			var input = document.createElement('span');
			//input.type = 'text';
			//input.value = space.ventilation.ventilation_loss.toFixed(0);
			//input.disabled = true; // Make the input read-only
			input.innerHTML = space.ventilation.ventilation_loss.toFixed(0)
			input.name = "ventilationLoss"+space.id
			cell.appendChild(input);
			row.appendChild(cell);
			totals['loss'] += space.ventilation.ventilation_loss
			

			table.appendChild(row);
		}
    });
	
	// Add total row
    var totalRow = document.createElement('tr');
	totalRow.classList.add('total-row');
    totalRow.innerHTML = '<td lang-key="total">' + translations[getCurrentLanguage()]["total"] + '</td>';
    Object.keys(totals).forEach(key => {
        var totalCell = document.createElement('td');
		if (totals[key] != null) {
			totalCell.textContent = totals[key].toFixed(0); // Display totals rounded to integers
		}
		else{
			totalCell.textContent = ''
		}
        totalRow.appendChild(totalCell);

    });

    // Empty cell for the "ventilation_loss" column in the total row
    //var emptyCell = document.createElement('td');
    //totalRow.appendChild(emptyCell);

    table.appendChild(totalRow);
}




function renderSpacesTable() {
    const table = document.getElementById('tableSpaces');
    // Clear existing table rows except for the header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Re-add rows for all remaining spaces
    model.spaces.forEach((space, index) => {
		if (space.type == "heated"){
			renderSpaceRow(table, space, index);
		}
    });
}

function renderBoundariesTable() {
	
	// Render temperatures
	const zipcode_select = document.getElementById("municipality_select")
	console.log(model.getBoundaryTemperatures())
	console.log(document.getElementById("external_temperature"))
	
	document.getElementById("external_temperature").innerHTML = model.getBoundaryTemperatures()[0]+'°C'
	document.getElementById("month_external_temperature").innerHTML = model.getBoundaryTemperatures()[1]+'°C'
	document.getElementById("year_external_temperature").innerHTML = model.getBoundaryTemperatures()[2]+'°C'
	
	
	//Render table
	
    const table = document.getElementById('tableBCS');
    // Clear existing table rows except for the header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Re-add rows for all remaining spaces
    model.spaces.forEach((space, index) => {
		
		if (space.type != "heated"){
			renderBoundaryRow(table, space, index);
		}
    });
}

function renderWallElements() {
    const table = document.getElementById('tableMurs');
    // Clear existing table rows except for the header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Re-add rows for all remaining wall elements
    model.wallElements.forEach(wElement => {
        renderWallElementRow(table, wElement);
    });
}

function renderHeatRecovery(){
	
	var checkbox = document.getElementById('heatRecoveryCheckbox');
    checkbox.checked = model.otherData['heatrecovery']['checked']

	var input = document.getElementById('heatRecoveryEfficiency');
  	input.value  = model.otherData['heatrecovery']['efficiency']  ;

	input.style.display = checkbox.checked ? 'inline' : 'none';  // Show input if checkbox is checked
	
	var unit = document.getElementById('hr_unit')
	unit.style.display = checkbox.checked ? 'inline' : 'none';  // Show input if checkbox is checked

	
	document.getElementById('meanExtractTemperature_value').style.display = checkbox.checked ? 'inline':'none'
	document.getElementById('meanExtractTemperature_value').innerHTML = model.otherData.heatrecovery.meanExtractTemperature !== null ? model.otherData.heatrecovery.meanExtractTemperature.toFixed(0)+"°C" : NaN;

	document.getElementById('meanExtractTemperature_warning').style.display = (checkbox.checked && model.otherData.heatrecovery.meanExtractTemperature == null ) ? 'inline':'none' 
	

	document.getElementById('supplyTemperature_value').style.display = checkbox.checked ? 'inline':'none'
	document.getElementById('supplyTemperature_value').innerHTML = model.otherData.heatrecovery.supplyTemperature.toFixed(0)+"°C"
	document.getElementById('meanExtractTemperature_label').style.display = checkbox.checked ? 'inline':'none'
	document.getElementById('supplyTemperature_label').style.display = checkbox.checked ? 'inline':'none'
	

}

function renderAirTightness(){
	
	unitDisplay = document.getElementById("at_unit")

    // Check the selected value and update the unit display accordingly
    switch(model.otherData.airtightness.choice) {
        case 'v50':
            unitDisplay.textContent = "(m³/h)/m²";  // Set the unit for v50
            break;
        case 'n50':
            unitDisplay.textContent = "vol/h";  // Set the unit for n50
            break;
        case 'Q50':
            unitDisplay.textContent = "m³/h";  // Set the unit for Q50
            break;
        default:
            unitDisplay.textContent = "";  // No unit by default or if something goes wrong
    }
	
	document.getElementById('at_value').value = model.otherData.airtightness.value
}




function toggleVisibility(input) {
    var sections = document.querySelectorAll('.space-section, .main-section');

	console.log("toggle",input)

    sections.forEach(section => {
        if (section.id == input) {
            section.style.display = 'block'; // Show this section
        } else {
            section.style.display = 'none'; // Hide other sections
        }
    });

}
function renderMainTabs() {
    var tabContainer = document.getElementById('maintabs');
    tabContainer.innerHTML = ''; // Clear existing tabs


    var fixedTabs = ['spaces','boundaryconditions', 'wall_elements', 'ventilation']

    for (var i = 0; i < fixedTabs.length; i++) {
        (function (tabName) {
            var tab = document.createElement('button');
			tab.setAttribute('lang-key',tabName)
			tab.setAttribute('class','tab')
            tab.textContent = translations[getCurrentLanguage()][tabName];

            tab.id = 'tab-' + tabName;
            tab.onclick = function () {
                toggleVisibility(tabName);
            };
            tabContainer.appendChild(tab);
        })(fixedTabs[i]); // Pass the current tab name to the IIFE
    }

	var resultsbutton = document.createElement('button');
	resultsbutton.textContent = "results";
	resultsbutton.id = 'tab-results';
	resultsbutton.setAttribute('class','tab')
	resultsbutton.setAttribute('lang-key','results')
	resultsbutton.textContent = translations[getCurrentLanguage()]['results'];
	resultsbutton.onclick = function () {
			toggleVisibility(`resultsContainer`);
	};
	resultsTab = document.getElementById('resultstabs')
	resultsTab.innerHTML = '';
	resultsTab.appendChild(resultsbutton)


}


function switchLanguage(lang) {
    document.querySelectorAll("[lang-key]").forEach(function(element) {
        var key = element.getAttribute("lang-key");
        element.innerHTML = translations[lang][key] || key;
    });
}







function exportData() {
	
    const jsonData = JSON.stringify(model, null, 4); // Beautify the JSON
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'heatload_standard.json'; // Name of the file to download
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up to avoid memory leaks
}

function importData() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
        alert("Please select a file to import.");
        return;
    }

    const file = fileInput.files[0];
    if (file.type !== "application/json") {
        alert("Please select a JSON file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const jsonData = JSON.parse(event.target.result);
			model = new DataModel()
            if (jsonData.spaces && jsonData.wallElements && jsonData.wallInstances) {
                model.spaces = jsonData.spaces;
                model.wallElements = jsonData.wallElements;
                model.wallInstances = jsonData.wallInstances;
				model.otherData = jsonData.otherData;

                // Set counters to one more than the highest ID found in the imported data
                model.spaceIdCounter = Math.max(...model.spaces.map(space => space.id)) + 1;
                model.wallElementsIdCounter = Math.max(...model.wallElements.map(element => element.id)) + 1;
                model.wallInstanceID = Math.max(...model.wallInstances.map(instance => instance.id)) + 1;

				computeAll()
				renderAll()


            } else {
                throw new Error('Invalid data structure');
            }
        } catch (error) {
            alert("Error loading or parsing the file: " + error.message);
        }
    };
    reader.onerror = function() {
        alert("Failed to read the file.");
    };

    reader.readAsText(file);
}


function handleMunicipalityChange(){
	const select_zip = document.getElementById("municipality_select")
	model.setZip(select_zip.value)
	console.log(model.zipCode)
	console.log(model.getBoundaryTemperatures())
	renderBoundariesTable()
	
}

function handleHeatRecoveryCheckBox() {
	
	//update model
    var checkbox = document.getElementById('heatRecoveryCheckbox');
	model.otherData['heatrecovery']['checked']=checkbox.checked

	//rendering (needed since the display changes with the checkbox
	//renderHeatRecovery()
	computeAll()
	renderAll()
}

function handleHeatRecoveryEfficiencyChange() {

	// update model
    var efficiencyInput = document.getElementById('heatRecoveryEfficiency');
	model.otherData['heatrecovery']['efficiency'] = efficiencyInput.value;

	//heat recovery render not to adpat, but other items to be rendered later on
	computeAll()
	renderAll()
	
}

// Function to update the air tightness unit based on selected parameter
function handleAirTightnessChange() {

	//modify data
	model.otherData['airtightness']['choice']=document.getElementById('airTightnessSelect').value
	model.otherData['airtightness']['value'] = document.getElementById('at_value').value;

	computeAll()
	renderAll()
}



// INIT FUNCTIONS 


function createElement(tag, attributes = {}, innerText = '', children = []) {
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

    return element;
}



function initializePage(container_id) {
    // Header
    const header = createElement('h1', { 'lang-key': 'heat_loss_calculation' }, 'Calcul des déperditions thermiques');

    // Data Buttons Section
    const dataButtons = createElement('div', { class: 'data-buttons' }, '', [
        createElement('button', { id: 'exportDataBtn' }, 'Export Data'),
        createElement('button', { id: 'importDataBtn' }, 'Import Data'),
        createElement('input', { id: 'fileInput', type: 'file', style: 'display: none;', onchange: () => importData(this), accept: '.json' })
    ]);
	

    // Tabs Container
    const tabsContainer = createElement('div', { id: 'tabcontainer' }, '', [
        createElement('div', { id: 'maintabs' }),
        createElement('div', { id: 'spacetabs' }),
        createElement('div', { id: 'resultstabs' })
    ]);

    // Boundary Conditions Section
    const boundaryConditions = createElement('div', { id: 'boundaryconditions', class: 'main-section' }, '', [
        createElement('h2', { 'lang-key': 'boundaryconditions' }, 'Environnements extérieurs et voisins'),
		createElement('h3',{'lang-key':'select_municipality'},''),
		createElement('select',{'id':'municipality_select','autocomplete': 'on',onchange: () => handleMunicipalityChange()},'',getWeather('zipcodes').map(value => createElement('option', { value }, value))),
		createElement('p',{},'',[
			createElement('span',{'lang-key':'base_external_temperature'},''),
			createElement('span',{id:'external_temperature'},'-7 °C')
			]),
		createElement('p',{},'',[
			createElement('span',{'lang-key':'month_external_temperature'},''),
			createElement('span',{id:'month_external_temperature'},'-7 °C')
			]),
		createElement('p',{},'',[
			createElement('span',{'lang-key':'year_external_temperature'},''),
			createElement('span',{id:'year_external_temperature'},'-7 °C')
			]),
		createElement('button',{onclick: handleSetDefaultBoundaryTemperatures,'lang-key':'apply_default_temperatures'},''),
		createElement('p',{},''),
        createElement('button', { onclick: handleAddBoundary , class:'add-button'}, '+'),
        createElement('table', { id: 'tableBCS' }, '', [
            createElement('tr', {}, '', [
                createElement('th', { 'lang-key': 'bc_name' }, 'Nom de l’espace ou de l’environnement'),
                createElement('th', { 'lang-key': 'bc_type' }, 'Type d’espace/d’environnement'),
                createElement('th', { 'lang-key': 'bc_temperature' }, 'Température'),
                createElement('th', {}, '')
            ])
        ])
    ]);

    // Spaces Section
    const spaces = createElement('div', { id: 'spaces', class: 'main-section' }, '', [
        createElement('h2', { 'lang-key': 'spaces' }, 'Espaces'),
        createElement('button', { onclick: handleAddSpace ,class:'add-button'}, '+'),
        createElement('table', { id: 'tableSpaces' }, '', [
            createElement('tr', {}, '', [
                createElement('th', { 'lang-key': 'space_name' }, 'Nom de l’espace'),
                createElement('th', { 'lang-key': 'space_temperature' }, 'Température (°C)'),
                createElement('th', { 'lang-key': 'floor_area' }, 'Surface au sol (m²)'),
                createElement('th', { 'lang-key': 'inner_volume' }, 'Volume intérieur (m³)'),
                createElement('th', { 'lang-key': 'heating_type' }, 'Type de chauffage'),
                createElement('th', { }, '' )
            ])
        ])
    ]);

    // Walls Section
    const walls = createElement('div', { id: 'wall_elements', class: 'main-section' }, '', [
        createElement('h2', { 'lang-key': 'walls' }, 'Murs'),
        createElement('button', { onclick: handleAddWallElement, class:'add-button' }, '+'),
        createElement('table', { id: 'tableMurs' }, '', [
            createElement('tr', {}, '', [
                createElement('th', { 'lang-key': 'wall_name' }, 'Nom du wall'),
                createElement('th', { 'lang-key': 'u_value' }, 'Valeur U'),
                createElement('th', { 'lang-key': 'thermal_bridge_coefficient' }, 'Coefficient de pont thermique'),
                createElement('th', {}, '')
            ])
        ])
    ]);

    // Ventilation Section
    const ventilation = createElement('div', { id: 'ventilation', class: 'main-section' }, '', [
        createElement('h2', { 'lang-key': 'air_tightness' }, 'Etanchéité à l’air'),
        createElement('select', { id: 'airTightnessSelect', onchange: handleAirTightnessChange }, '', [
            createElement('option', { value: 'v50', selected: true }, 'v50'),
            createElement('option', { value: 'n50' }, 'n50'),
            createElement('option', { value: 'Q50' }, 'Q50')
        ]),
        createElement('input', { type: 'number', id: 'at_value', min: '1', max: '100', onchange: handleAirTightnessChange }),
        createElement('span', { id: 'at_unit' }, 'at_unit'),
        createElement('div', {}, '', [
            createElement('h2', { 'lang-key': 'heat_recovery' }, 'Récupération de chaleur'),
            createElement('span', { 'lang-key': 'enable_hr' }, 'Enable Heat Recovery'),
            createElement('input', { type: 'checkbox', id: 'heatRecoveryCheckbox', onchange: handleHeatRecoveryCheckBox }),
            createElement('input', { type: 'number', id: 'heatRecoveryEfficiency', min: '0', max: '100', style: 'display: none;', placeholder: 'Rendement', onchange: handleHeatRecoveryEfficiencyChange }),
            createElement('span', { id: 'hr_unit', style: 'display: none;' }, '%'),
            createElement('p'),
            createElement('span', { 'lang-key': 'mean_extract_t', id: 'meanExtractTemperature_label', style: 'display: none;' }),
            createElement('span', { id: 'meanExtractTemperature_value', style: 'display: none;', disabled: true }),
            createElement('span', { id: 'meanExtractTemperature_warning','lang-key': 'extracttemperature_warning', style: 'display: none;'}),
            createElement('p'),
            createElement('span', { 'lang-key': 'supply_t', id: 'supplyTemperature_label', style: 'display: none;' }),
            createElement('span', { id: 'supplyTemperature_value', style: 'display: none;', disabled: true })
        ])
    ]);

    // Main Containers
    const spacesContainer = createElement('div', { id: 'spacesContainer' });
    const resultsContainer = createElement('div', { id: 'resultsContainer', class: 'main-section' });




    // Append all sections to the body
    document.getElementById(container_id).append(
        header,
        dataButtons,
        tabsContainer,
        boundaryConditions,
        spaces,
        walls,
        ventilation,
        spacesContainer,
        resultsContainer
    );
	document.getElementById('exportDataBtn').addEventListener('click', exportData);
	document.getElementById('importDataBtn').addEventListener('click', function() {
    document.getElementById('fileInput').click(); // Trigger the hidden file input click
	});	

}



