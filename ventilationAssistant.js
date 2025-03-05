

function openVentilationAssistant() {
    console.log("ventilation assistant");

    let existingDialog = document.getElementById("assistantDialog");
    if (existingDialog) {
        existingDialog.showModal();
        return;
    }

    // Create the dialog element
    let dialog = document.createElement("dialog");
    dialog.id = "assistantDialog";

    // Full-screen styles
    dialog.style.position = "fixed";
    dialog.style.top = "0";
    dialog.style.left = "0";
    dialog.style.width = "100vw";
    dialog.style.height = "100vh";
    dialog.style.margin = "0";
    dialog.style.padding = "20px";
    dialog.style.border = "none";
    dialog.style.background = "rgba(255, 255, 255, 0.98)";
    dialog.style.display = "flex";
    dialog.style.flexDirection = "column";
    dialog.style.justifyContent = "center";
    dialog.style.alignItems = "center";
    dialog.style.zIndex = "1000";

    // Create an overlay div to detect clicks outside
    let overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.zIndex = "-1";

    overlay.addEventListener("click", () => {
        dialog.close();
        dialog.remove();
    });

    // Create the container div
    let container = document.createElement("div");
    /*container.style.background = "#fff";
    container.style.padding = "20px";
    container.style.borderRadius = "8px";
    container.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.3)";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.width = "80%";
    container.style.maxWidth = "800px";*/

    // Create the title
    //let title = document.createElement("h2");
    //title.innerText = "Ventilation Assistant";
	let title = createElement("h2",{"lang-key":"ventilation_assistant"},innerText=translations[getCurrentLanguage()]["ventilation_assistant"])
    container.appendChild(title);

	const instructions = createElement(
		'div', 
		{ class: 'instruction-container' }, 
		'', 
		[
			createElement('h3', {}, 'Instructions'),
			createElement('p',{},translate("ventilation_assistant_intro")),
			createElement(
				'ol', 
				{}, 
				'', 
				[
					createElement('li', {}, translate('choose_system_type')),
					createElement('li', {}, translate('define_space_ventilation_type')),
					createElement('li', {}, translate('apply_min_flowrates')),
					createElement('li', {}, translate('optional_adjust_flowrates_manually')),
					createElement('li', {}, translate('ok_to_save_or_cancel'))
				]
			)
		]
	);


	const systemTypeSection = createElement(
		'div',
		{ class: 'system-type-container' }, // Optional: Add a wrapper for styling
		'',
		[
			createElement('h3', {}, translate("system_type")), // h3 header instead of label
			createElement(
				'select',
				{ onchange: (e) => vModel.setSystemType(e.target.value) },
				'',
				[
					createElement('option', { disabled: true, selected: true, value: '' }, "-- " + translate("select_a_system") + " --"),
					...["C", "D"].map(option => createElement('option', { value: option }, option))
				]
			)
		]
	);

	container.appendChild(instructions);
	container.appendChild(systemTypeSection)
	

    let applyMinFlowButton = document.createElement("button");
    applyMinFlowButton.innerText = translations[getCurrentLanguage()]["applyMinFlows"];
	applyMinFlowButton.onclick = () => handleApplyMinFlows(model,vModel)



	// List of table names
	const tableNames = ["unassigned","Residential", "NonResidentialForPersons", "NonResidentialService"];

	// Create tables dynamically
	tableNames.forEach(name => {
		let table = document.createElement("table");
		table.id = `table${name}`; // Assign a unique ID based on the name

		let tbody = document.createElement("tbody");
		table.appendChild(tbody);

		var header = document.createElement("h3")
		let table_text = "ventilation_table_"+name
		header.innerHTML = translations[getCurrentLanguage()][table_text]
		
		container.appendChild(header);
		container.appendChild(table);
	});

    // Create buttons
    let buttonContainer = document.createElement("div");

    let okButton = document.createElement("button");
    okButton.innerText = "OK";
    okButton.addEventListener("click", () => {
        dialog.close();
        dialog.remove();
		renderAll(); // render main UI
    });

    let cancelButton = document.createElement("button");
    cancelButton.innerText = "Cancel";
    cancelButton.addEventListener("click", () => {
        dialog.close();
        dialog.remove();
    });

	container.appendChild(applyMinFlowButton)


    buttonContainer.appendChild(okButton);
    buttonContainer.appendChild(cancelButton);
    container.appendChild(buttonContainer);

    dialog.appendChild(container);

    document.body.appendChild(dialog);
	
	renderAllVentilationAssistantTables(model,vModel)
	
    dialog.showModal();
}





function renderAllVentilationAssistantTables(mainModel,ventilationModel) {

	ventilationModel.computeMinimumFlows(mainModel)

	renderTableResidential(mainModel,ventilationModel)
	renderTableNonResidentialForPersons(mainModel,ventilationModel)
	//renderTableNonResidentialService()


}

