function getCurrentLanguage() {
    var selector = document.getElementById('languageSelector');
    return selector.value;
}


function generateSpaceRow(table, espace) {
    const row = table.insertRow(-1);  // Append row at the end of the table
    const heatingOptions = [
        { value: "radiateurs", label: "Radiateurs" },
        { value: "systemeChauffage", label: "Système de chauffage" }
    ];

    // Create cells with input/select elements and set their contents
    row.insertCell(0).innerHTML = `<input type="text" name="nomEspace${espace.id}" value="${espace.nom}" onchange="updateEspaceName(${espace.id}, this.value)">`;
    row.insertCell(1).innerHTML = `<input type="number" name="tempRef${espace.id}" value="${espace.temperature}" onchange="updateSpaceProperty(${espace.id}, 'temperature', this.value)">`;
    row.insertCell(2).innerHTML = `<input type="number" name="surfaceSol${espace.id}" value="${espace.floorarea}" onchange="updateSpaceProperty(${espace.id}, 'floorarea', this.value)">`;
    row.insertCell(3).innerHTML = `<input type="number" name="volume${espace.id}" value="${espace.volume}" onchange="updateSpaceProperty(${espace.id}, 'volume', this.value)">`;
    row.insertCell(4).innerHTML = `<select name="typeChauffage${espace.id}" onchange="updateSpaceProperty(${espace.id}, 'heating_type', this.value)">` +
        heatingOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('') +
        `</select>`;
    row.insertCell(5).innerHTML = `<button onclick="deleteSpace(${espace.id})">Delete</button>`;
}


function generateBoundaryRow(table, espace, index) {
    const row = table.insertRow(-1);  // Append row at the end of the table
    const bctype = [
        { value: "outside", label: "Extérieur" },
        { value: "ground", label: "Sol" },
        { value: "other", label: "Autre" }
    ];

    // Create cells with input/select elements and set their contents
    row.insertCell(0).innerHTML = `<input type="text" name="nomEspace${espace.id}" value="${espace.nom}" onchange="updateEspaceName(${espace.id}, this.value)">`;
    row.insertCell(1).innerHTML = `<select name="bcType${espace.id}" onchange="updateSpaceProperty(${espace.id}, 'type', this.value)">` +
        bctype.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('') +
        `</select>`;
    row.insertCell(2).innerHTML = `<input type="number" name="tempRef${espace.id}" value="${espace.temperature}" onchange="updateSpaceProperty(${espace.id}, 'temperature', this.value)">`;
    row.insertCell(3).innerHTML = `<button onclick="deleteSpace(${espace.id})">Delete</button>`;
}



function ajouterEspace() {
    const table = document.getElementById('tableEspaces');
    spaceIdCounter++;
    const newSpace = {
		type: "heated",
        nom: `Espace ${spaceIdCounter}`,
        id: spaceIdCounter,
		temperature:20,
		floorarea:0,
		volume:0,
		heating_type:"",
        ventilation: {
            "natural_supply_flowrate": 0,
            "mechanical_supply_flowrate": 0,
            "transfer_flowrate": 0,
            "transfer_temperature": 0,
            "mechanical_extract_flowrate": 0
        }
    };
    espaces.push(newSpace);
    generateSpaceRow(table, newSpace);
    updateMurEspaceSection();
}

function addBoundary() {
    const table = document.getElementById('tableBCS');
    spaceIdCounter++;
    const newBoundary = {
		type: "unheated",
        nom: `Environnement ${spaceIdCounter}`,
        id: spaceIdCounter,
		temperature:-7,
    };
    espaces.push(newBoundary);
    generateBoundaryRow(table, newBoundary);
    updateMurEspaceSection();
}

function updateSpaceProperty(spaceId, property, value) {
    const space = espaces.find(espace => espace.id === spaceId);
    if (space) {
		console.log("chang",property,value)
        space[property] = value;
    }
}
function generateWallElementRow(table, wElement) {
    const row = table.insertRow(-1); // Append row at the end of the table

    // Create cells with input/select elements and set their contents
    row.insertCell(0).innerHTML = `<input type="text" name="nomMur${wElement.id}" value="${wElement.nom}" onchange="updateWallName(${wElement.id}, this.value)">`;
    row.insertCell(1).innerHTML = `<input type="number" name="valeurU${wElement.id}" value="${wElement.uValue}" onchange="updateWallUValue(${wElement.id}, this.value)">`;
    row.insertCell(2).innerHTML = `<input type="number" name="pontThermique${wElement.id}" value="${wElement.thermalBridge}" onchange="updateWallThermalBridge(${wElement.id}, this.value)">`;
    row.insertCell(3).innerHTML = `<button onclick="deleteWallElement(${wElement.id})">Delete</button>`;
}


