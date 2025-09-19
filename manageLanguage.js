

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



function switchLanguage(lang) {
    document.querySelectorAll("[lang-key]").forEach(function(element) {
		updateElementLanguage(element,lang)
	})
	
	document.querySelectorAll("[url-key]").forEach(function(element){
		updateElementUrl(element,lang)
	})
	
	document.querySelectorAll("[src-key]").forEach(el => updateImageSrc(el, lang));

}

function updateElementUrl(element, lang) {
	
	
    var key = element.getAttribute("url-key");
    if (!key) return; // Skip if no language key is found

    var translation = translations[lang][key] || key;

    element.setAttribute("href",translation);
}


function updateImageSrc(element, lang) {
    var key = element.getAttribute("src-key");
    if (!key) return;

    var translation = translations[lang][key] || key;

    element.setAttribute("src", translation);
}


function updateElementLanguage(element, lang) {
    var key = element.getAttribute("lang-key");
    if (!key) return; // Skip if no language key is found

    var translation = translations[lang][key] || key;

    // Save existing child elements before modifying innerHTML
    let children = Array.from(element.children);

    // Update the main element’s innerHTML with the translated text (including HTML formatting)
    element.innerHTML = translation;


	//only restore tooltip text
	children.forEach(child =>{
		if (child.getAttribute('class')=='tooltiptext'){
			element.appendChild(child)
		}
	})


	/*if (element.getAttribute('class') != 'tooltiptext'){
    // Reattach saved child elements (like tooltips)
    children.forEach(child => element.appendChild(child));
	*/
}