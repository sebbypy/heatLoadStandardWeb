// remaining to do
//
// content:  dealing with hm functionality ? (for average heights greater than 4 m)
//
// UI/UX: ease copy/paste values
//   - copy one line to another (copy some row, paste to another row)
//      - copy existing to another existing
//      - paste as new item
//   - copy one value of a column to all other ("apply to all")
//   - add management of floors just for display purpose ? - or sorting function for spaces ? (renumbering alphabetically for example --> implicit floor management)
//   - copy wallinstance from onespace to another
//   - copy all wallinstances of a space to another
//   






function getCurrentLanguage() {
    var selector = document.getElementById('languageSelector');
    if (selector){
		return selector.value;
	}
	return null;
}

function translate(key) {
    const lang = getCurrentLanguage(); // Get current language
    const translationSet = translations[lang]; // Get the translations for the current language

    if (translationSet && key in translationSet) {
        return translationSet[key]; // Return the translation if the key exists
    }
    
    return key; // Return the key itself if no translation is found
}

// --------------------------------------------------
// HANDLE functions --> handling user UI interactions 
// --------------------------------------------------

function handleAddSpace() {

	model.createNewSpace(`${translations[getCurrentLanguage()]['space']} ${model.spaceIdCounter}`)
	model.computeAll()
	renderAll() // new space has 0 flow and no walls --> no computation
	
}

function handleAddBoundary() {

	model.createNewBoundary(`${translations[getCurrentLanguage()]['environment']} ${model.spaceIdCounter}`)
	renderAll()
}

function addOutsideBoundary() {
	
	model.createNewBoundary('Ext',type='unheated',bc_type='outside')
	renderAll()
}

// SPACES

function handleSpacePropertyChange(spaceId, property, value) {
	model.changeSpaceProperty(spaceId,property,value)	
	renderAll()

}

function handleSpaceNameChange(id, newName) {
	model.renameSpace(id,newName)
	renderAll()
}


// Ventilation


function handleVentilationChange(spaceId, parameter, value){
	model.changeVentilationProperty(spaceId,parameter,parseFloat(value))
	renderAll()
}


function handleAddTransfer(){
	model.createTransferFlow(1,1,0)
	renderAll()
	
	//scroll to bottom
	window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'auto' // or 'smooth' if you want an animation
	});

	
}

function handleDeleteTransfer(transferid){
	model.deleteTransferFlow(transferid)
	renderAll()
}



function handleDetailledTransferCheckboxChange(event){
	// show/hide detailled transfer table
	// freeze/unfreeze transfer and temperature inputs in ventilation table

	showHideTransfer(event.target.checked)
	
	if (event.target.checked){
		model.airTransfers.transferFlowCalculation = 'detailled'
	}
	else{
		model.airTransfers.transferFlowCalculation = 'manual'
	}		
	model.computeAll()
	renderAll()
		
}

function handleTransferChange(transferid){
	//changeTransferFlow(transferFlowId,fromSpaceId,toSpaceId,flowrate){
	fromElement = document.getElementById("transfer"+transferid+"-from")
	toElement = document.getElementById("transfer"+transferid+"-to")
	flowrateElement = document.getElementById("transfer"+transferid+"-flowrate")

	model.changeTransferFlow(transferid,Number(fromElement.value),Number(toElement.value),Number(flowrateElement.value))
	model.computeAll()
	renderAll()
}


// WALL / Wall elements

function handleAddWallElement() {
    
	model.createNewWallElement("Mur",0.24,0.02)
	renderAll() // new element not yet used, no calc
}

function handleWallNameChange(wallElementId, newName) {
	model.renameWallElement(wallElementId, newName)
	renderAll() // no calc needed
}

function handleWalUValueChange(wallElementId, newUValue) {
	model.changeWallUvalue(wallElementId,newUValue)
	renderAll()
}

function handleWallThermalBridgeChange(wallElementId, newThermalBridge) {
	model.changeWallBridgeValue(wallElementId,newThermalBridge)
	renderAll()
}

function handleIsHeatingElementChange(wallElementId, isHeatingElement) {
	//model.changeWallBridgeValue(wallElementId,newThermalBridge)
	model.changeWallIsHeatingElement(wallElementId,isHeatingElement)
	console.log("change heating",isHeatingElement)
	renderAll()
}


// Wall instances

function handleAddWallInstance(indexSpace) {

    const space = model.spaces[indexSpace];
	model.createNewWallInstance(space.id)
	renderAll() // 0 area wall, no calculation needed
	console.log("add wall instance")
	console.log("space ",indexSpace)
    toggleVisibility(`space-${indexSpace}`);
	
}


function handleWallInstanceAreaChange(wallId, newArea,callerspaceid) {
	model.changeWallInstancearea(wallId,newArea)
	renderAll()
	toggleVisibility(`space-${callerspaceid}`) //restore the view of the space where the user was
}



function handleWallInstanceTypeChange(wallId, newTypeId,callerspaceid) {
	model.changeWallInstanceType(wallId,newTypeId)
	renderAll()
	toggleVisibility(`space-${callerspaceid}`)
}

function handleNeighbourSpaceChange(wallId, newSpaceId,callerspaceid) {
	model.changeWallInstanceNeighbour(wallId,newSpaceId)
	renderAll()
	toggleVisibility(`space-${callerspaceid}`)
}

