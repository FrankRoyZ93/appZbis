var storage;

var listToAddNewElement;

var listToRemove;

// ***************************** //
// **** Load/Save functions **** //
// ***************************** //

function Load()
{
    storage = window.localStorage;

    var grid = storage.getItem("Grid");
    if(grid != "" || grid != undefined)
    {
        document.getElementById("listsGrid").innerHTML = grid;
    }

    $(".sortable").sortable({
        stop: function (event, ui) {
            ReorganiseList(document.getElementById($(".sortable").attr("id")));
        }
    });
}

function SaveGrid()
{
    storage.setItem("Grid", document.getElementById("listsGrid").innerHTML);
}

function Clear()
{
    storage.clear();
    document.getElementById("listsGrid").innerHTML = "";
}

// ********************************* //
// **** Import/Export functions **** //
// ********************************* //

function Import(_file)
{
    var reader = new FileReader();
    
    reader.onloadend = function (e) {
        var listsToLoad = reader.result;

        var obj = JSON.parse(listsToLoad);

        var grid = document.getElementById("listsGrid");

        for (i = 0; i < obj.lists.length; i++)
        {
            var newList = CreateList(obj.lists[i].name, grid);

            for (j = 0; j < obj.lists[i].list.length; j++)
            {
                AddNewElement(obj.lists[i].list[j].name, newList);
            }
        }
    }

    reader.readAsText(_file);
}

// ************************ //
// **** Grid functions **** //
// ************************ //

function CreateList(_name, _grid)
{    
    if (_name == "")
    {
        document.getElementById("addNewListError").innerHTML = "Oops! Write something first!";
    }
    else if (_grid == null || _grid == undefined)
    {
        window.alert("hum... the grid doesn't exist...");
    }
    else
    {
        // reset the "Add" text 
        document.getElementById("addNewListText").value = "";
        document.getElementById("addNewListError").innerHTML = "";

        // number of lists in the grid
        var nbOfElements = _grid.getElementsByTagName("ul").length;

        // add list in the grid
        _grid.innerHTML +=
        '<div class="col l4 m6 s12">' +
		'	<div class="card-panel">' +
		'		<div class="row">' +
		'			<div class="col s12">' +
		'		        <h4>' + _name + '</h4>' +
		'		    </div>' +
		'		</div>' +
		'		<ul class="collection ui-sortable sortable" id="list' + (nbOfElements + 1) + '">' +
		'		</ul>' +
		'		<!-- Add area -->' +
		'		<div class="row">' +
		'			<div class="col s6" id="list' + (nbOfElements + 1) + 'AddButtonCol">' +
		'				<a class="waves-effect waves-light btn green" id="list' + (nbOfElements + 1) + 'AddButton" onclick="SetListToAddNewElement(list' + (nbOfElements + 1) + ')">Add</a>' +
		'			</div>' +
		'			<div class="col s6" id="list' + (nbOfElements + 1) + 'DeleteButtonCol">' +
		'				<a class="waves-effect waves-light btn red" id="list' + (nbOfElements + 1) + 'DeleteButton" onclick="SetListToRemove(list' + (nbOfElements + 1) + ')">Delete</a>' +
		'			</div>' +
		'		</div>' +
		'	</div>' +
		'</div>';

        $(".sortable").sortable({
            stop: function (event, ui) {
                ReorganiseList(document.getElementById($(".sortable").attr("id")));
            }
        });

        $('#addNewList').modal("close");

        SaveGrid();
        
        return document.getElementById("list" + (nbOfElements + 1));
    }
}

