function ajouterEspace() {
    var table = document.getElementById('tableEspaces');
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    var defaultName = `Espace ${rowCount}`;
    cell1.innerHTML = `<input type="text" name="nomEspace${rowCount}" value="${defaultName}" onchange="updateEspaceName(${rowCount - 1}, this.value)">`;
    cell2.innerHTML = `<input type="number" name="tempRef${rowCount}">`;
    cell3.innerHTML = `<input type="number" name="surfaceSol${rowCount}">`;
    cell4.innerHTML = `<input type="number" name="volume${rowCount}">`;
    cell5.innerHTML = `<select name="typeChauffage${rowCount}"><option value="radiateurs">Radiateurs</option><option value="systemeChauffage">Système de chauffage</option></select>`;
    espaces.push({
        nom: defaultName,
        id: rowCount,
        ventilation: {
            "débit d'alimentation naturel": 0,
            "débit d'alimentation mécanique": 0,
            "débit de transfert": 0,
            "température du transfert": 0,
            "débit d'évacuation mécanique": 0
        }
    });
    updateMurEspaceSection();
    //toggleVisibility(`espace-${espaces.length-1}`);  // Show the latest added space table
}

function ajouterMur() {
    var table = document.getElementById('tableMurs');
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var defaultName = `Mur ${rowCount}`;
    cell1.innerHTML = `<input type="text" name="nomMur${rowCount}" value="${defaultName}" onchange="updateWallNameInMainTable(${rowCount - 1}, this.value)">`;
    cell2.innerHTML = `<input type="number" name="valeurU${rowCount}">`;
    cell3.innerHTML = `<input type="number" name="pontThermique${rowCount}">`;
    wallElements.push({
        nom: defaultName,
        id: rowCount
    });
    updateMurEspaceSection();
}

function updateMurEspaceSection() {

    var tabContainer = document.getElementById('tabcontainer');
    tabContainer.innerHTML = ''; // Clear previous tabs to refresh them
    initTabs(); // Re-initialize tabs if necessary or maintain existing tab initialization outside this function

    var container = document.getElementById('espacesContainer');
    container.innerHTML = ''; // Clear existing tables

    espaces.forEach((espace, index) => {

        // Create a tab for each space
        var tab = document.createElement('button');
        tab.textContent = espace.nom;
        tab.id = 'tab-espace-' + index;
        tab.onclick = function () {
            toggleVisibility(`espace-${index}`);
        };
        tabContainer.appendChild(tab);

        // Create the table container for each space
        var espaceDiv = document.createElement('div');
        espaceDiv.className = 'espace-section';
        espaceDiv.id = `espace-${index}`;
        espaceDiv.style.display = 'none'; // Start with the table hidden
 
		console.log("Building table for espaces ",espace.nom)

		espaceDiv.innerHTML = `
            <h3>Espace: ${espace.nom}</h3>
            <button onclick="prepareNewLine(${index})">Ajouter Mur</button>
            <table>
                <tr>
                    <th>Mur</th>
                    <th>Espace Voisin</th>
                    <th>Surface du Mur (m²)</th>
                    <th>Actions</th>
                </tr>
                ${murInstances.filter(mur => mur.spaces.includes(espace.id)).map(mur => {
					console.log("loo murinstances",mur)
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
function updateWallNameInMainTable(index, newName) {
    wallElements[index].nom = newName; // Update the name in the global murs array
    updateMurEspaceSection(); // Refresh all specific tables to reflect the new name
}

function initTabs() {
    var tabContainer = document.getElementById('tabcontainer');
    tabContainer.innerHTML = ''; // Clear existing tabs

    var fixedTabs = ['espaces', 'wallElements', 'ventilation']

    for (var i = 0; i < fixedTabs.length; i++) {
        (function (tabName) {
            var tab = document.createElement('button');
            tab.textContent = tabName;
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

    var headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Paramètre / Espace</th>';
    espaces.forEach(espace => {
        var th = document.createElement('th');
        th.textContent = espace.nom;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    var parameters = [
        "débit d'alimentation naturel", 
        "débit d'alimentation mécanique", 
        "débit de transfert", 
        "température du transfert", 
        "débit d'évacuation mécanique"
    ];

    parameters.forEach(param => {
        var row = document.createElement('tr');
        var labelCell = document.createElement('td');
        labelCell.textContent = param;
        row.appendChild(labelCell);

        espaces.forEach(espace => {
            var cell = document.createElement('td');
            var input = document.createElement('input');
            input.type = 'number';
            input.value = espace.ventilation[param] || '';
            input.onchange = () => saveVentilationData(espace.id, param, input.value);
            cell.appendChild(input);
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}

function updateVentilationTableHeaders() {
    console.log("create header")
    var table = document.getElementById('ventilationTable');
    console.log("TABLE", table)
    //if (!table) return; // If the table isn't initialized yet, exit

    console.log("HELLO")

    var headerRow = table.querySelector('tr') || document.createElement('tr');
    headerRow.innerHTML = '<th>Paramètre / Espace</th>'; // Reset header row

    espaces.forEach(espace => {
        var th = document.createElement('th');
        th.textContent = espace.nom;
        headerRow.appendChild(th);
    });

    if (!table.querySelector('tr')) {
        table.appendChild(headerRow); // Append only if it was not already existing
    }
}

function updateVentilationTableHeaders() {
    var table = document.getElementById('ventilationTable');
    var headerRow = table.querySelector('tr');

    // Update the headers for current spaces
    espaces.forEach(espace => {
        var existingHeader = document.getElementById(`header-${espace.nom}`);
        if (!existingHeader) {
            var header = document.createElement('th');
            header.textContent = espace.nom;
            header.id = `header-${espace.nom}`;
            headerRow.appendChild(header);
        } else {
            existingHeader.textContent = espace.nom; // Update existing header in case name changed
        }
    });

    // Adjust the number of columns in each row to match the number of spaces
    Array.from(table.querySelectorAll('tr')).forEach(row => {
        while (row.cells.length - 1 < espaces.length) {
            var cell = document.createElement('td');
            cell.innerHTML = `<input type="number" placeholder="Value">`;
            row.appendChild(cell);
        }
        while (row.cells.length - 1 > espaces.length) {
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
        console.log('Updated mur type to:', newTypeId);
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
		
        console.log('Updated linked space to:', newSpaceId);
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