function handleDeleteWallInstance(wallId,callerspaceid) {

	model.deleteWallInstance(wallId)
	renderAll()
	toggleVisibility(`space-${callerspaceid}`)

}

function handleDeleteSpace(spaceId) {

	model.deleteSpace(spaceId)
	renderTabs();
	
	renderAll()

	
}


function handleDeleteWallElement(wallElementId) {
	
	model.deleteWallElement(wallElementId)
	renderWallElements();  // Re-render the wall elements table to reflect deletion
	renderWallInstances();
    
}

function handleSetDefaultBoundaryTemperatures(){
	model.setDefaultBoundaryTemperatures()
	renderAll()
}



// ----------------
// RENDER functions
// ----------------

function renderAll(){

    const scrollY = window.scrollY; 

	// render all visible screens
	
	renderTabs()
	renderSpacesTable()
	renderBoundariesTable()
	
	renderWallElements()
	renderWallInstances()
	
	renderAirTightness()
	renderHeatRecovery()
	renderVentilationTable()
	renderTransferFlowsTable()
	renderReheat()
	renderResults()

	window.scrollTo(0, scrollY);

	
}


function renderSpaceRow(table, space) {
    const row = table.insertRow(-1);  // Append row at the end of the table
    const heatingOptions = [
        { value: "radiators", label: "Radiateurs" },
        { value: "floorheating", label: "Sol" },
        { value: "equilibrium", label: "No heating" }
    ];


    // Create cells with input/select elements and set their contents
    row.insertCell(0).innerHTML = `<input type="text" name="nameSpace${space.id}" value="${space.name}" onchange="handleSpaceNameChange(${space.id}, this.value)">`;
    row.insertCell(1).innerHTML = `<input type="number" name="tempRef${space.id}" value="${Number(space.temperature).toFixed(0)}" onchange="handleSpacePropertyChange(${space.id}, 'temperature', this.value)">`;
    row.insertCell(2).innerHTML = `<input type="number" name="surfaceSol${space.id}" value="${space.floorarea}" onchange="handleSpacePropertyChange(${space.id}, 'floorarea', this.value)">`;
    row.insertCell(3).innerHTML = `<input type="number" name="volume${space.id}" value="${space.volume}" onchange="handleSpacePropertyChange(${space.id}, 'volume', this.value)">`;
    row.insertCell(4).innerHTML = `<select name="typeChauffage${space.id}" onchange="handleSpacePropertyChange(${space.id}, 'heating_type', this.value)">` +
        heatingOptions.map(opt => `<option lang-key="${opt.value}" value="${opt.value}">${translations[getCurrentLanguage()][opt.value]}</option>`).join('') +
        `</select>`;
    //row.insertCell(5).innerHTML = `<button onclick="handleDeleteSpace(${space.id})">Delete</button>`;

    const cell = row.insertCell(5)
    const button = document.createElement('button');
    button.innerHTML = '<i class="material-symbols">delete</i>'
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
		button.innerHTML = '<i class="material-symbols">delete</i>'
		button.onclick = () => handleDeleteSpace(space.id);
		cell.appendChild(button)


	}
}



