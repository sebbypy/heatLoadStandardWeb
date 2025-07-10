function loadPage(){
	
	model = new DataModel();
	radModel = new RadiatorsModel();
	floorModel = new FloorHeatingModel();
	radModel.linkToModel(model);

	
	document.getElementById("main_container").innerHTML = ""
	initializePage("main_container")
	addOutsideBoundary()

	model.createNewWallElement("Mur ext",0.24,0.02)
	model.createNewWallElement("Toit",0.24,0.02)
	model.createNewWallElement("Menuiseries DV",1.5,0.0)

	renderAll()
	toggleVisibility('spaces')
	
	switchLanguage(getCurrentLanguage())
	addTracking()

}

function resetPage(){
	
	if (confirm(translate("confirm_reset"))) {
		loadPage()
	}
	

}
