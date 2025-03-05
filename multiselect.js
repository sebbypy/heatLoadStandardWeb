class MultiLevelSelect {
    constructor(data, selectedValue = null, onchange = null, name = "multilevelselectValue") {
        this.data = data;
        this.name = name;
        this._onchange = onchange;
        this.selectedValue = selectedValue || null;
        this.selectedText = selectedValue ? translate(selectedValue) : translate("select_an_option");

        return this.init();
    }

    init() {
        // Create main dropdown container
        const dropdown = document.createElement("div");
        dropdown.className = "multilevelselect";
        dropdown.style.width = "100%";

        // Create select button
        this.button = document.createElement("button");
        this.button.textContent = this.selectedText;
        this.button.style.width = "100%";

        // Create dropdown menu
        this.menu = document.createElement("div");
        this.menu.className = "multilevelselect-menu";

        // Create hidden input field to store value
        this.hiddenInput = document.createElement("input");
        this.hiddenInput.type = "hidden";
        this.hiddenInput.name = this.name;

        // Build the menu, stopping at the last meaningful level
        this.createMenu(this.data, this.menu);

        // Append elements
        dropdown.appendChild(this.button);
        dropdown.appendChild(this.menu);
        dropdown.appendChild(this.hiddenInput);

        return dropdown;
    }

    createMenu(data, parentElement) {
        Object.keys(data).forEach(category => {
            let item = document.createElement("div");
            item.className = "multilevelselect-item";
            item.textContent = translate(category); // Use translate function

            const subdata = data[category];

            if (this.shouldStopHere(subdata)) {
                // If it's a final selectable item, stop here
                item.addEventListener("click", () => {
                    this.selectedText = translate(category);
                    this.selectedValue = category;
                    this.button.textContent = this.selectedText;
                    this.hiddenInput.value = this.selectedValue;

                    // Execute onchange callback if provided
                    if (typeof this._onchange === "function") {
                        this._onchange(this.selectedValue);
                    }
                });
            } else {
                // Otherwise, create a submenu
                let submenu = document.createElement("div");
                submenu.className = "submenu";
                this.createMenu(subdata, submenu);
                item.appendChild(submenu);
            }

            parentElement.appendChild(item);
        });
    }

    shouldStopHere(subdata) {
        // Stop if subdata is not an object or if it only contains properties like 'subtype', 'min', 'max'
        return (
            typeof subdata !== "object" ||
            (Object.keys(subdata).length > 0 && !Object.values(subdata).some(value => typeof value === "object"))
        );
    }

    getValue() {
        return this.selectedValue;
    }
}