function renderTableResidential(mainModel,ventilationModel){

    let table = document.getElementById("tableResidential");
    
    if (!table) {
        console.error("Table not found. Make sure the modal is open before calling this function.");
        return;
    }
	else {
		table.innerHTML=""
	}

	const columns = [
    { header: "space_name", type: "text", value: "spaceName" },  // New column
    { 
        header: "space_type", 
        type: "multilevelselect", 
        value: "spaceType", 
        data: ventilationModel.spaceData,
		onchange: (value, row) => handleSpaceTypeChange(value, row.spaceid, mainModel,ventilationModel)
    },
    { header: "floor_area", type: "text", value: "floorArea" },
    { header: "min_supply", type: "text", value: "minSupply" },
    { header: "min_extract", type: "text", value: "minExtract" },
    { 
        header: "natural_supply_flowrate", 
        type: "number", 
        value: "ns",
        onchange: (e, row) => console.log(`NS changed for ${row.spaceName}:`, e.target.value)
    },
    { 
        header: "mechanical_supply_flowrate", 
        type: "number", 
        value: "ms",
        onchange: (e, row) => console.log(`MS changed for ${row.spaceName}:`, e.target.value)
    },
    { 
        header: "mechanical_extract_flowrate", 
        type: "number", 
        value: "me",
        onchange: (e, row) => console.log(`ME changed for ${row.spaceName}:`, e.target.value)
    }
];

	var data = []
	
	mainModel.spaces.forEach(space => {
		if (space.type == "heated" && (ventilationModel.isSpaceResidential(space.id) || ventilationModel.isSpaceUndefined(space.id))){
	
			var row = {	spaceName:space.name,
						spaceid: space.id,
						spaceType: ventilationModel.spaces[space.id].spaceType, // Display current spaceType
						floorArea:space.floorarea,
						ns:space.ventilation.natural_supply_flowrate,
						ms:space.ventilation.mechanical_supply_flowrate,
						me:space.ventilation.mechanical_extract_flowrate,
						minSupply:ventilationModel.spaces[space.id].minSupply,
						minExtract:ventilationModel.spaces[space.id].minExtract,
			}
			data.push(row)
		}
	})		
		

	renderTable(table,columns,data)


}

function renderTableNonResidentialForPersons(mainModel,ventilationModel){

    let table = document.getElementById("tableNonResidentialForPersons");
    
    if (!table) {
        console.error("Table not found. Make sure the modal is open before calling this function.");
        return;
    }
	else {
		table.innerHTML=""
	}

	const columns = [
    { header: "space_name", type: "text", value: "spaceName" },  // New column
    { 
        header: "space_type", 
        type: "multilevelselect", 
        value: "spaceType", 
        data: ventilationModel.spaceData,
		onchange: (value, row) => handleSpaceTypeChange(value, row.spaceid,mainModel, ventilationModel)
    },
    { header: "floor_area", type: "text", value: "floorArea" },
	{ header: "people_density", type: "text", value: "peopleDensity" },
    { header: "min_supply", type: "text", value: "minSupply" },
    { header: "min_extract", type: "text", value: "minExtract" },
    { 
        header: "natural_supply_flowrate", 
        type: "number", 
        value: "ns",
        onchange: (e, row) => console.log(`NS changed for ${row.spaceName}:`, e.target.value)
    },
    { 
        header: "mechanical_supply_flowrate", 
        type: "number", 
        value: "ms",
        onchange: (e, row) => console.log(`MS changed for ${row.spaceName}:`, e.target.value)
    },
    { 
        header: "mechanical_extract_flowrate", 
        type: "number", 
        value: "me",
        onchange: (e, row) => console.log(`ME changed for ${row.spaceName}:`, e.target.value)
    }
];

	var data = []
	mainModel.spaces.forEach(space => {
		if (space.type == "heated" && ventilationModel.isSpaceNonResidential(space.id)){
					var row = {	spaceName:space.name,
						spaceid: space.id,
						spaceType: ventilationModel.spaces[space.id].spaceType, // Display current spaceType
						floorArea:space.floorarea,
						peopleDensity:ventilationModel.getSpaceTypePeopleDensity(ventilationModel.spaces[space.id].spaceType),
						ns:space.ventilation.natural_supply_flowrate,
						ms:space.ventilation.mechanical_supply_flowrate,
						me:space.ventilation.mechanical_extract_flowrate,
						minSupply:ventilationModel.spaces[space.id].minSupply,
						minExtract:ventilationModel.spaces[space.id].minExtract,
			}
			data.push(row)
		}
	})		
		

	renderTable(table,columns,data)


}




function handleSpaceTypeChange(value, spaceId, mainModel,ventilationModel) {
    console.log("Selected space type:", value);
    console.log("Updating space with ID:", spaceId);

    // Ensure spaceId exists in ventilationModel
    if (ventilationModel.spaces[spaceId]) {
        ventilationModel.setSpaceType(spaceId,value); // Update spaceType
        console.log(`Updated ventilationModel.spaces[${spaceId}].spaceType to`, value);
    } else {
        console.error(`Space ID ${spaceId} not found in ventilationModel.`);
    }
	
	renderAllVentilationAssistantTables(mainModel,ventilationModel)
	
}

function handleApplyMinFlows(mainModel,ventilationModel){
	ventilationModel.applyMinimumFlows(mainModel)
	renderAllVentilationAssistantTables(mainModel,ventilationModel)
}	
	
	
