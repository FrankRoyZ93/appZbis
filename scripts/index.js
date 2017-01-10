//// Local Variables ////

// Local storage
var V_Storage;

// Grid
var V_Grid;

// Temporary variable to add a new element to a list
var V_ListToAddNewElement;

// Temporary variable to remove a list
var V_ListToRemove;

// Language of the browser
var V_Language;

// true if the app is run on mobile, false else
var V_OnMobile;

//// Functions ////

// ***************************** //
// **** Load/Save functions **** //
// ***************************** //

// Called whan the application load : instantiate the grid
function Load()
{
    V_Storage = window.localStorage;
    var grid = V_Storage.getItem("Grid");

    V_Grid = $("#listsGrid");

    if (grid != "" || grid != undefined || grid != null)
    {
        V_Grid.html(grid);

        var checkboxes = V_Grid.find(".AppZbisRDV_ListsElementsCheckbox");
        var isChecked = JSON.parse(V_Storage.getItem("checkboxes"));

        var i;
        for (i = 0; i < checkboxes.length; i++)
        {
            checkboxes.eq(i).prop('checked', isChecked[i]);
        }

        RefreshElements();
    }

    // make the elements of the list sortable
    $(".AppZbisRDV_ElementList").sortable({
        stop: function (event, ui) {
            ReorganiseList($("#" + $(".AppZbisRDV_ElementList").prop("id")));
        }
    });

    //Save each time a checkbox is checked
    $(".AppZbisRDV_ListsElementsCheckbox").on("click", function () {
        SaveGrid();
    });

    //Initialize dropdown
    $('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: false,
        hover: false,
        gutter: 0, // Spacing from edge
        belowOrigin: false,
        alignment: 'right' // Displays dropdown with edge aligned to the left of button
    });

    $('.Insert_dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: false,
        hover: false,
        gutter: 0, // Spacing from edge
        belowOrigin: true,
        alignment: 'right' // Displays dropdown with edge aligned to the right of button
    });

    CheckLanguage();
    
    // Set V_OnMobile
    V_OnMobile = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
}

// Save all elements in the grid
function SaveGrid()
{
    V_Grid = $("#listsGrid");
    V_Storage.setItem("Grid", V_Grid.html());

    var checkboxes = V_Grid.find(".AppZbisRDV_ListsElementsCheckbox");
    var checked = [];
    var i;
    for (i = 0; i < checkboxes.length; i++)
    {
        checked.push(checkboxes.eq(i).prop("checked"));
    }
    V_Storage.setItem("checkboxes", JSON.stringify(checked));

    var elementsInList = $(".AppZbisRDV_ListsElements");

    var namesIn_elementsInList = [];
    var emailsIn_elementsInList = [];

    for (i = 0; i < elementsInList.length; i++)
    {
        if (namesIn_elementsInList.indexOf(elementsInList.eq(i).find("label").eq(0).html()) === -1)
        {
            namesIn_elementsInList.push(elementsInList.eq(i).find("label").eq(0).html());
            emailsIn_elementsInList.push(elementsInList.eq(i).find("input").eq(1).val());
        }
    }
    
    var elements = '{ "element" : [ ';    
    for (i = 0; i < namesIn_elementsInList.length; i++)
    {
        elements += '{ "name" : "' + namesIn_elementsInList[i] + '", "email" :"' + emailsIn_elementsInList[i] + '" }';
        
        if (i + 1 < namesIn_elementsInList.length)
        {
            elements +=', ';
        }    
    }
    elements += ' ] }';
    elements = elements.replace(/(\r\n|\n|\r)/gm, "");
        
    V_Storage.setItem("elements", elements);

    RefreshElements();
}

