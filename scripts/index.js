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

//// Fucntions ////

// ***************************** //
// **** Load/Save functions **** //
// ***************************** //

function Load()
{
    V_Storage = window.localStorage;
    var grid = V_Storage.getItem("Grid");

    V_Grid = document.getElementById("listsGrid");

    if (grid != "" || grid != undefined || grid != null)
    {
        V_Grid.innerHTML = grid;

        var checkboxes = $(V_Grid).find(":checkbox");
        var isChecked = JSON.parse(V_Storage.getItem("checkboxes"));

        var i;
        for (i = 0; i < checkboxes.length; i++)
        {
            checkboxes[i].checked = isChecked[i];
        }

        RefreshElements();
    }

    // make the elements of the list sortable
    $(".sortable").sortable({
        stop: function (event, ui) {
            ReorganiseList(document.getElementById($(".sortable").attr("id")));
        }
    });

    //Save each time a checkbox is checked
    $(".filled-in").on("click", function () {
        SaveGrid();
    });

    //Initialize dropdown
    $('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: false,
        hover: true, // Activate on hover
        gutter: 0, // Spacing from edge
        belowOrigin: false,
        alignment: 'right' // Displays dropdown with edge aligned to the left of button
    });

    $('.Insert_dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: false,
        hover: true, // Activate on hover
        gutter: 0, // Spacing from edge
        belowOrigin: true,
        alignment: 'right' // Displays dropdown with edge aligned to the right of button
    });

    CheckLanguage();
}