function renderResults(){
    // Define the headers of the table
    const headers_keys = ["spaces", "transmission_heat_loss", "ventilation_heat_loss", "heatup_loss","total_heat_loss","per_m2"];
    
    // Get the 'results' div
    const resultsDiv = document.getElementById("results");
    
	const header = document.createElement("h2");
    header.setAttribute("lang-key", "results_header");
    header.setAttribute("id", "results_header");
    header.textContent = "Résultats";
    
    // Create the table element
    const table = document.createElement("table");
	table.setAttribute('id',"heatloss_table")
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
                space.reheat_power, 
                space.transmission_heat_loss + space.ventilation.ventilation_loss+space.reheat_power,
				(space.transmission_heat_loss + space.ventilation.ventilation_loss+space.reheat_power)/space.floorarea
				
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



function renderWallElementRow(table, wElement) {
    const row = table.insertRow(-1); // Append row at the end of the table

    // Create cells with input/select elements and set their contents
    row.insertCell(0).innerHTML = `<input type="text" name="nameMur${wElement.id}" value="${wElement.name}" onchange="handleWallNameChange(${wElement.id}, this.value)">`;
    row.insertCell(1).innerHTML = `<input type="number" name="valeurU${wElement.id}" value="${wElement.uValue}" onchange="handleWalUValueChange(${wElement.id}, this.value)">`;
    row.insertCell(2).innerHTML = `<input type="number" name="pontThermique${wElement.id}" value="${wElement.thermalBridge}" onchange="handleWallThermalBridgeChange(${wElement.id}, this.value)">`;

	row.insertCell(3).innerHTML = `<input type="checkbox"  ${wElement.isHeatingElement ? "checked" : ""} " onchange="handleIsHeatingElementChange(${wElement.id}, this.checked)">`;


    //row.insertCell(3).innerHTML = `<button onclick="handleDeleteWallElement(${wElement.id})">Delete</button>`;
	const cell = row.insertCell(4)
    const button = document.createElement('button');
    button.innerHTML = '<i class="material-symbols">delete</i>'
	button.onclick = () => handleDeleteWallElement(wElement.id);
	cell.appendChild(button)


}

function renderReheat(){
	
	inertia = document.getElementById("inertia-select")
	inertia.value = model.getInertia()
	
	setback = document.getElementById("setback-select")
	setback.value = model.getSetbackPeriod()
	
	table = document.getElementById("reheat_table")
	table.innerHTML=""
	
	const columns = [
    { header: "space_name", type: "text", value: "spaceName" },  // New column
    { header: "floor_area", type: "text", value: "floorArea" },
    { 
        header: "reheat_time", 
        type: "select", 
        value: "reheatTime",
		options: [{value:"-",label:"-"},
					{value:"0.5",label:0.5},
					{value:"1",label:1},
					{value:"2",label:2},
					{value:"3",label:3},
					{value:"4",label:4},
					{value:"6",label:6},
					{value:"12",label:12},
					],
		onchange: (event, row) => handleSpaceReheatTimeChange(event, row)
    },
    { header: "reheat_factor", type: "text", value: "reheatPerSquareMeter" },
    { header: "reheat_power", type: "text", value: "reheatPower" }
	]
	
	var data = []
	
	model.spaces.forEach( space =>{
		
		if (space.type == "heated"){
			//console.log(space)
			var row = {	spaceName:space.name,
						spaceid: space.id,
						reheatTime: space.heat_up_time,
						floorArea:space.floorarea,
						reheatPerSquareMeter: model.getReheatPower(space.id),
						reheatPower: space.reheat_power
				}
				data.push(row)
		}
	})		
	
	renderTable(table,columns,data)

	addCopyToAllButton(table,2,handleCopyHeatupToAll)

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

function handleCopyHeatupToAll(){

	var firstspace = model.getHeatedSpaces()[0]
	
	var value = model.getSpaceHeatUpTime(firstspace.id)
	
	model.spaces.forEach( space =>{
		model.setSpaceHeatUpTime(space.id,value)
	})
	model.computeAll()
	renderAll()
}
		


function renderTabs(){

    const activeTabs = document.querySelectorAll('.tab.active-tab');
    const activeTabIds = Array.from(activeTabs).map(tab => tab.id);
	
	console.log("activetabs",activeTabIds)

    renderMainTabs(); 

	var spaceTabs = document.getElementById('spacetabs')
    spaceTabs.innerHTML = ''; // Clear previous tabs to refresh them

	//document.getElementById(activeTabId).classList.add('active-tab') // restore default active tab or previouslys active tabe
	activeTabIds.forEach(id => {
        const tab = document.getElementById(id);
        if (tab) {
			console.log("adding active",tab)
            tab.classList.add('active-tab');
        }
    });
	
	setTabsColorBehavior()
	
	
}	

function setTabsColorBehavior(){
  //color selected menu
  
  const buttons = document.querySelectorAll('.tab');

	buttons.forEach(button => {
		button.addEventListener('click', function() {
		buttons.forEach(btn => btn.classList.remove('active-tab'));
		this.classList.add('active-tab');
		});
	})
}

function setSpaceTabsColorBehavior(){
	//color selected space button when displaying space wall instances
	
	const spacetabs = document.querySelectorAll('[id^="tab-space-"]')
	
	spacetabs.forEach(tab => {
		tab.addEventListener('click', function() {
			spacetabs.forEach( othertab => othertab.classList.remove('active-tab'));
			this.classList.add('active-tab');
		});
	});
}


function renderWallInstances() {

    var container = document.getElementById('spacesContainer');

	/*getting active space tab and restore it*/
	const activeSpaceTab = container.querySelector('.tab.active-tab');
	var activeSpaceId = null
	if (activeSpaceTab){
		 activeSpaceId = activeSpaceTab.id
	}
	


    container.innerHTML = ''; // Clear existing tables

	const heading = document.createElement("h2");
	
	heading.setAttribute('lang-key', 'wall_elements_header');
	heading.textContent = translate('wall_elements_header');
	container.appendChild(heading);

    model.spaces.forEach((space, index) => {

		if (space.type == "heated"){

			var tab = document.createElement('button');
			tab.textContent = space.name;
			tab.setAttribute('class','tab');
			tab.id = 'tab-space-' + index;
			tab.onclick = function () {
				toggleVisibility(`space-${index}`);
			};
			container.appendChild(tab)
			if (tab.id == activeSpaceId){
				tab.classList.add('active-tab');
			}
		}
	})

	//after createing all button for spaces, set color behaviour
	setSpaceTabsColorBehavior()

    model.spaces.forEach((space, index) => {

		if (space.type == "heated"){

			//var spaceTotalLoss = 0;
			var spaceTotalSurface = 0;

			var spaceDiv = document.createElement('div');
			spaceDiv.className = 'space-section';
			spaceDiv.id = `space-${index}`;
			spaceDiv.style.display = 'none'; // Start with the table hidden
			//console.log(spaceDiv)


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
						//spaceTotalLoss += multiplier * wall.transmissionLoss;
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


						console.log("before display",wall.transmissionLoss)
						if (typeof(wall.transmissionLoss) == "number"){
							lossCell.innerHTML = (wall.transmissionLoss * multiplier).toFixed(0);
						}
						else{
							lossCell.innerHTML = wall.transmissionLoss
						}

						//lossInput.disabled = true;
						//lossCell.appendChild(lossInput);
						row.appendChild(lossCell);

						// Delete Button
						const actionsCell = document.createElement('td');
						const deleteButton = document.createElement('button');
						deleteButton.innerHTML = '<i class="material-symbols">delete</i>'


						deleteButton.onclick = () => handleDeleteWallInstance(wall.id, index);
						actionsCell.appendChild(deleteButton);
						row.appendChild(actionsCell);

						table.appendChild(row);
						
					});

			
			
			 // Add total row
			const totalRow = document.createElement('tr');
			totalRow.classList.add('total-row');

			['Total', '', spaceTotalSurface.toFixed(1), space.transmission_heat_loss.toFixed(0), ''].forEach((text, i) => {
				const cell = document.createElement(i === 2 || i === 3 ? 'td' : 'td');
				cell.textContent = text;
				totalRow.appendChild(cell);
			});

			table.appendChild(totalRow);
			
			container.appendChild(spaceDiv);
			//space.transmission_heat_loss = spaceTotalLoss
		
		}
		
	});

	
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
        "mechanical_extract_flowrate",
    ];
	var ventilation_tooltips = {
		"natural_supply_flowrate": "natural_supply_tooltip",
		"mechanical_supply_flowrate": null,
		"transfer_flowrate": "transfer_flow_tooltip",
		"transfer_temperature": null,
		"mechanical_extract_flowrate": null,
	}


    // Create the header row for spaces
    var headerRow = document.createElement('tr');
	var headerElement = document.createElement('th');
	headerElement.setAttribute('lang-key','space')
	headerElement.innerText = translate('space')
	headerRow.appendChild(headerElement)
    //headerRow.innerHTML = '<th>Parameter / Space</th>';
    parameters.forEach(param => {
		//function createElement(tag, attributes = {}, innerText = '', children = [], tooltipKey = '') {
		headerRow.appendChild(createElement('th',{'lang-key':param},innerText = translations[getCurrentLanguage()][param] ,children=[],tooltipKey=ventilation_tooltips[param]))

        /*var th = document.createElement('th');
        th.setAttribute('lang-key', param);
        th.textContent = translations[getCurrentLanguage()][param];
        headerRow.appendChild(th);*/
    });
	
	if (model.airTransfers.transferFlowCalculation == "detailled"){
		var th = document.createElement('th');
		th.setAttribute('lang-key', 'flow_balance');
		th.textContent = translate("flow_balance");
		headerRow.appendChild(th);
	}
		
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
		balance:null,
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
				input.id = 'space'+space.id+'-'+param
				input.type = 'number';
				input.value = space.ventilation[param].toFixed(0) || '';
				input.onchange = () => handleVentilationChange(space.id, param, input.value);
				cell.appendChild(input);
				row.appendChild(cell);
				
				// Update total for this parameter if the value is a valid number
                var value = parseFloat(input.value);
                if (!isNaN(value) && totals[param] != null) {
                    totals[param] += value;
                }
			});


			if (model.airTransfers.transferFlowCalculation == "detailled"){
				var cell = document.createElement('td')
				cell.innerHTML = space.ventilation.balance.toFixed(0)
				cell.name = "balance"+space.id
				row.appendChild(cell);
			}

			var cell = document.createElement('td');
			cell.innerHTML = space.ventilation.ventilation_loss.toFixed(0)
			cell.name = "ventilationLoss"+space.id
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
		
		if ( (key == 'balance') && (model.airTransfers.transferFlowCalculation != "detailled")){
			return
		}
		
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

