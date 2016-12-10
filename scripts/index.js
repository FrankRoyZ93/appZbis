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

    if(grid != "" || grid != undefined)
    {
        V_Grid.innerHTML = grid;
    }

    $(".sortable").sortable({
        stop: function (event, ui) {
            ReorganiseList(document.getElementById($(".sortable").attr("id")));
        }
    });

    CheckLanguage();
}

function SaveGrid()
{
    V_Grid = document.getElementById("listsGrid");
    V_Storage.setItem("Grid", V_Grid.innerHTML);
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
        
        for (i = 0; i < listsToLoad.length; i++)
        {
            var list = listsToLoad[i].split(";");

            var newList = CreateList(list[0]);

            for (j = 1; j < list.length; j++)
            {
                AddNewElement(list[j], newList);
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
    var resultCSV = '';

    var lists = V_Grid.getElementsByTagName("ul");

    for (i = 0; i < lists.length; i++)
    {
        resultCSV += lists[i].parentNode.getElementsByTagName("h4")[0].innerHTML;

        var list = lists[i].getElementsByTagName("li");

        if (list.length > 0)
        {
            resultCSV += ';';
        }

        for (j = 0; j < list.length; j++)
        {
            resultCSV += list[j].getElementsByTagName("label")[0].innerHTML;
            if(j + 1 < list.length)
            {
                resultCSV += ';';
            }
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

function AddElement(_toAdd, _textInput)
{
    if (_toAdd == "")
    {
        switch (V_Language)
        {
            case "fr":
                document.getElementById("addNewElementError").innerHTML = "Oups! Ecris quelque chose d'abord!";
                break;
            default:
                document.getElementById("addNewElementError").innerHTML = "Oops! Write something first!";
        }
    }
    else if (V_ListToAddNewElement == null || V_ListToAddNewElement == undefined)
    {
        window.alert("hum... the list doesn't exist...");
    }
    else
    {
        // reset the "Add" text 
        _textInput.value = "";
        document.getElementById("addNewElementError").innerHTML = "";

        // number of elements in the list
        var nbOfElements = V_ListToAddNewElement.getElementsByTagName("li").length;

        // add element in the list
        V_ListToAddNewElement.innerHTML +=
        '<li class="collection-item ui-sortable-handle" id="' + V_ListToAddNewElement.id + '_element' + (nbOfElements + 1) + '" >' +
        '   <input type="checkbox" class="filled-in" id="' + V_ListToAddNewElement.id + '_check' + (nbOfElements + 1) + '" value="' + _toAdd + '">' +
        '   <label for="' + V_ListToAddNewElement.id + '_check' + (nbOfElements + 1) + '">' + _toAdd + '</label> ' +
        '   <a href="#!" class="secondary-content" onclick="EraseElement(' + V_ListToAddNewElement.id + '_element' + (nbOfElements + 1) + ', ' + V_ListToAddNewElement.id + ')"><i class="material-icons">delete</i></a>' +
        '</li>';

        $('#addNewElement').modal("close");

        V_ListToAddNewElement = null;

        SaveGrid();
    }
}

function AddNewElement(_toAdd, _list)
{
    if (_list == null || _list == undefined)
    {
        window.alert("hum... the list doesn't exist...");
    }
    else 
    {
        // number of elements in the list
        var nbOfElements = _list.getElementsByTagName("li").length;

        // add element in the list
        _list.innerHTML +=
        '<li class="collection-item ui-sortable-handle" id="' + _list.id + '_element' + (nbOfElements + 1) + '" >' +
        '   <input type="checkbox" class="filled-in" id="' + _list.id + '_check' + (nbOfElements + 1) + '" value="' + _toAdd + '">' +
        '   <label for="' + _list.id + '_check' + (nbOfElements + 1) + '">' + _toAdd + '</label> ' +
        '   <a href="#!" class="secondary-content" onclick="EraseElement(' + _list.id + '_element' + (nbOfElements + 1) + ', ' + _list.id + ')"><i class="material-icons">delete</i></a>' +
        '</li>';

        SaveGrid();
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
        window.alert("hum... the list doesn't exist...");
    }
    else
    {
        var elements = _list.getElementsByTagName("li");

        // We will now check in the list where '_toErase' is located		
        for (i = 0; i < elements.length; i++)
        {
            if (elements[i] == _toErase)
            {
                V_Storage.removeItem(elements[i].id);
                _list.removeChild(elements[i]);
                ReorganiseList(_list);
                break;
            }
        }
    }
}

function ReorganiseList(_list)
{
    var elementsNodeList = _list.getElementsByTagName("li");

    document.getElementById("debug").innerHTML = "";

    // Convert elementsNodeList to an array
    var elements = [];
    for (var i = elementsNodeList.length; i--; elements.unshift(elementsNodeList[i]));

    for (i = 0; i < elements.length; i++)
    {
        elements[i].id = _list.id + "_element" + (i + 1);

        var isChecked = elements[i].getElementsByTagName("input")[0].checked;

        elements[i].innerHTML =
        '   <input type="checkbox" class="filled-in" id="' + _list.id + '_check' + (i + 1) + '" value="' + elements[i].getElementsByTagName("input")[0].value + '">' +
        '   <label for="' + _list.id + '_check' + (i + 1) + '">' + elements[i].getElementsByTagName("input")[0].value + '</label> ' +
        '   <a href="#!" class="secondary-content" onclick="EraseElement(' + _list.id + '_element' + (i + 1) + ', ' + _list.id + ')"><i class="material-icons">delete</i></a>';

        elements[i].getElementsByTagName("input")[0].checked = isChecked;
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
    document.getElementById("addNewElementText").placeholder = "Ajouter un nouvel élément à cette liste...";
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

    for (i = 0; i < lists.length; i++) {
        var arrayOfA = lists[i].getElementsByTagName("a");

        arrayOfA[arrayOfA.length - 2].innerHTML = 'Add';
        arrayOfA[arrayOfA.length - 1].innerHTML = 'Delete';
    }
}