// Gets all elements and put them in the insert dropbox
function RefreshElements()
{
    $("#addNewElementInsertDropdown").html("");

    var elementsSaved = V_Storage.getItem("elements");
    
    if (elementsSaved !== null)
    {
        var jsonObj = JSON.parse(elementsSaved);
        var i;
        for (i = 0; i < jsonObj.element.length; i++)
        {
            var objName = jsonObj.element[i].name;
            var objEmail = jsonObj.element[i].email;

            var newLi = $('<li id="element' + (i + 1) + '"></li>');
            var newA = $('<a onclick="DisplayElementToInsert(\'' + objName + '\', \'' + objEmail + '\')">' + objName + '</a>');
            
            $("#addNewElementInsertDropdown").append(newLi);
            newLi.append(newA);
        }
    }
}

// Clear everything stored in memory
function Clear()
{
    V_Storage.clear();
    V_Grid.html("");
}

// ********************************* //
// **** Import/Export functions **** //
// ********************************* //

// Import elements form a csv file
function Import(_file)
{
    var reader = new FileReader();

    reader.onloadend = function (e) {
        var result = reader.result;
        var listsToLoad = result.split("\n");
        
        var listsCreatedNames = [];
        var listsCreated = [];

        var i;
        for (i = 1; i < listsToLoad.length; i++)
        {
            if (listsToLoad[i] != "")
            {
                var listParameters = listsToLoad[i].split(";");
                var listInUse;

                if (!Contains(listParameters[0], listsCreatedNames)) 
                {
                    listsCreatedNames.push(listParameters[0]);

                    listInUse = CreateList(listParameters[0]);

                    listsCreated.push(listInUse);
                }
                else
                {
                    listInUse = listsCreated[listsCreatedNames.indexOf(listParameters[0])];
                }

                var newElement = AddNewElement(listParameters[1], listParameters[3], listInUse);
                
                if (listParameters[2].includes("oui"))
                {
                    CheckElement(newElement, true);
                }
                else
                {
                    CheckElement(newElement, false);
                }
            }
        }
    }

    reader.readAsText(_file);

    $("#fileToImport").val("");
    $("#fileToImportText").val("");
}

// Export all lists and elements in a csv file
function Export(_Name)
{
    var data = CreateCSV();
    var fileName = _Name + ".csv";

    if (V_OnMobile)
    {
        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (dir) {
            dir.getFile(fileName, { create: true }, function (file) {
                file.createWriter(function (fileWriter) {
                    fileWriter.onwriteend = function ()
                    {
                        $("#exportedFileResult").css("color", "green");
                        switch (V_Language)
                        {
                            case "fr":
                                $("#exportedFileResult").html("Création du fichier " + fileName + " réussie. Vous pourrez le retrouvez à la racine du stockage interne de l'appareil. (>racine>sdcard)");
                                break;
                            default:
                                $("#exportedFileResult").html("Creation of file " + fileName + " successfull. You can find it at the root of your device's internal storage. (>racine>sdcard)");
                        }
                    };

                    fileWriter.onerror = function (e)
                    {
                        $("#exportedFileResult").css("color", "red");
                        switch (V_Language)
                        {
                            case "fr":
                                $("#exportedFileResult").html("Création du fichier " + fileName + " échouée. Code d'erreur : " + e.toString());
                                break;
                            default:
                                $("#exportedFileResult").html("Creation of file " + fileName + " failed. Error code : " + e.toString());
                        }
                    };

                    //create blob for csv content
                    var blob = new Blob([data], { type: 'text/csv' });

                    fileWriter.write(blob);
                })
            });
        });
    }
    //If on Web Browser
    else
    {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(data));
        element.setAttribute('download', fileName);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);

        $("#exportedFileResult").css("color", "green");
        switch (V_Language)
        {
            case "fr":
                $("#exportedFileResult").html("Création du fichier " + fileName + " réussie.");
                break;
            default:
                $("#exportedFileResult").html("Creation of file " + fileName + " successfull.");
        }
    }
    
    $('#exportedFileModal').modal("open");
    $("#fileToExportName").val("");
}

