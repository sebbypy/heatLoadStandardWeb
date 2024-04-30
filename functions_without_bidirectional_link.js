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
        murs: [],
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
    murs.push({
        nom: defaultName,
        id: rowCount
    });
    updateMurEspaceSection();
}

function updateMurEspaceSection() {
    var tabContainer = document.getElementById('tabcontainer');
    initTabs()

    var container = document.getElementById('espacesContainer');
    container.innerHTML = ''; // Clear existing tables

    espaces.forEach((espace, index) => {
        // Create a tab for each space
        var tab = document.createElement('button');
        tab.textContent = espace.nom;
        tab.id = 'tab-espace-' + index
            tab.onclick = function () {
            toggleVisibility(`espace-${index}`);
        };
        tabContainer.appendChild(tab);

        // Create the table container for each space
        var espaceDiv = document.createElement('div');
        espaceDiv.className = 'espace-section';
        espaceDiv.id = `espace-${index}`;
        espaceDiv.style.display = 'none';
        espaceDiv.innerHTML = `
                    <h3>Espace: ${espace.nom}</h3>
                    <button onclick="prepareNewLine(${index})">Ajouter Mur</button>
                    <table>
                        <tr>
                            <th>Mur</th>
                            <th>Espace Voisin</th>
                            <th>Surface du Mur (m²)</th>
                        </tr>
                        ${espace.murs.map((mur, idx) => `
                            <tr>
                                <td>
                                    <select onchange="updateMurName(${index}, ${idx}, this.value)">
                                        ${murs.map(murOption => `<option value="${murOption.nom}" ${murOption.nom === mur.nom ? 'selected' : ''}>${murOption.nom}</option>`).join('')}
                                    </select>
                                </td>
                                <td>
                                    <select onchange="updateVoisinName(${index}, ${idx}, this.value)">
                                        ${espaces.map(espaceOption => `<option value="${espaceOption.nom}" ${espaceOption.nom === mur.espaceVoisin ? 'selected' : ''}>${espaceOption.nom}</option>`).join('')}
                                    </select>
                                </td>
                                <td><input type="number" value="${mur.surface}" onchange="updateSurface(${index}, ${idx}, this.value)"></td>
                            </tr>
                        `).join('')}
                    </table>
                `;
        container.appendChild(espaceDiv);
    });

    createVentilationTableStructure(); // Rebuild table structure when spaces update
}

function toggleVisibility(input) {
    console.log("input", input)
    var sections = document.querySelectorAll('.espace-section, .main-section');

    console.log("hello-world")
    sections.forEach(section => {
        console.log("section", section.id)
        if (section.id == input) {
            console.log("show")
            section.style.display = 'block'; // Show this section
        } else {
            console.log("hide")

            section.style.display = 'none'; // Hide other sections
        }
    });

}
function prepareNewLine(indexEspace) {
    espaces[indexEspace].murs.push({
        nom: "",
        espaceVoisin: "",
        surface: 0
    });
	
    updateMurEspaceSection();
    toggleVisibility('espace-' + indexEspace)
}

function updateEspaceName(index, newName) {
    espaces[index].nom = newName;
    updateMurEspaceSection();
}

function updateMurName(indexEspace, indexMur, newName) {
    espaces[indexEspace].murs[indexMur].nom = newName;
}

function updateVoisinName(indexEspace, indexMur, newName) {
    espaces[indexEspace].murs[indexMur].espaceVoisin = newName;
}

function updateSurface(indexEspace, indexMur, newSurface) {
    espaces[indexEspace].murs[indexMur].surface = newSurface;
}
function updateWallNameInMainTable(index, newName) {
    murs[index].nom = newName; // Update the name in the global murs array
    updateMurEspaceSection(); // Refresh all specific tables to reflect the new name
}

function initTabs() {
    var tabContainer = document.getElementById('tabcontainer');
    tabContainer.innerHTML = ''; // Clear existing tabs

    var fixedTabs = ['espaces', 'murs', 'ventilation']

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