function ReorganiseGrid(_grid)
{
    if (_grid == null || _grid == undefined)
    {
        window.alert("hum... the grid doesn't exist...");
    }
    else
    {
        var gridChildrenNodes = _grid.childNodes;

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

            var arrayOfA = lists[i].getElementsByTagName("a");
            
            arrayOfA[arrayOfA.length - 2].parentNode.id = 'list' + (i + 1) + 'AddButtonCol';
            arrayOfA[arrayOfA.length - 1].parentNode.id = 'list' + (i + 1) + 'RemoveButtonCol';

            arrayOfA[arrayOfA.length - 2].parentNode.innerHTML =
                '<a class="waves-effect waves-light btn green" id="list' + (i + 1) + 'AddButton" onclick="SetListToAddNewElement(list' + (i + 1) + ')">Add</a>';
            arrayOfA[arrayOfA.length - 1].parentNode.innerHTML =
                '<a class="waves-effect waves-light btn red" id="list' + (i + 1) + 'DeleteButton" onclick="SetListToRemove(list' + (i + 1) + ')">Delete</a>';

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
    listToAddNewElement = _list;

    $('#addNewElement').modal("open");
}

function SetListToRemove(_list)
{
    listToRemove = _list;
    document.getElementById("removeListText").innerHTML = "Are you sure you want to remove " + _list.parentNode.getElementsByTagName("h4")[0].innerHTML + "?";

    $('#removeList').modal("open");
}

function AddElement(_toAdd, _textInput)
{
    if (_toAdd == "")
    {
        document.getElementById("addNewElementError").innerHTML = "Oops! Write something first!";
    }
    else if (listToAddNewElement == null || listToAddNewElement == undefined)
    {
        window.alert("hum... the list doesn't exist...");
    }
    else
    {
        // reset the "Add" text 
        _textInput.value = "";
        document.getElementById("addNewElementError").innerHTML = "";

        // number of elements in the list
        var nbOfElements = listToAddNewElement.getElementsByTagName("li").length;

        // add element in the list
        listToAddNewElement.innerHTML +=
		'<li class="collection-item ui-sortable-handle" id="' + listToAddNewElement.id + '_element' + (nbOfElements + 1) + '" >' +
		'	<input type="checkbox" class="filled-in" id="' + listToAddNewElement.id + '_check' + (nbOfElements + 1) + '" value="' + _toAdd + '">' +
		'	<label for="' + listToAddNewElement.id + '_check' + (nbOfElements + 1) + '">' + _toAdd + '</label> ' +
		'	<a href="#!" class="secondary-content" onclick="EraseElement(' + listToAddNewElement.id + '_element' + (nbOfElements + 1) + ', ' + listToAddNewElement.id + ')"><i class="material-icons">delete</i></a>' +
		'</li>';

        $('#addNewElement').modal("close");
        
        listToAddNewElement = null;

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
		'	<input type="checkbox" class="filled-in" id="' + _list.id + '_check' + (nbOfElements + 1) + '" value="' + _toAdd + '">' +
		'	<label for="' + _list.id + '_check' + (nbOfElements + 1) + '">' + _toAdd + '</label> ' +
		'	<a href="#!" class="secondary-content" onclick="EraseElement(' + _list.id + '_element' + (nbOfElements + 1) + ', ' + _list.id + ')"><i class="material-icons">delete</i></a>' +
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
                storage.removeItem(elements[i].id);
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

    // Convert elementsNodeList to an array
    var elements = [];
    for (var i = elementsNodeList.length; i--; elements.unshift(elementsNodeList[i]));

    for (i = 0; i < elements.length; i++)
    {
        elements[i].id = _list.id + "_element" + (i + 1);
        elements[i].innerHTML =
		'	<input type="checkbox" class="filled-in" id="' + _list.id + '_check' + (i + 1) + '" value="' + elements[i].getElementsByTagName("input")[0].value + '">' +
		'	<label for="' + _list.id + '_check' + (i + 1) + '">' + elements[i].getElementsByTagName("input")[0].value + '</label> ' +
		'	<a href="#!" class="secondary-content" onclick="EraseElement(' + _list.id + '_element' + (i + 1) + ', ' + _list.id + ')"><i class="material-icons">delete</i></a>';
    }

    SaveGrid();
}

function RemoveList(_grid)
{
    if (listToRemove == null || listToRemove == undefined)
    {
        window.alert("Alert! This list doesn't exist anymore!");
    }
    else if (_grid == null || _grid == undefined)
    {
        window.alert("hum... the grid doesn't exist...");
    }
    else
    {
        var lists = _grid.getElementsByTagName("ul");

        // We will now check in the grid where '_list' is located		
        for (i = 0; i < lists.length; i++)
        {
            if (lists[i] == listToRemove)
            {
                lists[i].parentNode.parentNode.parentNode.removeChild(lists[i].parentNode.parentNode);
                break;
            }
        }

        document.getElementById("removeListText").innerHTML = "";

        listToRemove = null;

        $('#removeList').modal("close");

        ReorganiseGrid(_grid);
    }
}