// Create the exported csv content
function CreateCSV()
{
    var resultCSV = 'List_Name;Element_Name;Element_Present;Element_Email\n';

    var lists = V_Grid.find(".AppZbisRDV_ElementList");
    var i;
    for (i = 0; i < lists.length; i++)
    {
        var elements = lists.eq(i).find(".AppZbisRDV_ListsElements");
        var j;
        for (j = 0; j < elements.length; j++)
        {
            resultCSV += lists.eq(i).parent().find("h4").eq(0).html() + ';' + elements.eq(j).find("label").eq(0).html();

            if (elements.eq(j).find(".AppZbisRDV_ListsElementsCheckbox").prop("checked"))
            {
                resultCSV += ';oui';
            }
            else
            {
                resultCSV += ';non';
            }

            resultCSV += ';' + elements.eq(j).find("input").eq(1).val() + '\n';
        }
    }

    return resultCSV;
}

// ************************ //
// **** Grid functions **** //
// ************************ //

// Create a new list
function CreateList(_name)
{
    if (_name == "")
    {
        switch (V_Language)
        {
            case "fr":
                $("#addNewListError").html("Oups! Ecris quelque chose d'abord!");
                break;
            default:
                $("#addNewListError").html("Oops! Write something first!");
        }
    }
    else if (V_Grid == null || V_Grid == undefined)
    {
        alert("hum... the grid doesn't exist...");
    }
    else
    {
        // reset the "Add" text 
        $("#addNewListText").val("");
        $("#addNewListError").html("");

        // number of lists in the grid
        var nbOfElements = V_Grid.find(".AppZbisRDV_List").length;

        // add list in the grid

        var newList = $('<div class="col l4 m6 s12 AppZbisRDV_List">' +
                        '   <div class="card-panel">' +
                        '       <div class="row">' +
                        '           <div class="col s12">' +
                        '               <h4 id="list' + (nbOfElements + 1) + 'Name" onclick="EnterNewTitle(list' + (nbOfElements + 1) + 'Name, list' + (nbOfElements + 1) + 'ChangeTitle)">' + _name + '</h4>' +
                        '               <input id="list' + (nbOfElements + 1) + 'ChangeTitle" type="text" onblur="ChangeTitle(list' + (nbOfElements + 1) + 'Name, list' + (nbOfElements + 1) + 'ChangeTitle)" />' +
                        '           </div>' +
                        '       </div>' +
                        '       <ul class="collection ui-sortable sortable AppZbisRDV_ElementList" id="list' + (nbOfElements + 1) + '">' +
                        '       <li class="AppZbisRDV_EmptyListPlaceholder"><i>This list is empty for now</i></li>' +
                        '       </ul>' +
                        '       <!-- Add area -->' +
                        '       <div class="row">' +
                        '           <div class="col s6" id="list' + (nbOfElements + 1) + 'AddButtonCol">' +
                        '               <a class="waves-effect waves-light btn green" id="list' + (nbOfElements + 1) + 'AddButton" onclick="SetListToAddNewElement(list' + (nbOfElements + 1) + ')">Add</a>' +
                        '           </div>' +
                        '           <div class="col s6" id="list' + (nbOfElements + 1) + 'DeleteButtonCol">' +
                        '               <a class="waves-effect waves-light btn red" id="list' + (nbOfElements + 1) + 'DeleteButton" onclick="SetListToRemove(list' + (nbOfElements + 1) + ')">Delete</a>' +
                        '           </div>' +
                        '       </div>' +
                        '   </div>' +
                        '</div>');

        V_Grid.append(newList)

        switch (V_Language)
        {
            case "fr":
                var arrayOfA = $("#list" + (nbOfElements + 1)).parent().find("a");

                arrayOfA.eq(arrayOfA.length - 2).html('Ajouter');
                arrayOfA.eq(arrayOfA.length - 1).html('Supprimer');

                break;
            default:
        }

        // make the elements of the list sortable
        $(".AppZbisRDV_ElementList").sortable({
            stop: function (event, ui) {
                ReorganiseList($("#" + $(".AppZbisRDV_ElementList").prop("id")));
            }
        });

        // hide the title changer field
        $("#list" + (nbOfElements + 1) + "ChangeTitle").hide();
        
        $('#addNewListModal').modal("close");

        SaveGrid();

        return $("#list" + (nbOfElements + 1));
    }
}