function renderTransferFlowsTable() {


	var ventilationdiv = document.getElementById('ventilation')
	
	var transferdiv = document.getElementById("transferdiv")
	
	if (!transferdiv){
	
		ventilationdiv.appendChild(createElement('div',{},'',[
			createElement('span', {'lang-key':'detailled_transfer_input'}, 'detailled_transfer'),
			createElement('input', { 'id':'detailled_transfer_checkbox','type': 'checkbox', onchange: handleDetailledTransferCheckboxChange }, 'detailled_transfer')
			]))
	
		ventilationdiv.appendChild(createElement('div',{'id':'transferdiv'},'',[
			createElement('h3', { 'lang-key': 'transfer_flows' }, 'transfer_flows'),
			createElement('br',{},''),
			createElement('button', { onclick: ()=> handleAddTransfer() ,class:'add-button'}, '+'),
			createElement('table',{'id':'transferFlowsTable'},'',[
				createElement('tr', {}, '', [
					createElement('th', { 'lang-key': 'from_space' }, 'from'),
					createElement('th', { 'lang-key': 'to_space' }, 'to'),
					createElement('th', { 'lang-key': 'flowrate' }, 'flowrate'),
					createElement('th', {},'')]
				)]
			)]
		))
	}
	
	var table = document.getElementById('transferFlowsTable');
	while (table.rows.length > 1) {
        table.deleteRow(1);
    }
	
	
	model.airTransfers.transferFlows.forEach(transfer => {
		table.appendChild(	
			createElement('tr', {}, '', [
				createElement('td', {}, '', [ createElement('select', {'id':'transfer'+transfer.id+"-from"}, '', model.spaces.filter(space => space.type === 'heated').map(space => createElement('option', {'value':space.id}, space.name))) ]),
				createElement('td', {}, '', [ createElement('select', {'id':'transfer'+transfer.id+"-to"}, '', model.spaces.filter(space => space.type === 'heated').map(space => createElement('option', {'value':space.id}, space.name))) ]),
				createElement('td', {}, '', [createElement('input', {'id':'transfer'+transfer.id+"-flowrate", type: 'number', min: '0' })]),
				createElement('td', {}, '', [createElement('button',{onclick: () => {handleDeleteTransfer(transfer.id)}},'',[createElement('i',{class:'material-symbols'},'delete')])])
				
			])
		)
		
		//getting UI elemments
		fromElement = document.getElementById("transfer"+transfer.id+"-from")
		toElement = document.getElementById("transfer"+transfer.id+"-to")
		flowrateElement = document.getElementById("transfer"+transfer.id+"-flowrate")

		// setting actual values
		fromElement.value = transfer.from;
		toElement.value = transfer.to;
		flowrateElement.value = transfer.flowrate;

		// setting change listeners
		fromElement.addEventListener("change",(event) => {handleTransferChange(transfer.id)});
		toElement.addEventListener("change",(event) => {handleTransferChange(transfer.id)});
		flowrateElement.addEventListener("change",(event) => {handleTransferChange(transfer.id)});
	
	})


	if (model.airTransfers.transferFlowCalculation == 'detailled'){
		document.getElementById('detailled_transfer_checkbox').checked=true
		showHideTransfer(true)
	}
	else{
		document.getElementById('detailled_transfer_checkbox').checked=false
		showHideTransfer(false)
	}
	
	
}


