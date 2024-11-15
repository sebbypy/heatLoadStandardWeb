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
    const table = document.getElementById('tableSpaces');
	spaceIdCounter++;
    const newSpace = {
		type: "heated",
        name: `Space ${spaceIdCounter}`,
        id: spaceIdCounter,
		temperature:20,
		floorarea:0,
		volume:0,
		heating_type:"radiators",
		transmission_heat_loss: 0,
        ventilation: {
            "natural_supply_flowrate": 0,
            "mechanical_supply_flowrate": 0,
            "transfer_flowrate": 0,
            "transfer_temperature": 0,
            "mechanical_extract_flowrate": 0,
			"infiltration_flowrate":0,
			"extra_infiltration_flowrate":0,
			"ventilation_loss":0
        }
		
    };
    spaces.push(newSpace);
	model.createNewSpace(`Space ${spaceIdCounter}`)
	console.log(model.spaces)
    
	//renderSpaceRow(table, newSpace);
	//renderSpacesTable();
    //renderWallInstances();
	//renderResults();
	renderAll() // new space has 0 flow and no walls --> no computation
	
}

function handleAddBoundary() {
    const table = document.getElementById('tableBCS');
    spaceIdCounter++;
    const newBoundary = {
		type: "unheated",
        name: `Environnement ${spaceIdCounter}`,
        id: spaceIdCounter,
		temperature:-7,
    };
    spaces.push(newBoundary);
	model.createNewBoundary(`Environnement ${spaceIdCounter}`)
	//renderBoundaryRow(table, newBoundary);
    //renderWallInstances();
	renderAll()
}

function addOutsideBoundary() {
    const table = document.getElementById('tableBCS');
    const newBoundary = {
		type: "outside",
        name: `Outside`,
        id: 0,
		temperature:-7,
    };
    spaces.push(newBoundary);
	
	model.createNewBoundary('outside')

	//renderAll()
}



function handleSpacePropertyChange(spaceId, property, value) {
    const space = spaces.find(space => space.id === spaceId);
    if (space) {
        space[property] = value;
		computeAll()
		renderAll()
	}
}
	

function handleAddWallElement() {
    const table = document.getElementById('tableMurs');
    wallElementsIdCounter++;

    const newWallElement = {
        name: `Mur ${wallElementsIdCounter}`,
        id: wallElementsIdCounter,
        uValue: '',  // Assuming default values or form inputs can populate these
        thermalBridge: ''  // Assuming default values or form inputs can populate these
    };

    wallElements.push(newWallElement);

	renderAll() // new element not yet used, no calc
    //renderWallElementRow(table, newWallElement);
    //renderWallInstances();
}

function handleAddWallInstance(indexSpace) {
    const space = spaces[indexSpace];
    const newMurId = wallInstanceID++; // Increment the global wallInstanceID

    // Create a temporary placeholder for the new wall in wallInstances
    wallInstances.push({
        id: newMurId,
        spaces: [space.id], // Initially only include the current space
        elementId: "", // Initialize without a type
        Area: 0, // Initialize with zero area,
		transmissionLoss: 0
    });

	renderAll() // 0 area wall, no calculation needed

    // This function makes sure the UI for the specific space is visible for editing
    toggleVisibility(`space-${indexSpace}`);
}



function handleSpaceNameChange(id, newName) {
    const index = spaces.findIndex(space => space.id === id);
    if (index !== -1) {  // Check if the space was found
        spaces[index].name = newName;
        renderWallInstances();
    } else {
        console.error("Space not found with id:", id);
    }
	renderAll()
}


function handleWallNameChange(wallElementId, newName) {
    const element = wallElements.find(element => element.id === wallElementId);
    if (element) {
        element.name = newName;
    }
	renderAll() // no calc needed
}

function handleWalUValueChange(wallElementId, newUValue) {
	
	// updating model
    const element = wallElements.find(element => element.id === wallElementId);
    if (element) {
        element.uValue = parseFloat(newUValue);
    }
	
	// render dependent element
	//renderWallInstances()
	computeAll()
	renderAll()
}

function handleWallThermalBridgeChange(wallElementId, newThermalBridge) {
    const element = wallElements.find(element => element.id === wallElementId);
    if (element) {
        element.thermalBridge = parseFloat(newThermalBridge);
    }
	computeAll()
	renderAll()
	//renderWallInstances()

}