// Reorganise the grid (list numbers, etc.)
function ReorganiseGrid()
{
    if (V_Grid == null || V_Grid == undefined)
    {
        alert("hum... the grid doesn't exist...");
    }
    else
    {        
        var lists = V_Grid.find(".AppZbisRDV_List");
        
        for (i = 0; i < lists.length; i++)
        {
            lists.eq(i).find(".AppZbisRDV_ElementList").eq(0).prop("id", 'list' + (i + 1));

            var h4title = lists.eq(i).find("h4").eq(0);
            var listName = h4title.html();

            h4title.parent().html('<h4 id="list' + (i + 1) + 'Name" onclick="EnterNewTitle(list' + (i + 1) + 'Name, list' + (i + 1) + 'ChangeTitle)">' + listName + '</h4>' +
                                  '<input id="list' + (i + 1) + 'ChangeTitle" type="text" onblur="ChangeTitle(list' + (i + 1) + 'Name, list' + (i + 1) + 'ChangeTitle)" />');

            // hide the title changer field
            $("#list" + (i + 1) + "ChangeTitle").hide();

            var arrayOfA = lists.eq(i).find("a");
            
            var addButton = arrayOfA.eq(arrayOfA.length - 2).parent();
            var removeButton = arrayOfA.eq(arrayOfA.length - 1).parent();

            addButton.prop("id", 'list' + (i + 1) + 'AddButtonCol');
            removeButton.prop("id", 'list' + (i + 1) + 'RemoveButtonCol');

            switch (V_Language)
            {
                case "fr":
                    addButton.html('<a class="waves-effect waves-light btn green" id="list' + (i + 1) + 'AddButton" onclick="SetListToAddNewElement(list' + (i + 1) + ')">Ajouter</a>');
                    removeButton.html('<a class="waves-effect waves-light btn red" id="list' + (i + 1) + 'DeleteButton" onclick="SetListToRemove(list' + (i + 1) + ')">Supprimer</a>');
                    break;
                default:
                    addButton.html('<a class="waves-effect waves-light btn green" id="list' + (i + 1) + 'AddButton" onclick="SetListToAddNewElement(list' + (i + 1) + ')">Add</a>');
                    removeButton.html('<a class="waves-effect waves-light btn red" id="list' + (i + 1) + 'DeleteButton" onclick="SetListToRemove(list' + (i + 1) + ')">Delete</a>');
            }

            ReorganiseList(lists.eq(i).find(".AppZbisRDV_ElementList").eq(0));
        }

        SaveGrid();
    }
}

// ************************ //
// **** List functions **** //
// ************************ //

// Set the list where a new element will be added after the user sets parameters
function SetListToAddNewElement(_list)
{
    V_ListToAddNewElement = $(_list);

    $('#addNewElementModal').modal("open");
}

// Set the list to remove after the user sets parameters
function SetListToRemove(_list)
{
    V_ListToRemove = $(_list);
    $("#removeListText").html("Are you sure you want to remove " + $(_list).parent().find("h4").eq(0).html() + "?");

    $('#removeListModal').modal("open");
}

// Sets up the title changer for the user
function EnterNewTitle(_NameElement, _NameInput)
{
    $("#" + _NameElement.prop("id")).hide();
    $("#" + _NameInput.prop("id")).show();

    _NameInput.val(_NameElement.html());
    _NameInput.focus();
}

