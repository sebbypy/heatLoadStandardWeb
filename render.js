// ----------------
// RENDER functions
// ----------------

function initializePage(container_id) {
    // Header
    //const header = createElement('h1', { 'lang-key': 'heat_loss_calculation' }, 'Calcul des déperditions thermiques');

    // Data Buttons Section
    const dataButtons = createElement('div', { class: 'data-buttons' }, '', [
		createElement('button', { id: 'exportDataBtn' }, '',[createElement('i',{'class':'material-symbols'},'save')],tooltipKey=translate("export")),

        createElement('button', {id: 'importDataBtn' }, '',[createElement('i',{'class':'material-symbols'},'folder_open')], tooltipKey=translate("load")),
		createElement('input', { id: 'fileInput', type: 'file', style: 'display: none;', onchange: () => importData(this), accept: '.json' }),

		createElement('button', { id: 'exportPdfBtn' }, '',[createElement('i',{'class':'material-symbols'},'picture_as_pdf')]),
		createElement('button', { id: 'exportDocxBtn' }, '',[createElement('i',{'class':'material-symbols'},'')]),
		createElement('button', { id: 'resetData' }, '',[createElement('i',{'class':'material-symbols'},'cancel')],tooltipKey=translate("reset"))
	
    ]);
	//createElement('button', { id: 'exportDocxBtn' }, '',[getIcon("docx")])

	

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

	const radiatorsContainer = createElement('div', { id: 'radiators', class: 'main-section' }, '',)
	const floorHeatingContainer = createElement('div', { id: 'floorheating', class: 'main-section' }, '',)
	
	
	contentContainer.append(        
		spaces,
        boundaryConditions,
        ventilation,
		walls,
        spacesContainer,
        reheatContainer,
        resultsContainer,
		radiatorsContainer,
		floorHeatingContainer
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
	document.getElementById('exportPdfBtn').addEventListener('click',exportPageToPDF)

	document.getElementById('exportDocxBtn').addEventListener('click',exportToWord)
	document.getElementById('exportDocxBtn').insertAdjacentHTML("beforeend",getDocx())  // adding Icon
	
	
	document.getElementById('resetData').addEventListener('click',resetPage)



}

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
	renderRadiators()
	renderFloorHeating()


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

function renderTabs(){

    const activeTabs = document.querySelectorAll('.tab.active-tab');
    const activeTabIds = Array.from(activeTabs).map(tab => tab.id);
	

    renderMainTabs(); 

	var spaceTabs = document.getElementById('spacetabs')
    spaceTabs.innerHTML = ''; // Clear previous tabs to refresh them

	//document.getElementById(activeTabId).classList.add('active-tab') // restore default active tab or previouslys active tabe
	activeTabIds.forEach(id => {
        const tab = document.getElementById(id);
        if (tab) {
	        tab.classList.add('active-tab');
        }
    });
	
	setTabsColorBehavior()
	
	
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


function renderMainTabs() {
    var tabContainer = document.getElementById('maintabs');
    tabContainer.innerHTML = ''; // Clear existing tabs


    var fixedTabs = ['spaces','boundaryconditions', 'ventilation','wall_elements', 'spacesContainer','reheatdiv','results','radiators','floorheating']
	//var fixedTabs = ['spaces','boundaryconditions', 'ventilation','wall_elements', 'spacesContainer','reheatdiv','results']

	var icons = [`<span class="material-symbols">space_dashboard</span>`,
			`<span class="material-symbols">thermostat</span>`,
			`<span class="material-symbols">air</span>`,
			getIcon('insulation'),
			getIcon('areas'),
			getIcon('reheat'),
			`<span class="material-symbols">calculate</span>`,
			getIcon('radiator'),
			`<span class="material-symbols">nest_true_radiant</span>`,
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

function renderRadiators(){

	var rdiv = document.getElementById("radiators")
	rdiv.innerHTML = ""

	
	var startAndReturn = createElement('div',{},'',[	
		createElement('h2',{'lang-key':'temperature_regime'},'temperature_regime'),
		createElement('h3',{'lang-key':'start_temperature'},'start_temperature'),
		createElement('input', { 
			type:'number', 
			min:30,
			max:90,
			step:1,
			id: 'start_temperature', 
			value: radModel.startTemperature,
			onchange: handleStartTemperatureChange
			},''),
		createElement('h3',{'lang-key':'return_temperature'},'return_temperature'),
		createElement('input', { 
			type:'number', 
			min:30,
			max:90,
			step:1,
			id: 'return_temperature', 
			value: radModel.returnTemperature,
			onchange: handleReturnTemperatureChange
			},''),
		createElement('h3',{'lang-key':'spaces'},'spaces'),
		createElement('table',{id:'radiators_table'},'')
		]
		)
			
	rdiv.append(startAndReturn)
	
	
	var table = document.getElementById('radiators_table')
	
	var headers = ["space","heatload","temperature","exponent","correctiefactor","ref_power"]
	
	const columns = [
		{ header: "space_name", type: "text", value: "spaceName" },  
		{ header: "heatload", type: "text", value: "heatload" },  
		{ header: "temperature", type: "text", value: "temperature" },  
		{ header: "exponent", 
   		  type: "number", 
		  value: "exponent", 
		  step: 0.1,
		  min: 1.1,
		  max: 1.4,
		  oninput: (event, row) => handleExponentChange(event, row)
		  },  
		{ header: "correctiefactor", 
		  type: "number", 
		  value: "correctiefactor",
		  max: 1,
		  min: 0.7,
		  step: 0.1
		  },  
		{ header: "refpower", type: "text", value: "refpower" }
		]


	data = []

	radModel.spaces.forEach(space => {
			data.push( {spaceName: space.name,
						spaceid: space.id,
						heatload: space.heatLoad.toFixed(0),
						temperature: space.temperature,
						exponent: space.exponent,
						correctiefactor: space.correctionFactor,
						refpower: space.refPower.toFixed(0)
			})
	})

	//console.log(data)

	renderTable(table,columns,data)


	//rdiv.append(table)


		
}

function toggleVisibility(input) {
	
	
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



function renderFloorHeating(){
	// model = floorModel

	
	var div = document.getElementById("floorheating")
	div.innerHTML=""

	//main structure
	var content = createElement('div',{},'',[
						createElement('h2',{"lang-key":"floor_heating"},'floor_heating',[]),
						createElement('h3',{'lang-key':'spaces'},'spaces',[]),
						createElement('table',{'id':'table_spaces_floor'},'',[]),
						createElement('h3',{'lang-key':'floor_system'},'floor_system',[]),
						createElement('select',{'id':'floor_system_select'},'',[]),
						createElement('h3',{'lang-key':'ref_loop'},'ref_loop',[]),
						//createElement('select',{'id':'ref_loop_select'},'',[]),
						createElement('table',{'id':'ref_loop_table'},'',[]),
						createElement('h3',{'lang-key':'loop_details'},'loop_details',[]),
						createElement('table',{'id':'table_loops'},'',[]),
						])

	div.append(content)
	
	renderFloorHeatingSpaces()
	renderFloorHeatingSelects()
	renderRefLoop()
	renderLoopTable()

}

function renderFloorHeatingSpaces(){

	//table of spaces
	const columns = [
		{ header: "name", type: "text", value: "name" },  
		{ header: "heatload", type: "text", value: "heatload" },  
		{ header: "area", type: "text", value: "area" },  
		{ header: "netarea", 
   		  type: "number", 
		  value: "netarea", 
		  step: 1,
		  min: 1,
		  max: "area",
          oninput: (event, row) => handleChangeHeatedFloorArea(event, row)
		},  
		{ header: "hl_per_m2", type: "text", value: "hl_per_m2" },  
		{ header: "grouped",
		  type: "checkbox",
		  onchange: (event,row) => handleGroupedFloorCheckbox(event,row)
		},
		{ header: "nloops", 
   		  type: "number", 
		  value: "nloops", 
		  step: 1,
		  min: 0,
		  max: 5,
		  oninput: (event, row) => handleChangeNumberOfFloorHeatingLoop(event, row)
		},
		{ header: "loops",
		  type:"div", 
		  id: "id"}

	]		


	var data = []

	// creating table of spaces
	for ([id,space] of Object.entries(floorModel.spaces)){
		
		data.push( {'name':space.name,
					'spaceid':id,
		            'heatload':space.heatLoad.toFixed(0),
					'area':space.floorArea.toFixed(0),
					'netarea':space.heatedFloorArea.toFixed(0),
					'hl_per_m2':(space.heatLoad/space.heatedFloorArea).toFixed(1),
					'grouped': null,
					'nloops': space.loops.length,
					'id': "div-loop-space-"+id}
					)
					
	}
	var table = document.getElementById('table_spaces_floor')
	renderTable(table,columns,data)


	//for each space, creating subtables with loop
	for ([id,space] of Object.entries(floorModel.spaces)){
		targetdiv = document.getElementById("div-loop-space-"+id)
		renderSpaceLoops(floorModel,id,targetdiv)
	}
	
	
}

function renderSpaceLoops(floorModel,spaceid,parentElement){
		
	space = floorModel.spaces[spaceid]
	
	
	
	
	//loops = floorModel.loops
	columns = [ {type:"text",value:"name"},
		        {type:"number",
				 value:"area",
                 oninput: (event, row) => handleLoopWeightChange(event, row),
				 min:1
				 }
			]

	data = []
		
	space.loops.forEach( l => { 

		loopid = l.loopid
		loop = floorModel.getLoopById(loopid)
		data.push({"name":loop.name,"area":l.weight.toFixed(1),"spaceid":spaceid,"loopid":loopid})
		

	})	
	table = createElement('table',{},"",[])
	parentElement.append(table)
	
	renderTable(table,columns,data,headerrow=false)
	forceTwoEqualColumns(table)
	
}




function renderFloorHeatingSelects(){
	// render System select & ref loop Select
	
	var systemSelect = document.getElementById("floor_system_select")
	
	for (const [name, props] of Object.entries(floorModel.defaultSystems)) {
		
		var systemOption = createElement('option', { value:name }, name,[])
		systemSelect.append(systemOption)
	}
	
	systemSelect.value = floorModel.system
	systemSelect.addEventListener("change",handleFloorSystemChange)
	
}

function renderRefLoop(){

	//headers=["loopname","heatedarea","totalheatload","hl_per_m2","mean_air_T","Rb","tubeSpacing"]

	//table of spaces
	const columns = [
		{ header: "loopname",  
		  type: "select", 
		  value: "loopid",
		  options: floorModel.loops.map(item => ({ value: item.id, label: item.name })) ,		
		  onchange: (event, row) => handleRefLoopChange(event, row)
		},
		{ header: "heatedarea", type: "text", value: "heatedarea" },  
		{ header: "totalheatload", type: "text", value: "totalheatload" },  
		{ header: "hl_per_m2", type: "text", value: "hl_per_m2" },  
		{ header: "mean_air_T", type: "text", value: "mean_air_T" },  
		{ header: "Rb",
		  type: "select", 
		  value: "Rb",
		  options: [{value:0.0,label:0.0},
					{value:0.05,label:0.05},
					{value:0.10,label:0.1},
					{value:0.15,label:0.15}],		
			onchange: (event, row) => handleLoopRChange(event, row)
		},
		{ header: "tubeSpacing",
		  type: "select", 
		  value: "tubeSpacing",
		  options: [{value:5,label:5},
					{value:10,label:10},
					{value:15,label:15},
					{value:20,label:20}],		
			onchange: (event, row) => handleLoopSpacingChange(event, row)
		},
		{ header: "deltaH", type: "text", value: "deltaH" },  
		{ header: "sigma", 
		  type: "number", 
		  value: "sigma",
		  max: 6,
		  min: 4,
		  step: 1,
		  oninput: handleRefSigmaChange
		  },
		{ header: "Tstart", type: "text", value: "Tstart" },  
		{ header: "Treturn", type: "text", value: "Treturn"} 		  
	]	

	var data = []

	floorModel.loops.forEach(loop => {
		
		if (loop.id == floorModel.refLoopid){
		
			data.push({"loopname":loop.name,
						"loopid":loop.id,
						"heatedarea":loop.stats.totalHeatedArea.toFixed(0),
						"totalheatload":loop.stats.totalHeatLoad.toFixed(0),
						"hl_per_m2":loop.stats.heatLoadPerSqMeter.toFixed(1),
						"mean_air_T":loop.stats.meanAirTemperature.toFixed(1),
						"Rb":loop.Rb,
						"tubeSpacing":loop.tubeSpacing,
						"deltaH":loop.stats.deltaH,
						"sigma":floorModel.designDeltaT,
						"Tstart":floorModel.supplyWaterTemperature.toFixed(1),
						"Treturn":loop.stats.returnTemperature.toFixed(1)
			})
		}	
		
	})
	
	console.log("row data",data)
	
	renderTable(document.getElementById("ref_loop_table"),columns,data)
	
	
}


function renderLoopTable(){
	
	var table = document.getElementById("table_loops")
	
	//table of spaces
	const columns = [
		{ header: "loopname", type: "text", value: "loopname" },  
		{ header: "heatedarea", type: "text", value: "heatedarea" },  
		{ header: "totalheatload", type: "text", value: "totalheatload" },  
		{ header: "hl_per_m2", type: "text", value: "hl_per_m2" },  
		{ header: "mean_air_T", type: "text", value: "mean_air_T" },  
		{ header: "Rb",
		  type: "select", 
		  value: "Rb",
		  options: [{value:0.0,label:0.0},
					{value:0.05,label:0.05},
					{value:0.10,label:0.1},
					{value:0.15,label:0.15}],		
			onchange: (event, row) => handleLoopRChange(event, row)
		},
		{ header: "tubeSpacing",
		  type: "select", 
		  value: "tubeSpacing",
		  options: [{value:5,label:5},
					{value:10,label:10},
					{value:15,label:15},
					{value:20,label:20}],		
			onchange: (event, row) => handleLoopSpacingChange(event, row)
		},
		{ header: "deltaH", type: "text", value: "deltaH" },  
		{ header: "sigma", type: "text",  value: "sigma"},
		{ header: "Tstart", type: "text", value: "Tstart" },  
		{ header: "Treturn", type: "text", value: "Treturn"} 		  
	]		
	
	var data = []
	                

	floorModel.loops.forEach(loop => {
		console.log("loop ",loop)
		data.push({"loopname":loop.name,
					"loopid":loop.id,
					"heatedarea":loop.stats.totalHeatedArea.toFixed(0) || 0,
					"totalheatload":loop.stats.totalHeatLoad.toFixed(0),
					"hl_per_m2":loop.stats.heatLoadPerSqMeter.toFixed(1),
					"mean_air_T":loop.stats.meanAirTemperature.toFixed(1),
					"Rb":loop.Rb,
					"tubeSpacing":loop.tubeSpacing,
					"deltaH":loop.stats.deltaH.toFixed(1),
					"sigma":loop.stats.sigma.toFixed(1),
					"Tstart":floorModel.supplyWaterTemperature.toFixed(1),
					"Treturn":loop.stats.returnTemperature.toFixed(1),
		})
		
		
	})
	
	renderTable(table,columns,data)
	
	
}