function showHideTransfer(show){
	
	
	model.spaces.forEach( space => {
		
		if (space.type == 'heated'){
		
			transfer_flowrate = document.getElementById('space'+space.id+'-transfer_flowrate')
			transfer_temperature = document.getElementById('space'+space.id+'-transfer_temperature')
		
			if (show == true){
				transfer_flowrate.disabled = true
				transfer_temperature.disabled = true
			}
			else{
				transfer_flowrate.disabled = false
				transfer_temperature.disabled = false	
			}
		}
	})
	
	if (show == false){
		document.getElementById('transferdiv').style.display = 'none'
	}
	else{
		document.getElementById('transferdiv').style.display = 'block'
	}


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
	
	
	addTotalRow(table,[null,model.getTotalFloorArea(),model.getTotalVolume(),null,null],1)
   

}

function renderBoundariesTable() {
	
	const zipcode_select = document.getElementById("municipality_select")
	zipcode_select.value = model.zipCode
	
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
	refSurface = document.getElementById("at_ref_surface_div")

    // Check the selected value and update the unit display accordingly
    switch(model.otherData.airtightness.choice) {
        case 'v50':
            unitDisplay.textContent = "(m³/h)/m²";  // Set the unit for v50
			refSurface.style.display = 'block'
            break;
        case 'n50':
            unitDisplay.textContent = "vol/h";  // Set the unit for n50
			refSurface.style.display = 'none'
            break;
        case 'Q50':
            unitDisplay.textContent = "m³/h";  // Set the unit for Q50
			refSurface.style.display = 'none'

            break;
        default:
            unitDisplay.textContent = "";  // No unit by default or if something goes wrong
			refSurface.style.display = 'none'

    }
	
	document.getElementById('at_value').value = model.otherData.airtightness.value
}



function toggleVisibility(input) {
	
	console.log("toggle ",input)
	
    var mainsections = document.querySelectorAll('.main-section');
    var spacessections = document.querySelectorAll('.space-section');

    // Hide all main sections
    mainsections.forEach(section => {
        section.style.display = 'none';
    });

    // Hide all space sections
    spacessections.forEach(section => {
        section.style.display = 'none';
    });

    if (document.getElementById(input)) {
        document.getElementById(input).style.display = 'block';
    }

    // Special case: If "spaces_walls" is selected, show it and the first space section
    if (input === "spacesContainer") {
        let firstSpaceSection = document.querySelector('.space-section');
		if (firstSpaceSection) {
            firstSpaceSection.style.display = 'block';
        }
		
		// set colors of buttons
		let firstSpaceButton = document.querySelector('[id^="tab-space-"]')
		if (firstSpaceButton){
			document.querySelectorAll('[id^="tab-space-"]').forEach(button => {
				button.classList.remove('active-tab')
				})
			firstSpaceButton.classList.add('active-tab');
		}
    }

    // If input is a space section, show "spaces_walls" + the specific space section
    if (input.startsWith('space-')) {
        document.getElementById("spacesContainer").style.display = 'block';
        document.getElementById(input).style.display = 'block';
    }
}


function renderMainTabs() {
    var tabContainer = document.getElementById('maintabs');
    tabContainer.innerHTML = ''; // Clear existing tabs


    var fixedTabs = ['spaces','boundaryconditions', 'ventilation','wall_elements', 'spacesContainer','reheatdiv','results']

	var icons = [`<span class="material-symbols">space_dashboard</span>`,
			`<span class="material-symbols">thermostat</span>`,
			`<span class="material-symbols">air</span>`,
			getIcon('insulation'),
			getIcon('areas'),
			getIcon('reheat'),
			`<span class="material-symbols">calculate</span>`
			]
			
	
    for (var i = 0; i < fixedTabs.length; i++) {
        (function (tabName) {
            var tab = document.createElement('button');

			var textSpan = document.createElement('span')
			textSpan.setAttribute('lang-key',tabName)
            textSpan.textContent = translate(tabName);
			textSpan.setAttribute('class','main-menu-text')

			tab.setAttribute('class','tab')

            tab.id = 'tab-' + tabName;
            tab.onclick = function () {
                toggleVisibility(tabName);
            };
			
			
            tabContainer.appendChild(tab);
			
			tab.appendChild(textSpan)
			tab.insertAdjacentHTML('afterbegin', icons[i]);

        })(fixedTabs[i]); // Pass the current tab name to the IIFE
    }

}