// Give a new title to a list
function ChangeTitle(_NameElement, _NameInput)
{
    _NameElement.html(_NameInput.val());

    $("#" + _NameElement.prop("id")).show();
    $("#" + _NameInput.prop("id")).hide();

    SaveGrid();
}

// Add an element to V_ListToAddNewElement (via UI)
function AddElement(_toAddName, _toAddEmail)
{
    if (_toAddName == "")
    {
        switch (V_Language)
        {
            case "fr":
                $("#addNewElementError").html("Oups! Ecris un nom d'abord!");
                break;
            default:
                $("#addNewElementError").html("Oops! Write a name first!");
        }
    }
    else if (V_ListToAddNewElement == null || V_ListToAddNewElement == undefined)
    {
        alert("hum... the list doesn't exist...  // AddElement");
    }
    else if (IsNameInList(V_ListToAddNewElement, _toAddName))
    {
        switch (V_Language)
        {
            case "fr":
                $("#addNewElementError").html("Ce nom figure déjà dans cette liste!");
                break;
            default:
                $("#addNewElementError").html("This name is already in this list!");
        }
    }
    else
    {
        if (_toAddEmail == "")
        {
            _toAddEmail = "@";
        }

        // reset the "Add" text 
        $("#addNewElementName").val("");
        $("#addNewElementEmail").val("");
        $("#addNewElementError").html("");
        $("#nameToInsert").html("");
        $("#emailToInsert").html("");
        
        AddNewElement(_toAddName, _toAddEmail, V_ListToAddNewElement);
        
        $('#addNewElementModal').modal("close");

        V_ListToAddNewElement = null;

        SaveGrid();

        //Save each time a checkbox is checked
        $(".AppZbisRDV_ListsElementsCheckbox").on("click", function () {
            SaveGrid();
        });

        //Initialize dropdown
        $('.dropdown-button').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: false,
            hover: false,
            gutter: 0, // Spacing from edge
            belowOrigin: false,
            alignment: 'right' // Displays dropdown with edge aligned to the left of button
        });
    }
}

// Add a new element to _list
function AddNewElement(_toAddName, _toAddEmail, _list)
{
    if (_list == null || _list == undefined)
    {
        alert("hum... the list doesn't exist...  // AddNewElement");
    }
    else 
    {
        //Remove Place Holders
        _list.find(".AppZbisRDV_EmptyListPlaceholder").remove();

        // number of elements in the list
        var nbOfElements = _list.find(".collection-item").length;

        // add element in the list
        var newLI = $('<li class="collection-item ui-sortable-handle AppZbisRDV_ListsElements" id="' + _list.prop("id") + '_element' + (nbOfElements + 1) + '"></li>');
        var newBox = $('<input type="checkbox" class="filled-in AppZbisRDV_ListsElementsCheckbox" id="' + _list.prop("id") + '_check' + (nbOfElements + 1) + '" value="' + _toAddName + '" />');
        var newLabel = $('<label for="' + _list.prop("id") + '_check' + (nbOfElements + 1) + '" id="' + _list.prop("id") + '_label' + (nbOfElements + 1) + '">' + _toAddName + '</label>');
        var newButton = $('<a class="secondary-content dropdown-button btn" data-activates="' + _list.prop("id") + '_dropdown' + (nbOfElements + 1) + '"><i class="material-icons">menu</i></a>');
        var newDropdown = $('<ul id="' + _list.prop("id") + '_dropdown' + (nbOfElements + 1) + '" class="dropdown-content"></ul>');
        var newDropdownEmail = $('<li><a>' + _toAddEmail + '</a></li>');
        var newDropdownErase = $('<li><a onclick="EraseElement(' + _list.prop("id") + '_element' + (nbOfElements + 1) + ', ' + _list.prop("id") + ')"><i class="material-icons">delete</i></a></li>')
        var newHidden = $('<input type="hidden" id="' + _list.prop("id") + "_email" + (nbOfElements + 1) + '" value="' + _toAddEmail + '" />');

        _list.append(newLI);
        newLI.append(newBox);
        newLI.append(newLabel);
        newLI.append(newButton);
        newLI.append(newDropdown);
        newDropdown.append(newDropdownEmail);
        newDropdown.append(newDropdownErase);
        newLI.append(newHidden);

        SaveGrid();
        
        //Save each time a checkbox is checked
        $(".AppZbisRDV_ListsElementsCheckbox").on("click", function () {
            SaveGrid();
        });

        //Initialize dropdown
        $('.dropdown-button').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: false,
            hover: false,
            gutter: 0, // Spacing from edge
            belowOrigin: false,
            alignment: 'right' // Displays dropdown with edge aligned to the left of button
        });

        var id = "#" + _list.prop("id") + '_element' + (nbOfElements + 1);

        return $(id);
    }
}

