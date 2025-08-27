function packModels(){
	
	return {'heatload':model,
			'radiators':radModel,
			'floor':floorModel}
			
}

function readHeatLoadModel(heatloadJson){
	
	
	model = new DataModel();
    
	if (heatloadJson.spaces && heatloadJson.wallElements && heatloadJson.wallInstances) {
		model.spaces = heatloadJson.spaces;
		model.wallElements = heatloadJson.wallElements;
		model.wallInstances = heatloadJson.wallInstances;

		model.otherData = deepMergeDefaults(model.otherData, heatloadJson.otherData);
		model.zipCode = heatloadJson.zipCode;
		model.airTransfers = heatloadJson.airTransfers;

		model.spaceIdCounter = Math.max(...model.spaces.map(space => space.id)) + 1;
		model.wallElementsIdCounter = Math.max(...model.wallElements.map(element => element.id)) + 1;
		model.wallInstanceID = Math.max(0, ...model.wallInstances.map(instance => instance.id)) + 1;

		model.computeAll();
        } else {
            throw new Error("Invalid data structure");
        }
	
}
			
function readRadiatorsModel(radiatorsJson){
	
	radModel = new RadiatorsModel();
	
	radModel.spaces = radiatorsJson.spaces
	radModel.startTemperature = radiatorsJson.startTemperature
	radModel.returnTemperature = radiatorsJson.returnTemperature
	radModel.refT = radiatorsJson.refT

	//radModel.syncWithMainModel(model.hl_spaces)
	radModel.linkToModel(model);
	radModel.computeAll()
}

/*function readFloorHeatingModel(floorJson){
	
	floorModel = new FloorHeatingModel();

    // If JSON data provided, load and set properties
    if (floorJson && floorJson.spaces && floorJson.loops) {
        // Add spaces
        for (let spaceId in floorJson.spaces) {
            const s = floorJson.spaces[spaceId];
            floorModel.addSpace(s.name, Number(spaceId), s.floorArea, s.temperature, s.heatLoad);
            floorModel.spaces[spaceId].heatedFloorArea = s.heatedFloorArea;
            floorModel.spaces[spaceId].radiator = s.radiator;
        }

        // Add loops
        floorJson.loops.forEach(loopData => {
            floorModel.numberOfLoops = Math.max(floorModel.numberOfLoops, loopData.id);
            let loop = {
                id: loopData.id,
                name: loopData.name,
                spaces: loopData.spaces || [],
                Rb: loopData.Rb,
                tubeSpacing: loopData.tubeSpacing,
                stats: loopData.stats || {},
                L0: loopData.L0,
                R0: loopData.R0,
                Ru: loopData.Ru,
                Tu: loopData.Tu,
                length: loopData.length
            };
            floorModel.loops.push(loop);
        });

        // Re-attach loops to spaces
        for (let spaceId in floorJson.spaces) {
            const s = floorJson.spaces[spaceId];
            s.loops.forEach(l => {
                let loop = floorModel.getLoopById(l.loopid);
                if (loop && !loop.spaces.includes(Number(spaceId))) {
                    loop.spaces.push(Number(spaceId));
                }
            });
        }

        // Copy system, designDeltaT, refLoop, etc.
        if (floorJson.system) floorModel.system = floorJson.system;
        if (floorJson.designDeltaT !== undefined) floorModel.designDeltaT = floorJson.designDeltaT;
        if (floorJson.refLoopid) floorModel.refLoopid = floorJson.refLoopid;
		if (floorJson.supplyWaterTemperature !== undefined) floorModel.supplyWaterTemperature = floorJson.supplyWaterTemperature 
        // Recompute all
        //floorModel.computeAll();

    }
	
	floorModel.linkToModel(model);
	floorModel.syncWithMainModel(model.spaces)
	floorModel.computeAll()
}
*/

function readFloorHeatingModel(floorJson) {
    floorModel = new FloorHeatingModel();

    if (floorJson && floorJson.spaces && floorJson.loops) {
        floorModel.spaces = floorJson.spaces;
        floorModel.loops = floorJson.loops;
        floorModel.numberOfLoops = floorJson.numberOfLoops || floorJson.loops.length;
        floorModel.system = floorJson.system;
        floorModel.designDeltaT = floorJson.designDeltaT;
        floorModel.refLoopid = floorJson.refLoopid;
		floorModel.supplyWaterTemperature = floorJson.supplyWaterTemperature 
        
		floorModel.defaultSystems = floorJson.defaultSystems
		
        floorModel.linkToModel(model);
        floorModel.syncWithMainModel(model.spaces);
        floorModel.computeAll();
	}
    
}
	


function exportData(filename) {
	
	var fullModel = packModels()
	
    const jsonData = JSON.stringify(fullModel, null, 4);
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
    //try {
        const parsed = JSON.parse(jsonData);
		
		readHeatLoadModel(parsed.heatload)
		readRadiatorsModel(parsed.radiators)
		readFloorHeatingModel(parsed.floor)
		renderAll()
	
    //} catch (error) {
    //    console.log("Error loading or parsing data: " + error);
    //    alert("Error loading or parsing data: " + error.message+" "+error.fileName+" "+error.lineNumber);
    //}
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
        //try {
			loadModelFromJson(event.target.result)
            
        /*} catch (error) {
        console.log("Error loading or parsing data: " + error);
        alert("Error loading or parsing data: " + error.message+" "+error.fileName+" "+error.lineNumber);
        }*/
    };
    reader.onerror = function() {
        alert("Failed to read the file.");
    };

    reader.readAsText(file);
}


function saveModelToLocalStorage() {
	
    const jsonData = JSON.stringify(packModels(), null, 4);
	localStorage.setItem('myAppModel', jsonData);
}


function loadModelFromLocalStorage() {
	
    const jsonData = localStorage.getItem('myAppModel');
    if (jsonData) {
        loadModelFromJson(jsonData);
    } else {
        console.log("No saved model found in local storage.");
    }
	//switchLanguage(getCurrentLanguage())

}



// UI Save file dialog

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





function getOrCreateUserId() {
  let uid = localStorage.getItem("user_id");
  if (!uid) {
    uid = self.crypto.randomUUID();
    localStorage.setItem("user_id", uid);
  }
  return uid;
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




function addTracking(){

	document.getElementById("exportPdfBtn").addEventListener("click", () => {trackEvent("exportPDF", "main", model);});
	document.getElementById("exportDocxBtn").addEventListener("click", () => {trackEvent("exportDocx", "main", model);});
	document.getElementById("exportDocxBtn").addEventListener("click", () => {trackEvent("exportDocx", "main", model);});
	
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
	switchLanguage(getCurrentLanguage())

});



function summarize(){
	
	return {"nspaces":	model.getHeatedSpaces().length,
	"zip": model.zipcode,
	}
	
}



function trackEvent(eventName, pageName, extra = {}) {
  const url = new URL("https://script.google.com/macros/s/AKfycbwVKKDXQwnkVjxAdEuDwio6HpSz45cVc0fe2Kj7_LIwNfZVjO31oo1g8lUShT6PbdRVgg/exec");

  const userId = getOrCreateUserId();
  
  url.searchParams.append("event", eventName);
  url.searchParams.append("page", pageName);
  url.searchParams.append("extra", JSON.stringify(extra));
  url.searchParams.append("userid",userId);

  fetch(url)
    .then(() => console.log("Tracked"))
    .catch(err => console.error("Tracking failed:", err));
}


