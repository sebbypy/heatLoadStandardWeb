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
	console.log("exponent change",e,row)
	console.log("Raw value string:", e.target.value)
	radModel.setExponent(row.spaceid,parseFloat(e.target.value))
	renderRadiators()
	//to write
}

function handleStartTemperatureChange(e){
	console.log("start change")
	console.log(e)
	radModel.setStartTemperature(e.target.value)
	radModel.computeAll()
	renderRadiators()
}

function handleReturnTemperatureChange(e){
	console.log("return change")
	console.log(e)
	radModel.setReturnTemperature(e.target.value)
	radModel.computeAll()
	renderRadiators()

}