// Remove an element from _list
function EraseElement(_toErase, _list)
{
    if (_toErase == null || _toErase == undefined)
    {
        alert("Alert! This element doesn't exist anymore!");
    }
    else if (_list == null || _list == undefined)
    {
        alert("hum... the list doesn't exist...  // EraseElement");
    }
    else
    {
        var elements = $(_list).find(".AppZbisRDV_ListsElements");

        // We will now check in the list where '_toErase' is located		
        for (i = 0; i < elements.length; i++)
        {
            if (elements.eq(i).prop("id") === $(_toErase).prop("id"))
            {
                elements.eq(i).remove();
                ReorganiseList($(_list));
                break;
            }
        }
    }
}

// Reorganise the list (numbers, etc.)
function ReorganiseList(_list)
{
    var elementsNodeList = $(_list).find(".AppZbisRDV_ListsElements");
    
    if (elementsNodeList.length > 0)
    {
        for (i = 0; i < elementsNodeList.length; i++)
        {
            elementsNodeList.eq(i).prop("id", $(_list).prop("id") + "_element" + (i + 1));

            var inputs = elementsNodeList.eq(i).find("input");
            inputs.eq(0).prop("id", $(_list).prop("id") + "_check" + (i + 1));

            var labels = elementsNodeList.eq(i).find("label");
            labels.eq(0).prop("for", $(_list).prop("id") + "_check" + (i + 1));
            labels.eq(0).prop("id", $(_list).prop("id") + "_label" + (i + 1));

            elementsNodeList.eq(i).find("a").eq(0).prop("data-activates", $(_list).prop("id") + "_dropdown" + (i + 1));

            var uls = elementsNodeList.eq(i).find("ul");
            uls.eq(0).prop("id", $(_list).prop("id") + "_dropdown" + (i + 1));
            uls.eq(0).html('<li>' + uls.eq(0).find("li").eq(0).html() + '</li>' +
            '<li><a onclick="EraseElement(' + $(_list).prop("id") + '_element' + (i + 1) + ', ' + $(_list).prop("id") + ')"><i class="material-icons">delete</i></a></li>');

            inputs.eq(1).prop("id", $(_list).prop("id") + "_email" + (i + 1));
        }
    }
    else
    {
        $(_list).html('<li class="AppZbisRDV_EmptyListPlaceholder"><i>This list is empty for now</i></li>');
    }

    SaveGrid();
}

// Remove V_ListToRemove
function RemoveList()
{
    if (V_ListToRemove == null || V_ListToRemove == undefined)
    {
        alert("Alert! This list doesn't exist anymore!");
    }
    else if (V_Grid == null || V_Grid == undefined)
    {
        alert("hum... the grid doesn't exist...");
    }
    else
    {
        $(V_ListToRemove).parent().parent().remove();

        $("#removeListText").html("");

        V_ListToRemove = null;

        $('#removeListModal').modal("close");

        ReorganiseGrid();
    }
}