function handleVentilationChange(spaceId, parameter, value){
    var space = spaces.find(e => e.id === spaceId);
    if (space) {
        space.ventilation[parameter] = value;
		//computeVentilationLoss(space,spaces,otherData);
		computeAll()
		renderAll()
    }
	//renderVentilationTable()
}

function handleWallInstanceAreaChange(wallId, newArea,callerspaceid) {
    const wallInstance = wallInstances.find(m => m.id === wallId);
    if (wallInstance) {
        wallInstance.Area = Number(newArea);
	}

	computeWallInstanceLoss(wallInstance,spaces,wallElements,wallInstances)
	renderWallInstances(); // Optionally refresh UI to reflect changes
	toggleVisibility(`space-${callerspaceid}`)
}



function handleWallInstanceTypeChange(wallId, newTypeId,callerspaceid) {
	wallId = Number(wallId);  // Convert to number
    newTypeId = Number(newTypeId);
    const wallInstance = wallInstances.find(m => m.id === wallId);
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
    const wallInstance = wallInstances.find(m => m.id === wallId);
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

    wallInstances = wallInstances.filter(wall => wall.id !== wallId);

    computeAll()
	renderAll()

	toggleVisibility(`space-${callerspaceid}`)

}


// ----------------------
// Compute full case
// ----------------------

function computeAll(){
	computeEquilibriumTemperatures()
	computeExtractMeanTemperature()
	computeSupplyTemperature()
	computeAllWallInstanceLosses()
	computeAllVentilationLosses()
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
    row.insertCell(5).innerHTML = `<button onclick="handleDeleteSpace(${space.id})">Delete</button>`;
	
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
    const bctype = [
        //{ value: "outside", label: "Extérieur" },
        { value: "ground", label: "Sol" },
        { value: "other", label: "Autre" }
    ];

    // Create cells with input/select elements and set their contents
    row.insertCell(0).innerHTML = `<input type="text" name="nameSpace${space.id}" value="${space.name}" onchange="handleSpaceNameChange(${space.id}, this.value)">`;

	if (space.type == 'outside'){
		row.insertCell(1).innerHTML = translations[getCurrentLanguage()]['outside'];
	}
	else{
		row.insertCell(1).innerHTML = `<select name="bcType${space.id}" onchange="handleSpacePropertyChange(${space.id}, 'type', this.value)">` +
			bctype.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('') +
			`</select>`;
	}

    row.insertCell(2).innerHTML = `<input type="number" name="tempRef${space.id}" value="${space.temperature}" onchange="handleSpacePropertyChange(${space.id}, 'temperature', this.value)">`;

	if (space.type == 'outside'){
	
		row.insertCell(3).innerHTML = ``;	
	}
	else{

		row.insertCell(3).innerHTML = `<button onclick="handleDeleteSpace(${space.id})">Delete</button>`;
	}
}



function renderResults(){
    // Define the headers of the table
    const headers_keys = ["spaces", "transmission_heat_loss", "ventilation_heat_loss", "heatup_loss","total_heat_loss"];
    
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

    // Create the table rows based on the provided data
    spaces.forEach(space => {
		
		if (space.type == "heated"){
		
			const row = document.createElement("tr");

			const td = document.createElement("td");		
			td.textContent = space.name;
			row.appendChild(td);

			const td0 = document.createElement("td");
			td0.textContent = space.transmission_heat_loss.toFixed(0);
			row.appendChild(td0);

			const td1 = document.createElement("td");
			td1.textContent = space.ventilation.ventilation_loss.toFixed(0);
			row.appendChild(td1);

			const td2 = document.createElement("td");
			td2.textContent = 0;
			row.appendChild(td2);


			const td3 = document.createElement("td");
			td3.textContent = (space.ventilation.ventilation_loss+space.transmission_heat_loss).toFixed(0);
			row.appendChild(td3);
			
			
			table.appendChild(row);
		}
    });

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
    row.insertCell(3).innerHTML = `<button onclick="handleDeleteWallElement(${wElement.id})">Delete</button>`;
}

