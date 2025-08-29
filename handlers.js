// SPACES AND BOUNDARIES

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

function handleSpacePropertyChange(spaceId, property, value) {
	model.changeSpaceProperty(spaceId,property,value)	
	renderAll()

}

function handleSpaceNameChange(id, newName) {
	model.renameSpace(id,newName)
	renderAll()
}


// VENTILATION


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
	renderAll()
}


// WALL /	Wall instances

function handleAddWallInstance(indexSpace) {

    const space = model.spaces[indexSpace];
	model.createNewWallInstance(space.id)
	renderAll() // 0 area wall, no calculation needed
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

function handleWallInstanceHeightChange(wallId, callerspaceid, newheight) {
	model.changeWallInstanceHeight(wallId,callerspaceid,newheight)
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

function handleCopyHeatupToAll(){

	var firstspace = model.getHeatedSpaces()[0]
	
	var value = model.getSpaceHeatUpTime(firstspace.id)
	
	model.spaces.forEach( space =>{
		model.setSpaceHeatUpTime(space.id,value)
	})
	model.computeAll()
	renderAll()
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

// AIR TIGHTNESS

function handleAirTightnessChange() {

	var choice = document.getElementById('airTightnessSelect').value
	var value  = document.getElementById('at_value').value;
	var surface = document.getElementById('at_ref_surface').value;

	model.changeAirThightnessInputs(choice,value,surface)
	renderAll()
}


// HEATUP

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


// RADIATORS 

function handleExponentChange(e,row){
	radModel.setExponent(row.spaceid,parseFloat(e.target.value))
	renderRadiators()
	//to write
}

function handleStartTemperatureChange(e){
	radModel.setStartTemperature(parseFloat(e.target.value))
	radModel.computeAll()
	renderRadiators()
}

function handleReturnTemperatureChange(e){
	radModel.setReturnTemperature(parseFloat(e.target.value))
	radModel.computeAll()
	renderRadiators()

}



// FLOOR HEATING

function handleChangeNumberOfFloorHeatingLoop(e,row){
	
	/*console.log("adding or removing loop")
	console.log(e.target)
	console.log(row)*/
		
	if (e.target.value > row.nloops){
		//console.log("ADD LOOP TO SPACE")
		floorModel.addLoop("Loop "+row.name+" "+e.target.value,10, 0.10)
	    floorModel.linkLoopToSpace(floorModel.numberOfLoops, row.spaceid);
		floorModel.setTubeSpacing(floorModel.numberOfLoops,10)
		floorModel.setLoopFloorResistance(floorModel.numberOfLoops,0.1)
		floorModel.setLoopResistances(floorModel.numberOfLoops,0.05,0.14)
		floorModel.setLoopL0(floorModel.numberOfLoops,5)

	}
	
	if (e.target.value < row.nloops){
		
		var lastloopid = floorModel.spaces[row.spaceid].loops[row.nloops-1].loopid
		
		if (lastloopid == floorModel.refLoopid){
			console.log("Cannot remove ref looop")
			
		}
		else{
			floorModel.unlinkLoopFromSpace(lastloopid,row.spaceid)
			floorModel.deleteUnusedLoops()
		}
	}
	
	renderFloorHeating()
	
}

function handleChangeHeatedFloorArea(e,row){
		
	floorModel.setHeatedFloorArea(row.spaceid,parseFloat(e.target.value))
	renderFloorHeating()
}

function handleLoopWeightChange(e,row){
	
	/*console.log("changing loop weight")
	console.log(e.target)
	console.log(row)
	*/	
	floorModel.updateLoopWeight(row.loopid,row.spaceid,parseFloat(e.target.value))
	floorModel.computeAll()
	renderFloorHeating()
	
	
}

function handleFloorSystemChange(e){
	
	floorModel.setSystem(e.target.value)
	renderFloorHeating()
	
	
}

function handleFloorHeatingSupplyWaterTemperaturechange(e){
	
	floorModel.setSupplyWaterTemperature(e.target.value)
	renderFloorHeating()

	
}


function handleLoopRChange(e,row){
	floorModel.setLoopFloorResistance(row.loopid,parseFloat(e.target.value))
	renderFloorHeating()
	
	
}

function handleRefLoopChange(e,row){
	floorModel.setRefLoop(Number(e.target.value))
	renderFloorHeating()
	
	
}

function handleLoopSpacingChange(e,row){
	floorModel.setTubeSpacing(row.loopid,parseFloat(e.target.value))
	renderFloorHeating()
	
	
}

function handleRefSigmaChange(e){
	floorModel.setDesignTemperatureDifference(parseFloat(e.target.value))
	renderFloorHeating()
	
}

function handleGroupedFloorCheckbox(e,row){

	if (e.target.checked){

		floorModel.spaces[row.spaceid]["ui"] = {"inGrouping":true}

	}
	else{
		var linkedloop =  floorModel.spaces[row.spaceid].loops[0].loopid //get previously linked
		floorModel.createLoopForNewSpace(row.spaceid)                         // create new loop owned by this space only
		floorModel.unlinkLoopFromSpace(linkedloop,row.spaceid)            // remove previous link
		
		floorModel.spaces[row.spaceid]["ui"] = {"inGrouping":false}
		
	}
	floorModel.ensureValidRefLoopId()
	renderFloorHeating()
}

function handleGroupSelect(e,spaceid){
	
	var selectedLoopid = Number(e.target.value)
	
	var space = floorModel.spaces[spaceid]
	const loopIds = space.loops.map(l => l.loopid)
	
	if (selectedLoopid != -1){
		
		// existing linked loops
		var space = floorModel.spaces[spaceid]
		const loopIds = space.loops.map(l => l.loopid)
		
		floorModel.linkLoopToSpace(Number(selectedLoopid),Number(spaceid))
		space.ui.inGrouping = true
		space.ui["grouped"] = true
		
		loopIds.forEach(loopid => {floorModel.unlinkLoopFromSpace(Number(loopid),Number(spaceid))})
		floorModel.deleteUnusedLoops()
		
		
	}
	floorModel.ensureValidRefLoopId()
	renderFloorHeating()
	
	
}

function handleL0Change(e,row){
	
	floorModel.setLoopL0(row.loopid,Number(e.target.value))
	floorModel.computeAll()
	renderFloorHeating()
	
}

function handleFloorR0Change(e,row){

	floorModel.setLoopResistances(row.loopid,Number(e.target.value),floorModel.getLoopById(row.loopid).Ru)
	floorModel.computeAll()
	renderFloorHeating()

}

function handleFloorRuChange(e,row){

	floorModel.setLoopResistances(row.loopid,floorModel.getLoopById(row.loopid).R0,Number(e.target.value))
	floorModel.computeAll()
	renderFloorHeating()

}

function handleLoopSpaceBelowChange(e,row){
	
	var spaceid = Number(e.target.value)
	var space = model.getSpace(spaceid)
	floorModel.setLoopBelowTemperature(row.loopid,space.temperature)
	
	loop = floorModel.getLoopById(row.loopid)
	loop["ui"] = {'belowspaceid':spaceid}
	renderFloorHeating()
	
}

function handleFloorSystemChangeInDefinitions(e){
	
	newselectedSystem = e.target.value
	renderSelectedSystemData(e.target)
	//renderFloorHeating()
}

function handleCreateNewFloorSystem(e){
	
	floorModel.defaultSystems[translate('new_system')]= 
	{
			5: { 0.00: 7.00, 0.05: 5.35, 0.10: 4.13, 0.15: 3.38 },
			10: { 0.00: 6.00, 0.05: 4.69, 0.10: 3.73, 0.15: 3.11 },
			15: { 0.00: 5.00, 0.05: 4.15, 0.10: 3.33, 0.15: 2.83 },
			20: { 0.00: 4.00, 0.05: 3.69, 0.10: 3.05, 0.15: 2.60 },
			25: { 0.00: 4.00, 0.05: 3.27, 0.10: 2.79, 0.15: 2.38 },
			30: { 0.00: 3.00, 0.05: 2.91, 0.10: 2.49, 0.15: 2.17 }
		}
	
	renderFloorHeating()
	document.getElementById('floorsystemeditor-select').value = translate('new_system')
	renderSelectedSystemData(document.getElementById('floorsystemeditor-select'))


}

function handleSaveFloorSystemData(e){
	
	//floorModel.defaultSystems[translate('new_system')]= 
	var oldKey = document.getElementById('floorsystemeditor-select').value
	var newKey = document.getElementById('floorsystem_name_input').value
	
	floorModel.defaultSystems[newKey] = floorModel.defaultSystems[oldKey];
	delete floorModel.defaultSystems[oldKey];

	renderFloorHeating()
	document.getElementById('floorsystemeditor-select').value = newKey
	renderSelectedSystemData(document.getElementById('floorsystemeditor-select'))
	
}

function handleDeleteFloorSystemData(e){
	
	var oldKey = document.getElementById('floorsystemeditor-select').value
	delete floorModel.defaultSystems[oldKey];

	renderFloorHeating()
	//document.getElementById('floorsystemeditor-select').value = newKey
	//renderSelectedSystemData(document.getElementById('floorsystemeditor-select'))
	
	
}

function handleEditSystem(e){
	
	document.getElementById('floorheating-sizing-div').style.display = "none"
	document.getElementById('floorsystems-div').style.display = "block"
	document.getElementById('floorheating').mode = 'editsystem'
	
}

function handleBackToHeatingSizing(e){
	
	document.getElementById('floorheating-sizing-div').style.display = "block"
	document.getElementById('floorsystems-div').style.display = "none"
	document.getElementById('floorheating').mode = 'sizing'
	
	
	
	
}

function handleLoopNameChange(e,row){
	
	var newName = e.target.value
	var loop = floorModel.getLoopById(row.loopid)
	loop.name = newName
	renderFloorHeating()
	
}





// TO DOS
/*

short term

- sort the floor heating loop in the same order they appear in the space table


longer term
- allow floor and radiator sizing using manual inputs for heat load
- allow other alternative models for heatload calc



*/