// Checks or unchecks the checkbox of an element
function CheckElement(_element, _value)
{
    _element.find(".AppZbisRDV_ListsElementsCheckbox").prop("checked", _value);
}

// 
function DisplayElementToInsert(_elementName, _elementEmail)
{
    $("#nameToInsert").html(_elementName);
    $("#emailToInsert").html(_elementEmail);
}

// Check if _elementName is in _list
function IsNameInList(_list, _elementName)
{
    var listElements = $(_list).find(".AppZbisRDV_ListsElements");
    var listElementsNames = [];
    var i;
    for (i = 0; i < listElements.length; i++)
    {
        listElementsNames.push(listElements.eq(i).find("label").eq(0).html());
    }

    return Contains(_elementName, listElementsNames);
}

// **************************** //
// **** Language functions **** //
// **************************** //

// Verify the user language
function CheckLanguage()
{
    V_Language = navigator.language || navigator.userLanguage;

    switch (V_Language)
    {
        case "fr":
            ChangeToBaguette();
            break;
        default:
            ChangeToRosbeef();
    }
}

//
function ChangeToBaguette()
{
    // Modal //
    //Add list modal
    $("#addNewListText").prop("placeholder", "Ajouter une nouvelle liste...");
    $("#createNewList").html("Créer");
                             
    //Add element modal      
    $("#addNewElementModal").find("h4").eq(0).html("Ajouter un nouvel élément...");
    $("#addNewElementCreateNewTab").html("Créer élément");
    $("#addNewElementInsertTab").html("Insérer élément");
    $("#addNewElementName").prop("placeholder", "Nom...");
    $("#addNewElementEmail").prop("placeholder", "Adresse mail...");
    $("#createNewElement").html("Valider");
    $("#InsertElementDropdown").html("Sélect...");
    $("#InsertElementInfo").html('<p>Nom : <a id="nameToInsert"></a></p><p>Adresse mail : <a id="emailToInsert"></a></p>');
                             
    //Remove list modal      
    $("#RemoveListYesButton").html("Oui");
    $("#RemoveListNoButton").html("Non");
                             
    //Clear grid modal       
    $("#removeAllListText").html("Etes-vous sur de vouloir effacer toutes les listes?");
    $("#removeAllListYes").html("Oui");
    $("#removeAllListNo").html("Non");
                             
    //Import modal           
    $("#importFileSpan").html("Fichier");
    $("#fileToImportText").prop("placeholder", "Séléctionner un fichier .csv d'où importer des listes");
    $("#importFileButton").html("Importer");
                             
    //Export modal           
    $("#fileToExportName").prop("placeholder", "Entrer un nom de fichier...");
    $("#exportFileButton").html("Exporter");
                             
    //Exported file modal    
    $("#exportedFileContinue").html("Continuer");

    // List //
    var lists = $(".AppZbisRDV_List");
    var i;
    for (i = 0; i < lists.length; i++)
    {
        var arrayOfA = lists.eq(i).find("a");

        arrayOfA.eq(arrayOfA.length - 2).html('Ajouter');
        arrayOfA.eq(arrayOfA.length - 1).html('Supprimer');
    }
}

//
function ChangeToRosbeef()
{
    // List //
    var lists = $("AppZbisRDV_List");
    var i;
    for (i = 0; i < lists.length; i++)
    {
        var arrayOfA = lists.eq(i).find("a");

        arrayOfA.eq(arrayOfA.length - 2).html('Add');
        arrayOfA.eq(arrayOfA.length - 1).html('Delete');
    }
}

// *************************** //
// **** Utility functions **** //
// *************************** //

// Check if obj is in list
function Contains(obj, list)
{
    var i;
    for (i = 0; i < list.length; i++) 
    {
        if (list[i] == obj)
        {
            return true;
        }
    }

    return false;
}

function IsOnMobile()
{
    return V_OnMobile;
}