function ajouterMur() {
    const table = document.getElementById('tableMurs');
    wallElementsIdCounter++;

    const newWallElement = {
        nom: `Mur ${wallElementsIdCounter}`,
        id: wallElementsIdCounter,
        uValue: '',  // Assuming default values or form inputs can populate these
        thermalBridge: ''  // Assuming default values or form inputs can populate these
    };

    wallElements.push(newWallElement);
    generateWallElementRow(table, newWallElement);
    updateMurEspaceSection();
}

function updateTabs(){
	var spaceTabs = document.getElementById('spacetabs')
    spaceTabs.innerHTML = ''; // Clear previous tabs to refresh them
    initTabs(); // Re-initialize tabs if necessary or maintain existing tab initialization outside this function

    var container = document.getElementById('espacesContainer');
    container.innerHTML = ''; // Clear existing tables

    espaces.forEach((espace, index) => {

		if (espace.type == "heated"){

			// Create a tab for each space
			var tab = document.createElement('button');
			tab.textContent = espace.nom;
			tab.id = 'tab-espace-' + index;
			tab.onclick = function () {
				toggleVisibility(`espace-${index}`);
			};
			spaceTabs.appendChild(tab);
		}
	})
}	

function updateMurEspaceSection() {
	
	updateTabs()

    var container = document.getElementById('espacesContainer');
    container.innerHTML = ''; // Clear existing tables

    espaces.forEach((espace, index) => {

        var espaceDiv = document.createElement('div');
        espaceDiv.className = 'espace-section';
        espaceDiv.id = `espace-${index}`;
        espaceDiv.style.display = 'none'; // Start with the table hidden
 

		espaceDiv.innerHTML = `
            <h3>Espace: ${espace.nom}</h3>
            <button onclick="prepareNewLine(${index})">Ajouter Mur</button>
            <table>
                <tr>
                    <th lang-key='wall'>Mur</th>
                    <th lang-key='neighbour_space'>Espace Voisin</th>
                    <th lang-key='wall_area'>Surface du Mur (m²)</th>
                    <th lang-key='actions'>Actions</th>
                </tr>
                ${murInstances.filter(mur => mur.spaces.includes(espace.id)).map(mur => {
                    const linkedSpaceId = mur.spaces.find(id => id !== espace.id);
                    const linkedSpace = espaces.find(e => e.id === linkedSpaceId);
                    return `
                        <tr>
						   <td>
								<select onchange="updateMurType(${mur.id}, this.value, ${index})">
								<option value="">
									${wallElements.map(wElement => `
										<option value="${wElement.id}" ${mur.elementId == wElement.id ? 'selected' : ''}>${wElement.nom}</option>
									`).join('')}
								</select>
							</td>
							<td>
								<select onchange="updateLinkedSpace(${mur.id}, this.value, ${index})">
								<option value="">
									${espaces.filter(space => space.id !== espace.id).map(space => `
										<option value="${space.id}" ${linkedSpaceId == space.id ? 'selected' : ''}>${space.nom}</option>
									`).join('')}
								</select>
							</td>
							<td><input type="number" value="${mur.Area}" onchange="updateMurArea(${mur.id}, this.value, ${index})"></td>
							<td><button onclick="deleteMurInstance(${mur.id},${index})">Supprimer</button></td>
                        </tr>
                    `;
                }).join('')}
            </table>
        `;
        container.appendChild(espaceDiv);
    });

    createVentilationTableStructure(); // Ensure the ventilation table is also updated
}



function toggleVisibility(input) {
    var sections = document.querySelectorAll('.espace-section, .main-section');

    sections.forEach(section => {
        if (section.id == input) {
            section.style.display = 'block'; // Show this section
        } else {
            section.style.display = 'none'; // Hide other sections
        }
    });

}
function prepareNewLine(indexEspace) {
    const espace = espaces[indexEspace];
    const newMurId = murInstanceID++; // Increment the global murInstanceID

    // Create a temporary placeholder for the new mur in murInstances
    murInstances.push({
        id: newMurId,
        spaces: [espace.id], // Initially only include the current space
        elementId: "", // Initialize without a type
        Area: 0 // Initialize with zero area
    });

    // This function refreshes the UI to include the new mur placeholder for editing
    updateMurEspaceSection();

    // This function makes sure the UI for the specific espace is visible for editing
    toggleVisibility(`espace-${indexEspace}`);
}


function updateEspaceName(index, newName) {
    espaces[index].nom = newName;
    updateMurEspaceSection();
}