function SaveGrid()
{
    V_Grid = document.getElementById("listsGrid");
    V_Storage.setItem("Grid", V_Grid.innerHTML);
    var checkboxes = $(V_Grid).find(":checkbox");
    var checked = [];

    var i;
    for (i = 0; i < checkboxes.length; i++)
    {
        checked.push(checkboxes[i].checked);
    }

    V_Storage.setItem("checkboxes", JSON.stringify(checked));

    var elementsInList = document.getElementsByClassName("AppZbisRDV_ListsElements");

    var namesIn_elementsInList = [];
    var emailsIn_elementsInList = [];

    for (i = 0; i < elementsInList.length; i++)
    {
        if (namesIn_elementsInList.indexOf(elementsInList[i].getElementsByTagName("label")[0].innerHTML) === -1)
        {
            namesIn_elementsInList.push(elementsInList[i].getElementsByTagName("label")[0].innerHTML);
            emailsIn_elementsInList.push(elementsInList[i].getElementsByTagName("input")[1].value);
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

function RefreshElements()
{
    document.getElementById("addNewElementInsertDropdown").innerHTML = "";

    var elementsSaved = V_Storage.getItem("elements");
    
    if (elementsSaved !== null)
    {
        var jsonObj = JSON.parse(elementsSaved);
        var i;
        for (i = 0; i < jsonObj.element.length; i++)
        {
            var newLi = document.createElement("li");
            var newA = document.createElement("a");

            document.getElementById("addNewElementInsertDropdown").appendChild(newLi);
            newLi.appendChild(newA);

            newLi.id = "element" + (i + 1);
            newA.setAttribute("onclick", 'DisplayElementToInsert("' + jsonObj.element[i].name + '", "' + jsonObj.element[i].email + '")');
            newA.innerHTML = jsonObj.element[i].name;
        }
    }
}

function Clear()
{
    V_Storage.clear();
    V_Grid.innerHTML = "";
}

// ********************************* //
// **** Import/Export functions **** //
// ********************************* //

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

    reader.readAsText(_file);
}

function Export(_Name)
{
    var element = document.createElement('a');
    var data = CreateCSV();
    var fileName = _Name + ".csv";

    element.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(data));
    element.setAttribute('download', fileName);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function CreateCSV()
{
    var resultCSV = 'List_Name;Element_Name;Element_Present;Element_Email\n';

    var lists = V_Grid.getElementsByTagName("ul");
    var i;
    for (i = 0; i < lists.length; i++)
    {
        var elements = lists[i].getElementsByTagName("li");
        var j;
        for (j = 0; j < elements.length; j++)
        {
            resultCSV += lists[i].parentNode.getElementsByTagName("h4")[0].innerHTML + ";" + elements[j].getElementsByTagName("label")[0].innerHTML;

            if(elements[j].getElementsByTagName("input")[0].checked)
            {
                resultCSV += ";oui";
            }
            else
            {
                resultCSV += ";non";
            }

            resultCSV += elements[j].getElementById(lists[i].id + "_email" + (j + 1))[0].value + "\n";
        }
    }

    return resultCSV;
}

// ************************ //
// **** Grid functions **** //
// ************************ //

function CreateList(_name)
{
    if (_name == "")
    {
        switch (V_Language)
        {
            case "fr":
                document.getElementById("addNewListError").innerHTML = "Oups! Ecris quelque chose d'abord!";
                break;
            default:
                document.getElementById("addNewListError").innerHTML = "Oops! Write something first!";
        }
    }
    else if (V_Grid == null || V_Grid == undefined)
    {
        window.alert("hum... the grid doesn't exist...");
    }
    else
    {
        // reset the "Add" text 
        document.getElementById("addNewListText").value = "";
        document.getElementById("addNewListError").innerHTML = "";

        // number of lists in the grid
        var nbOfElements = V_Grid.getElementsByTagName("ul").length;

        // add list in the grid
        V_Grid.innerHTML +=
        '<div class="col l4 m6 s12 AppZbisRDV_List">' +
        '   <div class="card-panel">' +
        '       <div class="row">' +
        '           <div class="col s12">' +
        '               <h4 id="list' + (nbOfElements + 1) + 'Name" onclick="EnterNewTitle(list' + (nbOfElements + 1) + 'Name, list' + (nbOfElements + 1) + 'ChangeTitle)">' + _name + '</h4>' +
        '               <input id="list' + (nbOfElements + 1) + 'ChangeTitle" type="text" onblur="ChangeTitle(list' + (nbOfElements + 1) + 'Name, list' + (nbOfElements + 1) + 'ChangeTitle)" />' +
        '           </div>' +
        '       </div>' +
        '       <ul class="collection ui-sortable sortable" id="list' + (nbOfElements + 1) + '">' +
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
        '</div>';

        switch (V_Language)
        {
            case "fr":
                var arrayOfA = document.getElementById("list" + (nbOfElements + 1)).parentNode.getElementsByTagName("a");

                arrayOfA[arrayOfA.length - 2].innerHTML = 'Ajouter';
                arrayOfA[arrayOfA.length - 1].innerHTML = 'Supprimer';

                break;
            default:
        }

        // make the elements of the list sortable
        $(".sortable").sortable({
            stop: function (event, ui) {
                ReorganiseList(document.getElementById($(".sortable").attr("id")));
            }
        });

        // hide the title changer field
        $("#list" + (nbOfElements + 1) + "ChangeTitle").hide();
        
        $('#addNewList').modal("close");

        SaveGrid();

        return document.getElementById("list" + (nbOfElements + 1));
    }
}

function ReorganiseGrid()
{
    if (V_Grid == null || V_Grid == undefined)
    {
        window.alert("hum... the grid doesn't exist...");
    }
    else
    {
        var gridChildrenNodes = V_Grid.childNodes;

        // Convert listsNodeList to an array
        var childrenNodes = [];
        for (var i = gridChildrenNodes.length; i--; childrenNodes.unshift(gridChildrenNodes[i]));

        var lists = [];

        for (i = 0; i < childrenNodes.length; i++)
        {
            if (childrenNodes[i].tagName == "DIV")
            {
                lists.push(childrenNodes[i]);
            }
        }

        for (i = 0; i < lists.length; i++)
        {
            lists[i].getElementsByTagName("ul")[0].id = 'list' + (i + 1);

            var listName = lists[i].getElementsByTagName("h4")[0].innerHTML;

            lists[i].getElementsByTagName("h4")[0].parentNode =
                '<h4 id="list' + (i + 1) + 'Name" onclick="EnterNewTitle(list' + (i + 1) + 'Name, list' + (i + 1) + 'ChangeTitle)">' + listName + '</h4>' +
                '<input id="list' + (i + 1) + 'ChangeTitle" type="text" onblur="ChangeTitle(list' + (i + 1) + 'Name, list' + (i + 1) + 'ChangeTitle)" />';

            var arrayOfA = lists[i].getElementsByTagName("a");
            
            arrayOfA[arrayOfA.length - 2].parentNode.id = 'list' + (i + 1) + 'AddButtonCol';
            arrayOfA[arrayOfA.length - 1].parentNode.id = 'list' + (i + 1) + 'RemoveButtonCol';

            switch (V_Language)
            {
                case "fr":
                    arrayOfA[arrayOfA.length - 2].parentNode.innerHTML =
                        '<a class="waves-effect waves-light btn green" id="list' + (i + 1) + 'AddButton" onclick="SetListToAddNewElement(list' + (i + 1) + ')">Ajouter</a>';
                    arrayOfA[arrayOfA.length - 1].parentNode.innerHTML =
                        '<a class="waves-effect waves-light btn red" id="list' + (i + 1) + 'DeleteButton" onclick="SetListToRemove(list' + (i + 1) + ')">Supprimer</a>';
                    break;
                default:
                    arrayOfA[arrayOfA.length - 2].parentNode.innerHTML =
                        '<a class="waves-effect waves-light btn green" id="list' + (i + 1) + 'AddButton" onclick="SetListToAddNewElement(list' + (i + 1) + ')">Add</a>';
                    arrayOfA[arrayOfA.length - 1].parentNode.innerHTML =
                        '<a class="waves-effect waves-light btn red" id="list' + (i + 1) + 'DeleteButton" onclick="SetListToRemove(list' + (i + 1) + ')">Delete</a>';
            }

            ReorganiseList(lists[i].getElementsByTagName("ul")[0]);
        }

        SaveGrid();
    }
}

// ************************ //
// **** List functions **** //
// ************************ //

function SetListToAddNewElement(_list)
{
    V_ListToAddNewElement = _list;

    $('#addNewElement').modal("open");
}

function SetListToRemove(_list)
{
    V_ListToRemove = _list;
    document.getElementById("removeListText").innerHTML = "Are you sure you want to remove " + _list.parentNode.getElementsByTagName("h4")[0].innerHTML + "?";

    $('#removeList').modal("open");
}

function EnterNewTitle(_NameElement, _NameInput)
{
    $("#" + _NameElement.id).hide();
    $("#" + _NameInput.id).show();

    _NameInput.value = _NameElement.innerHTML;
    _NameInput.focus();
}

function ChangeTitle(_NameElement, _NameInput)
{
    _NameElement.innerHTML = _NameInput.value;

    $("#" + _NameElement.id).show();
    $("#" + _NameInput.id).hide();

    SaveGrid();
}

function AddElement(_toAddName, _toAddEmail)
{
    if (_toAddName == "")
    {
        switch (V_Language)
        {
            case "fr":
                document.getElementById("addNewElementError").innerHTML = "Oups! Ecris un nom d'abord!";
                break;
            default:
                document.getElementById("addNewElementError").innerHTML = "Oops! Write a name first!";
        }
    }
    else if (V_ListToAddNewElement == null || V_ListToAddNewElement == undefined)
    {
        window.alert("hum... the list doesn't exist...  // AddElement");
    }
    else
    {
        if (_toAddEmail == "")
        {
            _toAddEmail = "@";
        }

        // reset the "Add" text 
        document.getElementById("addNewElementName").value = "";
        document.getElementById("addNewElementEmail").value = "";
        document.getElementById("addNewElementError").innerHTML = "";

        AddNewElement(_toAddName, _toAddEmail, V_ListToAddNewElement);

        $('#addNewElement').modal("close");
        
        V_ListToAddNewElement = null;

        SaveGrid();

        //Save each time a checkbox is checked
        $(".filled-in").on("click", function () {
            SaveGrid();
        });

        //Initialize dropdown
        $('.dropdown-button').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: false,
            hover: true, // Activate on hover
            gutter: 0, // Spacing from edge
            belowOrigin: false,
            alignment: 'right' // Displays dropdown with edge aligned to the left of button
        });
    }
}