function renderTabs(){

    renderMainTabs(); 

	var spaceTabs = document.getElementById('spacetabs')
    spaceTabs.innerHTML = ''; // Clear previous tabs to refresh them

    var container = document.getElementById('spacesContainer');
    container.innerHTML = ''; // Clear existing tables

    spaces.forEach((space, index) => {

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
	
	//renderTabs()
	//computeAllWallInstanceLosses()


    var container = document.getElementById('spacesContainer');
    container.innerHTML = ''; // Clear existing tables

    spaces.forEach((space, index) => {

		var spaceTotalLoss = 0;
		var spaceTotalSurface = 0;

        var spaceDiv = document.createElement('div');
        spaceDiv.className = 'space-section';
        spaceDiv.id = `space-${index}`;
        spaceDiv.style.display = 'none'; // Start with the table hidden
 

		spaceDiv.innerHTML = `
            <h3>Space: ${space.name}</h3>
            <button lang-key="add_wall" onclick="handleAddWallInstance(${index})">${translations[getCurrentLanguage()]['add_wall']}</button>
            <table>
                <tr>
                    <th lang-key='wall'>Mur</th>
                    <th lang-key='neighbour_space'>Espace Voisin</th>
                    <th lang-key='wall_area'>Surface du Mur (m²)</th>
					<th lang-key="transmission_heat_loss">${translations[getCurrentLanguage()]['transmission_heat_loss']}</th>
                    <th lang-key='actions'>Actions</th>
                </tr>
                ${wallInstances.filter(wall => wall.spaces.includes(space.id)).map(wall => {
                    const linkedSpaceId = wall.spaces.find(id => id !== space.id);
                    const linkedSpace = spaces.find(e => e.id === linkedSpaceId);
					
					const multiplier = wall.spaces.indexOf(space.id) == 0 ? 1 : -1; // heatloss computed from as space[0].t - space[1].t. So, adapting sign to position of current space in the list

					spaceTotalLoss += multiplier*wall.transmissionLoss
					spaceTotalSurface += wall.Area

					
                    return `
                        <tr>
						   <td>
								<select onchange="handleWallInstanceTypeChange(${wall.id}, this.value, ${index})">
								<option value="">
									${wallElements.map(wElement => `
										<option value="${wElement.id}" ${wall.elementId == wElement.id ? 'selected' : ''}>${wElement.name}</option>
									`).join('')}
								</select>
							</td>
							<td>
								<select onchange="handleNeighbourSpaceChange(${wall.id}, this.value, ${index})">
								<option value="">
									${spaces.filter(otherSpace => otherSpace.id !== space.id).map(otherSpace => `
										<option value="${otherSpace.id}" ${linkedSpaceId == otherSpace.id ? 'selected' : ''}>${otherSpace.name}</option>
									`).join('')}
								</select>
							</td>
							<td><input type="number" value="${wall.Area}" onchange="handleWallInstanceAreaChange(${wall.id}, this.value, ${index})"></td>
							<td><input name=lossWallInstance${wall.id} type="text" value=${(wall.transmissionLoss*multiplier).toFixed(0)} disabled="disabled"></td>
							<td><button onclick="handleDeleteWallInstance(${wall.id},${index})">Supprimer</button></td>

                        </tr>
                    `;
                }).join('')}
				<tr>
				<td>TOTAL</td>
				<td></td>
				<td>${spaceTotalSurface.toFixed(1)}</td>
				<td>${spaceTotalLoss.toFixed(0)}</td>
				<td></td>
				<tr>
            </table>
        `;
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

    // Create rows for each space
    spaces.forEach(space => {
			
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
			});

			var cell = document.createElement('td');
			var input = document.createElement('input');
			input.type = 'text';
			input.value = space.ventilation.ventilation_loss.toFixed(0);
			input.disabled = true; // Make the input read-only
			input.name = "ventilationLoss"+space.id
			cell.appendChild(input);
			row.appendChild(cell);
			

			table.appendChild(row);
		}
    });
}




function renderSpacesTable() {
    const table = document.getElementById('tableSpaces');
    // Clear existing table rows except for the header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Re-add rows for all remaining spaces
    spaces.forEach((space, index) => {
		if (space.type == "heated"){
			renderSpaceRow(table, space, index);
		}
    });
}

function renderBoundariesTable() {
    const table = document.getElementById('tableBCS');
    // Clear existing table rows except for the header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Re-add rows for all remaining spaces
    spaces.forEach((space, index) => {
		
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
    wallElements.forEach(wElement => {
        renderWallElementRow(table, wElement);
    });
}

function renderHeatRecovery(){
	
	var checkbox = document.getElementById('heatRecoveryCheckbox');
    checkbox.checked = otherData['heatrecovery']['checked']

	var input = document.getElementById('heatRecoveryEfficiency');
  	input.value  =otherData['heatrecovery']['efficiency']  ;

	input.style.display = checkbox.checked ? 'inline' : 'none';  // Show input if checkbox is checked
	
	var unit = document.getElementById('hr_unit')
	unit.style.display = checkbox.checked ? 'inline' : 'none';  // Show input if checkbox is checked

	
	document.getElementById('meanExtractTemperature_value').style.display = checkbox.checked ? 'inline':'none'
	document.getElementById('meanExtractTemperature_value').value = otherData.heatrecovery.meanExtractTemperature !== null ? otherData.heatrecovery.meanExtractTemperature.toFixed(0) : translations[getCurrentLanguage()]["null_extract_flow"];

	document.getElementById('supplyTemperature_value').style.display = checkbox.checked ? 'inline':'none'
	document.getElementById('supplyTemperature_value').value = otherData.heatrecovery.supplyTemperature.toFixed(0)

	document.getElementById('meanExtractTemperature_label').style.display = checkbox.checked ? 'inline':'none'
	document.getElementById('supplyTemperature_label').style.display = checkbox.checked ? 'inline':'none'
	

}

function renderAirTightness(){
	
	unitDisplay = document.getElementById("at_unit")

    // Check the selected value and update the unit display accordingly
    switch(otherData.airtightness.choice) {
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
	
	document.getElementById('at_value').value = otherData.airtightness.value
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




function handleDeleteSpace(spaceId) {
    // Check if the space is referenced in any wall instances
    const isReferenced = wallInstances.some(wall => wall.spaces.includes(spaceId));

    if (isReferenced) {
        alert("Cannot delete this space because it is referenced in wall instances.");
    } else {
        // Proceed with deletion: Remove the space from the array
        spaces = spaces.filter(space => space.id !== spaceId);

		renderTabs();
        renderSpacesTable();  
		renderBoundariesTable();
		renderWallInstances();
		renderResults()
    }
}


function handleDeleteWallElement(wallElementId) {
    // Check if the wall element is referenced in any wall instances
    const isReferenced = wallInstances.some(wall => wall.elementId === wallElementId);

    if (isReferenced) {
        alert("Cannot delete this wall element because it is referenced in wall instances.");
    } else {
        // Proceed with deletion: Remove the wall element from the array
        wallElements = wallElements.filter(wElement => wElement.id !== wallElementId);
        renderWallElements();  // Re-render the wall elements table to reflect deletion

        // Optional: Update other components that might be affected
        renderWallInstances();
    }
}





function exportData() {
	
    // Assuming `spaces` and `wallElements` are your data
    const dataToExport = {
        spaces: spaces,
        wallElements: wallElements,
		wallInstances: wallInstances,
		otherData: otherData
    };
    const jsonData = JSON.stringify(dataToExport, null, 4); // Beautify the JSON
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
            if (jsonData.spaces && jsonData.wallElements && jsonData.wallInstances) {
                spaces = jsonData.spaces;
                wallElements = jsonData.wallElements;
                wallInstances = jsonData.wallInstances;
				otherData = jsonData.otherData;

                // Set counters to one more than the highest ID found in the imported data
                spaceIdCounter = Math.max(...spaces.map(space => space.id)) + 1;
                wallElementsIdCounter = Math.max(...wallElements.map(element => element.id)) + 1;
                wallInstanceID = Math.max(...wallInstances.map(instance => instance.id)) + 1;

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



function handleHeatRecoveryCheckBox() {
	
	//update model
    var checkbox = document.getElementById('heatRecoveryCheckbox');
	otherData['heatrecovery']['checked']=checkbox.checked

	//rendering (needed since the display changes with the checkbox
	//renderHeatRecovery()
	computeAll()
	renderAll()
}

function handleHeatRecoveryEfficiencyChange() {

	// update model
    var efficiencyInput = document.getElementById('heatRecoveryEfficiency');
	otherData['heatrecovery']['efficiency'] = efficiencyInput.value;

	//heat recovery render not to adpat, but other items to be rendered later on
	computeAll()
	renderAll()
	
}

// Function to update the air tightness unit based on selected parameter
function handleAirTightnessChange() {

	//modify data
	otherData['airtightness']['choice']=document.getElementById('airTightnessSelect').value
	otherData['airtightness']['value'] = document.getElementById('at_value').value;

	//update calculations
	computeAllVentilationLosses()

	// render
	renderAirTightness()
}