function updateMurName(indexEspace, indexMur, newName) {
    espaces[indexEspace].wallElements[indexMur].nom = newName;
}

function updateVoisinName(indexEspace, indexMur, newName) {
    espaces[indexEspace].wallElements[indexMur].espaceVoisin = newName;
}

function updateSurface(indexEspace, indexMur, newSurface) {
    espaces[indexEspace].wallElements[indexMur].surface = newSurface;
}

function updateWallName(wallElementId, newName) {
    const element = wallElements.find(element => element.id === wallElementId);
    if (element) {
        element.nom = newName;
    }
	updateMurEspaceSection()
}
function updateWallUValue(wallElementId, newUValue) {
    const element = wallElements.find(element => element.id === wallElementId);
    if (element) {
        element.uValue = parseFloat(newUValue);
    }
}

function updateWallThermalBridge(wallElementId, newThermalBridge) {
    const element = wallElements.find(element => element.id === wallElementId);
    if (element) {
        element.thermalBridge = parseFloat(newThermalBridge);
    }
}

function initTabs() {
    var tabContainer = document.getElementById('maintabs');
    tabContainer.innerHTML = ''; // Clear existing tabs


    var fixedTabs = ['boundaryconditions','spaces', 'wall_elements', 'ventilation']

    for (var i = 0; i < fixedTabs.length; i++) {
        (function (tabName) {
            var tab = document.createElement('button');
			tab.setAttribute('lang-key',tabName)
            tab.textContent = translations[getCurrentLanguage()][tabName];

            tab.id = 'tab-' + tabName;
            tab.onclick = function () {
                toggleVisibility(tabName);
            };
            tabContainer.appendChild(tab);
        })(fixedTabs[i]); // Pass the current tab name to the IIFE
    }

}

function initializeVentilationTable() {
    var container = document.getElementById('ventilation');
    var table = document.createElement('table');
    table.id = 'ventilationTable';
    container.appendChild(table);

    // Initialize headers and rows with empty inputs
    createVentilationTableStructure();
}


function createVentilationTableStructure() {
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
    table.appendChild(headerRow);

    // Create rows for each space
    espaces.forEach(espace => {
			
		if (espace.type == "heated"){
			
			var row = document.createElement('tr');
			var labelCell = document.createElement('td');
			labelCell.textContent = espace.nom;
			row.appendChild(labelCell);

			parameters.forEach(param => {
				var cell = document.createElement('td');
				var input = document.createElement('input');
				input.type = 'number';
				input.value = espace.ventilation[param] || '';
				input.onchange = () => saveVentilationData(espace.id, param, input.value);
				cell.appendChild(input);
				row.appendChild(cell);
			});

			table.appendChild(row);
		}
    });
}


function updateVentilationTableHeaders() {
    var table = document.getElementById('ventilationTable');
    var headersRow = table.querySelector('tr');

    // Update headers for current parameters
    var parameters = [
        "natural_supply_flowrate",
        "mechanical_supply_flowrate",
        "transfer_flowrate",
        "transfer_temperature",
        "mechanical_extract_flowrate"
    ];

    parameters.forEach((param, index) => {
        var existingHeader = headersRow.cells[index + 1]; // +1 because the first cell is the label column
        if (!existingHeader) {
            var header = document.createElement('th');
            header.textContent = translations[getCurrentLanguage()][param];
            headersRow.appendChild(header);
        } else {
            existingHeader.textContent = translations[getCurrentLanguage()][param];
        }
    });

    // Adjust the number of columns in each row to match the number of parameters
    Array.from(table.querySelectorAll('tr')).forEach(row => {
        while (row.cells.length - 1 < parameters.length) {
            var cell = document.createElement('td');
            cell.innerHTML = `<input type="number" placeholder="Value">`;
            row.appendChild(cell);
        }
        while (row.cells.length - 1 > parameters.length) {
            row.removeChild(row.lastChild);
        }
    });
}


function saveVentilationData(espaceId, parameter, value) {
    var espace = espaces.find(e => e.id === espaceId);
    if (espace) {
        espace.ventilation[parameter] = value;
    }
}

function updateMurArea(murId, newArea,callerspaceid) {
    const mur = murInstances.find(m => m.id === murId);
    if (mur) {
        mur.Area = Number(newArea);
	}
	updateMurEspaceSection(); // Optionally refresh UI to reflect changes
	toggleVisibility(`espace-${callerspaceid}`)
}