function AddNewElement(_toAddName, _toAddEmail, _list)
{
    if (_list == null || _list == undefined)
    {
        window.alert("hum... the list doesn't exist...  // AddNewElement");
    }
    else 
    {
        // number of elements in the list
        var nbOfElements = _list.getElementsByClassName("collection-item").length;

        // add element in the list
        var newLI = document.createElement("li");
        var newBox = document.createElement("input");
        var newLabel = document.createElement("label");
        var newButton = document.createElement("a");
        var newDropdown = document.createElement("ul");
        var newHidden = document.createElement("input");

        newLI.appendChild(newBox);
        newLI.appendChild(newLabel);
        newLI.appendChild(newButton);
        newLI.appendChild(newDropdown);
        newLI.appendChild(newHidden);
        _list.appendChild(newLI);

        newLI.setAttribute("class", "collection-item ui-sortable-handle AppZbisRDV_ListsElements");
        newLI.setAttribute("id", _list.id + "_element" + (nbOfElements + 1));

        newBox.setAttribute("type", "checkbox");
        newBox.setAttribute("class", "filled-in");
        newBox.setAttribute("id", _list.id + "_check" + (nbOfElements + 1));
        newBox.setAttribute("value", _toAddName);

        newLabel.setAttribute("for", _list.id + "_check" + (nbOfElements + 1));
        newLabel.setAttribute("id", _list.id + "_label" + (nbOfElements + 1));
        newLabel.innerHTML = _toAddName;
        
        newButton.setAttribute("class", "secondary-content dropdown-button");
        newButton.setAttribute("data-activates", _list.id + "_dropdown" + (nbOfElements + 1));
        newButton.innerHTML = '<i class="material-icons">menu</i>';

        newDropdown.setAttribute("id", _list.id + "_dropdown" + (nbOfElements + 1));
        newDropdown.setAttribute("class", "dropdown-content");
        newDropdown.innerHTML =
        '<li><a>' + _toAddEmail + '</a></li>' +
        '<li><a onclick="EraseElement(' + _list.id + '_element' + (nbOfElements + 1) + ', ' + _list.id + ')"><i class="material-icons">delete</i></a></li>';

        newHidden.setAttribute("type", "hidden");
        newHidden.setAttribute("id", _list.id + "_email" + (nbOfElements + 1));
        newHidden.setAttribute("value", _toAddEmail);
        
        SaveGrid();
        
        //Save each time a checkbox is checked
        $(".filled-in").on("click", function () {
            SaveGrid();
        });

        //Initialize dropdown
        $('.dropdown-button').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: false,
            hover: true, // Activate on hover
            gutter: 0, // Spacing from edge
            belowOrigin: false,
            alignment: 'right' // Displays dropdown with edge aligned to the left of button
        });

        return document.getElementById(_list.id + '_element' + (nbOfElements + 1));
    }
}