function switchLanguage(lang) {
    document.querySelectorAll("[lang-key]").forEach(function(element) {
		updateElementLanguage(element,lang)
	})
}


function updateElementLanguage(element, lang) {
    var key = element.getAttribute("lang-key");
    if (!key) return; // Skip if no language key is found

    var translation = translations[lang][key] || key;

    // Save existing child elements before modifying innerHTML
    let children = Array.from(element.children);

    // Update the main element’s innerHTML with the translated text (including HTML formatting)
    element.innerHTML = translation;

    // Reattach saved child elements (like tooltips)
    children.forEach(child => element.appendChild(child));
}


function openFilenameModal() {
    // Check if modal already exists
    if (document.getElementById("filenameModal")) {
        document.getElementById("filenameModal").style.display = "block";
        return;
    }

    // Create modal container
    const modal = document.createElement("div");
    modal.id = "filenameModal";
    modal.style.cssText = `
        display: block;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
    `;

    // Create modal content
    const modalContent = document.createElement("div");
    modalContent.style.cssText = `
        background-color: white;
        margin: 15% auto;
        padding: 20px;
        width: 300px;
        border-radius: 5px;
        text-align: center;
        position: relative;
    `;

    // Close button
    const closeButton = document.createElement("span");
    closeButton.innerHTML = "&times;";
    closeButton.style.cssText = `
        position: absolute;
        right: 10px;
        top: 5px;
        font-size: 24px;
        cursor: pointer;
    `;
    closeButton.onclick = closeModal;

    // Title
    const title = document.createElement("h2");
    title.textContent = "Enter file name:";

    // Input field
    const input = document.createElement("input");
    input.type = "text";
    input.id = "filenameInput";
    input.value = "heatload_standard.json";
    input.style.cssText = "width: 90%; padding: 5px; margin: 10px 0;";

    // OK button
    const okButton = document.createElement("button");
    okButton.textContent = "OK";
    okButton.style.cssText = "margin-right: 10px; padding: 5px 10px;";
    okButton.onclick = confirmFilename;

    // Cancel button
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.cssText = "padding: 5px 10px;";
    cancelButton.onclick = closeModal;

    // Append elements
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(input);
    modalContent.appendChild(okButton);
    modalContent.appendChild(cancelButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function closeModal() {
    const modal = document.getElementById("filenameModal");
    if (modal) modal.style.display = "none";
}

function confirmFilename() {
    let filename = document.getElementById("filenameInput").value.trim();
    if (!filename) {
        alert("Please enter a valid filename!");
        return;
    }

    // Ensure the filename ends with .json
    if (!filename.endsWith(".json")) {
        filename += ".json";
    }

    closeModal();
    exportData(filename);
}


	
 /*   const jsonData = JSON.stringify(model, null, 4); // Beautify the JSON
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
	
	*/

/*	let defaultFilename = "heatload_standard.json";
    
    // Ask the user to input a filename
    let filename = prompt("Enter file name:", defaultFilename);
    if (!filename) return; // If the user cancels, do nothing

    // Ensure the filename ends with .json
    if (!filename.endsWith(".json")) {
        filename += ".json";
    }

    // Convert data to JSON
    const jsonData = JSON.stringify(model, null, 4);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
	
}
*/


function exportData(filename) {
    const jsonData = JSON.stringify(model, null, 4);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadModelFromJson(jsonData) {
    try {
        const parsed = JSON.parse(jsonData);
        model = new DataModel();
        if (parsed.spaces && parsed.wallElements && parsed.wallInstances) {
            model.spaces = parsed.spaces;
            model.wallElements = parsed.wallElements;
            model.wallInstances = parsed.wallInstances;

            model.otherData = deepMergeDefaults(model.otherData, parsed.otherData);
            model.zipCode = parsed.zipCode;
            model.airTransfers = parsed.airTransfers;

            model.spaceIdCounter = Math.max(...model.spaces.map(space => space.id)) + 1;
            model.wallElementsIdCounter = Math.max(...model.wallElements.map(element => element.id)) + 1;
            model.wallInstanceID = Math.max(0, ...model.wallInstances.map(instance => instance.id)) + 1;

            model.computeAll();
            renderAll();
            console.log("compute and render");
        } else {
            throw new Error("Invalid data structure");
        }
    } catch (error) {
        alert("Error loading or parsing data: " + error.message);
    }
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
			loadModelFromJson(event.target.result)
            
        } catch (error) {
            alert("Error loading or parsing the file: " + error.message);
        }
    };
    reader.onerror = function() {
        alert("Failed to read the file.");
    };

    reader.readAsText(file);
}


function saveModelToLocalStorage() {
    const jsonData = JSON.stringify(model, null, 4);
	localStorage.setItem('myAppModel', jsonData);
}


function loadModelFromLocalStorage() {
	
    const jsonData = localStorage.getItem('myAppModel');
    if (jsonData) {
        loadModelFromJson(jsonData);
    } else {
        console.log("No saved model found in local storage.");
    }
}






function deepMergeDefaults(defaultObj, savedData) {
  const result = structuredClone(defaultObj);
  for (const key in savedData) {
	  //console.log(key)
    if (
      savedData[key] &&
      typeof savedData[key] === "object" &&
      !Array.isArray(savedData[key])
    ) {
      result[key] = deepMergeDefaults(defaultObj[key] || {}, savedData[key]);
    } else {
      result[key] = savedData[key];
    }
  }
  return result;
}




function handleMunicipalityChange(){
	const select_zip = document.getElementById("municipality_select")
	model.setZip(select_zip.value)
	renderBoundariesTable()
	
}

function handleHeatRecoveryCheckBox() {

    var checkbox = document.getElementById('heatRecoveryCheckbox');
	model.changeHeatRecoveryEnabled(checkbox.checked)
	renderAll()
}

function handleHeatRecoveryEfficiencyChange() {

    var efficiencyInput = document.getElementById('heatRecoveryEfficiency');
	model.changeHeatRecoveryEfficiency(efficiencyInput.value);
	renderAll()
	
}

// Function to update the air tightness unit based on selected parameter
function handleAirTightnessChange() {

	var choice = document.getElementById('airTightnessSelect').value
	var value  = document.getElementById('at_value').value;
	var surface = document.getElementById('at_ref_surface').value;

	model.changeAirThightnessInputs(choice,value,surface)
	renderAll()
}

function handleInertiaChange(e,rowData){
	model.setInertia(e.target.value)
	renderReheat()
	renderResults()
}

function handleSetBackTimechange(e,rowData){
	model.setSetbackPeriod(e.target.value)
	renderReheat()
	renderResults()
}

function handleSpaceReheatTimeChange(e,rowData){
	model.setSpaceHeatUpTime(rowData.spaceid,e.target.value)
	renderReheat()
	renderResults()
}




// INIT FUNCTIONS 


/*function createElement(tag, attributes = {}, innerText = '', children = []) {
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
}*/
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



function initializePage(container_id) {
    // Header
    //const header = createElement('h1', { 'lang-key': 'heat_loss_calculation' }, 'Calcul des déperditions thermiques');

    // Data Buttons Section
    const dataButtons = createElement('div', { class: 'data-buttons' }, '', [
        //createElement('button', { 'lang-key':'export', id: 'exportDataBtn' }, 'Export Data',[
		createElement('button', { id: 'exportDataBtn' }, '',[
		createElement('i',{'class':'material-symbols'},'save')]),
        //createElement('button', { 'lang-key':'import', id: 'importDataBtn' }, 'Import Data'),
        createElement('button', {id: 'importDataBtn' }, '',[
		createElement('i',{'class':'material-symbols'},'folder_open')]),
		createElement('input', { id: 'fileInput', type: 'file', style: 'display: none;', onchange: () => importData(this), accept: '.json' }),
		createElement('button', { id: 'printBtn' }, '',[createElement('i',{'class':'material-symbols'},'picture_as_pdf')]),
		createElement('button', { id: 'exportDocx' }, '',[createElement('i',{'class':'material-symbols'},'')]),
		createElement('button', { id: 'resetData' }, '',[createElement('i',{'class':'material-symbols'},'cancel')],tooltipKey=translate("reset"))
	
    ]);
	//createElement('button', { id: 'exportDocx' }, '',[getIcon("docx")])

	

    // Tabs Container
    const tabsContainer = createElement('div', { id: 'tabcontainer' , class:'sidebar' }, '', [
        createElement('div', { id: 'maintabs' }),
        createElement('div', { id: 'spacetabs' }),
        createElement('div', { id: 'resultstabs' })
    ]);

	const contentContainer = createElement('div', {class: 'content'},'',
		[createElement('h1', { 'lang-key': 'heat_loss_calculation' }, 'Calcul des déperditions thermiques')])
	
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

  // Ventilation Section
    const ventilation = createElement('div', { id: 'ventilation', class: 'main-section' }, '', [
        createElement('h2', { 'lang-key': 'ventilation' }, 'Ventilation'),
        createElement('h3', { 'lang-key': 'air_tightness' }, 'Etanchéité à l’air'),
		createElement('select', { id: 'airTightnessSelect', onchange: handleAirTightnessChange }, '', [
			createElement('option', { value: 'n50',selected: true }, 'n50'),
			createElement('option', { value: 'v50' }, 'v50'),
		//createElement('option', { value: 'Q50' }, 'Q50')
		]),
		createElement('p',  {} , '', [
			createElement('input', { type: 'number', id: 'at_value', min: '1', max: '100', onchange: handleAirTightnessChange }),
			createElement('span', { id: 'at_unit' }, 'at_unit')
			]),
		createElement('p', { id: 'at_ref_surface_div', style: 'display:none' }, '',[
			createElement('span', {'lang-key':'at_ref_surface'}, ''),
			createElement('input',{type:'number',id:'at_ref_surface',min: '0',onchange: handleAirTightnessChange}),
			createElement('span', {}, 'm²'),
		]),
		

        createElement('div', {}, '', [
            createElement('h3', { 'lang-key': 'heat_recovery' }, 'Récupération de chaleur'),
            createElement('p', {}, '', [ 
				createElement('span', { 'lang-key': 'enable_hr' }, 'Enable Heat Recovery'),
				createElement('input', { type: 'checkbox', id: 'heatRecoveryCheckbox', onchange: handleHeatRecoveryCheckBox }),
				createElement('input', { type: 'number', id: 'heatRecoveryEfficiency', min: '0', max: '100', style: 'display: none;', placeholder: 'Rendement', onchange: handleHeatRecoveryEfficiencyChange }),
				createElement('span', { id: 'hr_unit', style: 'display: none;' }, '%'),
            ]),
            createElement('p', {}, '', [ 
				createElement('span', { 'lang-key': 'mean_extract_t', id: 'meanExtractTemperature_label', style: 'display: none;' }),
				createElement('span', { id: 'meanExtractTemperature_value', style: 'display: none;', disabled: true }),
				createElement('span', { id: 'meanExtractTemperature_warning','lang-key': 'extracttemperature_warning', style: 'display: none;'}),
			]),
            createElement('p', {}, '', [ 
				createElement('span', { 'lang-key': 'supply_t', id: 'supplyTemperature_label', style: 'display: none;' }),
				createElement('span', { id: 'supplyTemperature_value', style: 'display: none;', disabled: true }),
			])
		]),
	   createElement('h3', { 'lang-key': 'flowrates' }, 'Débits'),
     
			//createElement("button",{ 'lang-key':'open_ventilation_assistant',onclick: openVentilationAssistant})
			
        
    ]);


    // Walls Section
    const walls = createElement('div', { id: 'wall_elements', class: 'main-section' }, '', [
        createElement('h2', { 'lang-key': 'walls' }, 'Murs'),
        createElement('button', { onclick: handleAddWallElement, class:'add-button' }, '+'),
        createElement('table', { id: 'tableMurs' }, '', [
            createElement('tr', {}, '', [
                createElement('th', { 'lang-key': 'wall_name' }, 'Nom du wall'),
                createElement('th', { 'lang-key': 'u_value' }, 'Valeur U'),
                createElement('th', { 'lang-key': 'thermal_bridge_coefficient' }, 'Coefficient de pont thermique',[],tooltipText='thermal_bridge_tooltip'),
                createElement('th', { 'lang-key': 'is_floor_heating' }, 'Plancher ou mur chauffant ',[],tooltipText='floor_heating_tooltip'),
                createElement('th', {}, '')
            ])
        ])
    ]);

  
    // Main Containers
    const spacesContainer = createElement('div', { id: 'spacesContainer', class: 'main-section' });

    const reheatContainer = createElement('div', { id: 'reheatdiv', class: 'main-section' }, '',[
		createElement('h2',{'lang-key':'reheatdiv'},''),
		createElement('h3',{'lang-key':'inertia'},'inertia'),
		createElement('select', { id: 'inertia-select', onchange: handleInertiaChange }, '', [
            createElement('option', { 'lang-key':'light',value: 'light'},'light'),
            createElement('option', { 'lang-key':'heavy',value: 'heavy' }, 'heavy')
			]),
		createElement('h3',{'lang-key':'setback_time'},'setback_time'),
		createElement('select', { id: 'setback-select', onchange: handleSetBackTimechange }, '-', [
            createElement('option', { value: '-'},'-'),
            createElement('option', { value: '8' }, '8h'),
            createElement('option', { value: '14' }, '14h'),
            createElement('option', { value: '62' }, '62h')
			]),
		createElement('h3',{'lang-key':'reheat_table_title'},'reheat_table_title'),
		createElement('table',{'id':'reheat_table'},''),

		]);



    const resultsContainer = createElement('div', { id: 'results', class: 'main-section' });

	contentContainer.append(        
		spaces,
        boundaryConditions,
        ventilation,
		walls,
        spacesContainer,
        reheatContainer,
        resultsContainer
)


    // Append all sections to the body
    document.getElementById(container_id).append(
        //header,
        dataButtons,
        tabsContainer,
		contentContainer
    );
	document.getElementById('exportDataBtn').addEventListener('click', openFilenameModal);
	document.getElementById('importDataBtn').addEventListener('click', function() {
    document.getElementById('fileInput').click(); // Trigger the hidden file input click
	});	
	document.getElementById('printBtn').addEventListener('click',exportPageToPDF)

	document.getElementById('exportDocx').addEventListener('click',exportToWord)
	document.getElementById('exportDocx').insertAdjacentHTML("beforeend",getDocx())  // adding Icon
	
	
	document.getElementById('resetData').addEventListener('click',resetPage)

}




window.addEventListener('beforeunload', (event) => {
    saveModelToLocalStorage();
    // Optionally: show confirmation dialog to the user
    // event.preventDefault();
    // event.returnValue = '';
});


window.addEventListener('load', () => {
    const jsonData = localStorage.getItem('myAppModel');
    if (jsonData) {
        //if (confirm("We found a saved session. Do you want to restore it?")) {
            loadModelFromJson(jsonData);
        //}
    }
});




function loadPage(){
	
	model = new DataModel();
	
	document.getElementById("main_container").innerHTML = ""
	initializePage("main_container")
	addOutsideBoundary()

	model.createNewWallElement("Mur ext",0.24,0.02)
	model.createNewWallElement("Toit",0.24,0.02)
	model.createNewWallElement("Menuiseries DV",1.5,0.0)

	//model.createNewSpace("space")

	//var vModel = new VentilationModel(model);
	//vModel.setSpaces(model.spaces);
	

	renderAll()
	toggleVisibility('spaces')
	
	switchLanguage(getCurrentLanguage())

}

function resetPage(){
	
	if (confirm(translate("confirm_reset"))) {
		loadPage()
	}
	

}


        