// Function to update the type of a mur based on the selected option in the dropdown
function updateMurType(murId, newTypeId,callerspaceid) {
    // Find the mur object in murInstances array with the given id
	murId = Number(murId);  // Convert to number
    newTypeId = Number(newTypeId);
    const mur = murInstances.find(m => m.id === murId);
    if (mur) {
        // Update the murType property of the found mur object
        mur.elementId = newTypeId;
    } else {
        console.error('Mur not found with id:', murId);
    }
	updateMurEspaceSection(); // Optionally refresh UI to reflect changes
	toggleVisibility(`espace-${callerspaceid}`)
}

// Function to update the linked space of a mur based on the selected option in the dropdown
function updateLinkedSpace(murId, newSpaceId,callerspaceid) {
	murId = Number(murId);  // Convert to number
    newSpaceId = Number(newSpaceId);

    // Find the mur object in murInstances array with the given id
    const mur = murInstances.find(m => m.id === murId);
    if (mur) {
        // Update the spaces property to include the new linked space.
        // This assumes that the first space in the array remains unchanged and the second space is the linked one.
        // If the mur only had one space originally (the current space), add the new space as linked.
        if (mur.spaces.length === 1) {
            mur.spaces.push(newSpaceId); // Add new linked space if only one was initially present
        } else {
            mur.spaces[1] = newSpaceId; // Replace existing linked space
        }
		
    } else {
        console.error('Mur not found with id:', murId);
    }
	updateMurEspaceSection(); // Optionally refresh UI to reflect changes
	toggleVisibility(`espace-${callerspaceid}`)


}

function deleteMurInstance(murId,callerspaceid) {
    // Filter out the mur to be deleted from the murInstances array
    murInstances = murInstances.filter(mur => mur.id !== murId);

    // Optionally, re-render the section or the whole table to reflect the change
    updateMurEspaceSection();  // Assuming this function re-renders the updated tables
	toggleVisibility(`espace-${callerspaceid}`)

}



function displayMurInstance(){
	for (var i=0;i<murInstances.length;i++){
		console.log(murInstances[i])
	}
}


var translations = {
    'fr': {
        "heat_loss_calculation": "Calcul des déperditions thermiques",
        "spaces": "Espaces",
        "add_space": "Ajouter un espace",
        "space_name": "Nom de l'espace",
        "space_temperature": "Température (°C)",
        "floor_area": "Surface au sol (m²)",
        "interior_volume": "Volume intérieur (m³)",
        "heating_type": "Type de chauffage",
        "walls": "Murs",
        "add_wall": "Ajouter un mur",
        "wall_name": "Nom du mur",
        "u_value": "Valeur U",
        "thermal_bridge_coefficient": "Coefficient de pont thermique",
        "ventilation": "Ventilation",
		"wall_elements":"Types de parois",
		"natural_supply_flowrate": "Débit d'alimentation naturelle [m³/h]",
		"mechanical_supply_flowrate": "Débit d'alimentation mécanique [m³/h]",
		"transfer_flowrate": "Débit de transfert [m³/h]",
		"transfer_temperature": "Température de l'air transféré [°C]",
		"mechanical_extract_flowrate": "Débit d'extraction mécanique [m³/h]",
		"air_tightness":"Etanchéité à l'air",
		"enable_hr": "Récupération de chaleur ?",
		"heat_recovery":"Récupération de chaleur",
		"boundaryconditions":"Environnements voisins"

    },
	'nl': {
        "heat_loss_calculation": "Warmteverlies berekening",
        "spaces": "Ruimtes",
        "add_space": "Ruimte toevoegen",
        "space_name": "Naam",
        "space_temperature": "Binnentemperatuur (°C)",
        "floor_area": "Vloeroppervlakte (m²)",
        "interior_volume": "Binnenvolume (m³)",
        "heating_type": "Type de chauffage",
        "walls": "Wanden",
        "add_wall": "Wand toevoegen",
        "wall_name": "Naam",
        "u_value": "U-waarde",
        "thermal_bridge_coefficient": "Koudebrug coefficient",
        "ventilation": "Ventilatie",
		"wall_elements":"Constructief elementen",
		"natural_supply_flowrate": "Natuurlijk toevoer [m³/h]",
		"mechanical_supply_flowrate": "Mecanische toevoer [m³/h]",
		"transfer_flowrate": "Doorvoer [m³/h]",
		"transfer_temperature": "Doorvoerlucht temperatuur [°C]",
		"mechanical_extract_flowrate": "Mecanische afvoer [m³/h]",
		"air_tightness":"Luchtdicththeid",
		"enable_hr": "Warmterecuperatie ?",
		"heat_recovery":"Warmterecuperatie",
		"boundaryconditions":"Randvoorwarden"


    },

    // Add additional languages here
};