function EraseElement(_toErase, _list)
{
    if (_toErase == null || _toErase == undefined)
    {
        window.alert("Alert! This element doesn't exist anymore!");
    }
    else if (_list == null || _list == undefined)
    {
        window.alert("hum... the list doesn't exist...  // EraseElement");
    }
    else
    {
        var elements = _list.getElementsByTagName("li");

        // We will now check in the list where '_toErase' is located		
        for (i = 0; i < elements.length; i++)
        {
            if (elements[i] == _toErase)
            {
                _list.removeChild(elements[i]);
                ReorganiseList(_list);
                break;
            }
        }
    }
}

function ReorganiseList(_list)
{
    var elementsNodeList = _list.getElementsByClassName("AppZbisRDV_ListsElements");

    document.getElementById("debug").innerHTML = "";

    // Convert elementsNodeList to an array
    var elements = [];
    for (var i = elementsNodeList.length; i--; elements.unshift(elementsNodeList[i]));

    for (i = 0; i < elements.length; i++)
    {
        elements[i].id = _list.id + "_element" + (i + 1);

        elements[i].getElementsByTagName("input")[0].setAttribute("id", _list.id + "_check" + (i + 1));

        elements[i].getElementsByTagName("label")[0].setAttribute("for", _list.id + "_check" + (i + 1));
        elements[i].getElementsByTagName("label")[0].setAttribute("id", _list.id + "_label" + (i + 1));

        elements[i].getElementsByTagName("a")[0].setAttribute("data-activates", _list.id + "_dropdown" + (i + 1));

        elements[i].getElementsByTagName("ul")[0].setAttribute("id", _list.id + "_dropdown" + (i + 1));
        elements[i].getElementsByTagName("ul")[0].innerHTML =
        '<li>' + elements[i].getElementsByTagName("ul")[0].getElementsByTagName("li")[0].innerHTML + '</li>' +
        '<li><a onclick="EraseElement(' + _list.id + '_element' + (i + 1) + ', ' + _list.id + ')"><i class="material-icons">delete</i></a></li>';

        elements[i].getElementsByTagName("input")[1].setAttribute("id", _list.id + "_email" + (i + 1));
    }

    SaveGrid();
}

function RemoveList()
{
    if (V_ListToRemove == null || V_ListToRemove == undefined)
    {
        window.alert("Alert! This list doesn't exist anymore!");
    }
    else if (V_Grid == null || V_Grid == undefined)
    {
        window.alert("hum... the grid doesn't exist...");
    }
    else
    {
        var lists = V_Grid.getElementsByTagName("ul");

        // We will now check in the grid where '_list' is located
        var i;
        for (i = 0; i < lists.length; i++)
        {
            if (lists[i] == V_ListToRemove)
            {
                lists[i].parentNode.parentNode.parentNode.removeChild(lists[i].parentNode.parentNode);
                break;
            }
        }

        document.getElementById("removeListText").innerHTML = "";

        V_ListToRemove = null;

        $('#removeList').modal("close");

        ReorganiseGrid();
    }
}

function CheckElement(_element, _value)
{
    $(_element.getElementsByTagName("input")[0]).attr("checked", _value);
}

function DisplayElementToInsert(_elementName, _elementEmail)
{
    document.getElementById("nameToInsert").innerHTML = _elementName;
    document.getElementById("emailToInsert").innerHTML = _elementEmail;
}

// **************************** //
// **** Language functions **** //
// **************************** //

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

function ChangeToBaguette()
{
    // Modal //
    //Add list modal
    document.getElementById("addNewListText").placeholder = "Ajouter une nouvelle liste...";
    document.getElementById("createNewList").innerHTML = "Créer";

    //Add element modal
    document.getElementById("addNewElement").getElementsByTagName("h4")[0].innerHTML = "Ajouter un nouvel élément...";
    document.getElementById("addNewElementName").placeholder = "Nom...";
    document.getElementById("addNewElementEmail").placeholder = "Adresse mail...";
    document.getElementById("createNewElement").innerHTML = "Créer";

    //Remove list modal
    document.getElementById("RemoveListYesButton").innerHTML = "Oui";
    document.getElementById("RemoveListNoButton").innerHTML = "Non";

    //Clear grid modal
    document.getElementById("removeAllListText").innerHTML = "Etes-vous sur de vouloir effacer toutes les listes?";
    document.getElementById("removeAllListYes").innerHTML = "Oui";
    document.getElementById("removeAllListNo").innerHTML = "Non";

    //Import modal
    document.getElementById("importFileSpan").innerHTML = "Fichier";
    document.getElementById("fileToImportText").placeholder = "Séléctionner un fichier .csv d'où importer des listes";
    document.getElementById("importFileButton").innerHTML = "Importer";

    //Export modal
    document.getElementById("fileToExportName").placeholder = "Entrer un nom de fichier...";
    document.getElementById("exportFileButton").innerHTML = "Exporter";

    // List //
    var lists = document.getElementsByClassName("AppZbisRDV_List");
    var i;
    for (i = 0; i < lists.length; i++)
    {
        var arrayOfA = lists[i].getElementsByTagName("a");

        arrayOfA[arrayOfA.length - 2].innerHTML = 'Ajouter';
        arrayOfA[arrayOfA.length - 1].innerHTML = 'Supprimer';
    }
}

function ChangeToRosbeef()
{
    // List //
    var lists = document.getElementsByClassName("AppZbisRDV_List");
    var i;
    for (i = 0; i < lists.length; i++)
    {
        var arrayOfA = lists[i].getElementsByTagName("a");

        arrayOfA[arrayOfA.length - 2].innerHTML = 'Add';
        arrayOfA[arrayOfA.length - 1].innerHTML = 'Delete';
    }
}

// *************************** //
// **** Utility functions **** //
// *************************** //

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