function switchLanguage(lang) {
    document.querySelectorAll("[lang-key]").forEach(function(element) {
        var key = element.getAttribute("lang-key");
        element.innerHTML = translations[lang][key] || key;
    });
}


// Function to update the air tightness unit based on selected parameter
function updateAirTightnessUnit() {
    const select = document.getElementById('airTightnessSelect');
    const unitDisplay = document.getElementById('at_unit');

    // Check the selected value and update the unit display accordingly
    switch(select.value) {
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
}
function deleteSpace(spaceId) {
    // Check if the space is referenced in any mur instances
    const isReferenced = murInstances.some(mur => mur.spaces.includes(spaceId));

    if (isReferenced) {
        alert("Cannot delete this space because it is referenced in wall instances.");
    } else {
        // Proceed with deletion: Remove the space from the array
        espaces = espaces.filter(espace => espace.id !== spaceId);

		updateTabs();
        updateSpacesTable();  
		updateBoundaryTable();
    }
}
function deleteWallElement(wallElementId) {
    // Check if the wall element is referenced in any mur instances
    const isReferenced = murInstances.some(mur => mur.elementId === wallElementId);

    if (isReferenced) {
        alert("Cannot delete this wall element because it is referenced in wall instances.");
    } else {
        // Proceed with deletion: Remove the wall element from the array
        wallElements = wallElements.filter(wElement => wElement.id !== wallElementId);
        updateWallElementsTable();  // Re-render the wall elements table to reflect deletion

        // Optional: Update other components that might be affected
        updateMurEspaceSection();
    }
}


function updateSpacesTable() {
    const table = document.getElementById('tableEspaces');
    // Clear existing table rows except for the header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Re-add rows for all remaining spaces
    espaces.forEach((espace, index) => {
		
		if (espace.type == "heated"){
			generateSpaceRow(table, espace, index);
		}
    });
}

function updateBoundaryTable() {
    const table = document.getElementById('tableBCS');
    // Clear existing table rows except for the header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Re-add rows for all remaining spaces
    espaces.forEach((espace, index) => {
		
		if (espace.type != "heated"){
			generateBoundaryRow(table, espace, index);
		}
    });
}

function updateWallElementsTable() {
    const table = document.getElementById('tableMurs');
    // Clear existing table rows except for the header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Re-add rows for all remaining wall elements
    wallElements.forEach(wElement => {
        generateWallElementRow(table, wElement);
    });
}


function exportData() {
	
    // Assuming `espaces` and `wallElements` are your data
    const dataToExport = {
        espaces: espaces,
        wallElements: wallElements,
		murInstances: murInstances,
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
            if (jsonData.espaces && jsonData.wallElements && jsonData.murInstances) {
                espaces = jsonData.espaces;
                wallElements = jsonData.wallElements;
                murInstances = jsonData.murInstances;
				otherData = jsonData.otherData;

                // Set counters to one more than the highest ID found in the imported data
                spaceIdCounter = Math.max(...espaces.map(espace => espace.id)) + 1;
                wallElementsIdCounter = Math.max(...wallElements.map(element => element.id)) + 1;
                murInstanceID = Math.max(...murInstances.map(instance => instance.id)) + 1;

                // Update the UI
                updateSpacesTable();
				updateBoundaryTable();
                updateWallElementsTable();
                updateMurEspaceSection();
				updateHeatRecovery();
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


function updateHeatRecovery(){
	
	var checkbox = document.getElementById('heatRecoveryCheckbox');
    checkbox.checked = otherData['heatrecovery']['checked']

	var efficiencyInput = document.getElementById('heatRecoveryEfficiency');
  	efficiencyInput.value  =otherData['heatrecovery']['efficiency']  ;
	
	toggleHeatRecoveryEfficiency() //show or hide efficiency depening on checkbox
}

function toggleHeatRecoveryEfficiency() {
    var checkbox = document.getElementById('heatRecoveryCheckbox');
    var input = document.getElementById('heatRecoveryEfficiency');
    input.style.display = checkbox.checked ? 'inline' : 'none';  // Show input if checkbox is checked
	
	var unit = document.getElementById('hr_unit')
	unit.style.display = checkbox.checked ? 'inline' : 'none';  // Show input if checkbox is checked

	otherData['heatrecovery']['checked']=checkbox.checked

}


function updateHeatRecoveryEfficiency() {
    var efficiencyInput = document.getElementById('heatRecoveryEfficiency');
    // Update the efficiency value in the global variable
    	otherData['heatrecovery']['efficiency'] = efficiencyInput.value;
}
