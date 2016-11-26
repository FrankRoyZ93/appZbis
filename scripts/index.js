var storage;

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

// ************************ //
// **** Grid functions **** //
// ************************ //

function ValidateListCreation(_name, _grid, _event)
{
    // If "Enter" was pressed, then create the list
    if(_event.keyCode == 13 && _name != "")
    {
        // reset the "Add" text 
        document.getElementById("addNewListText").value = "";
        
        CreateList(_name, _grid);
    }
}

function CreateList(_name, _grid)
{    
    if (_name == "")
    {
        window.alert("Oops! Write something first!");
    }
    else if (_grid == null || _grid == undefined)
    {
        window.alert("hum... the grid doesn't exist...");
    }
    else
    {
        // number of lists in the grid
        var nbOfElements = _grid.getElementsByTagName("ul").length;

        // add list in the grid
        _grid.innerHTML +=
		'<div class="col l4 m6 s12">' +
		'	<div class="card-panel">' +
		'		<div class="row">' +
		'			<div class="col s11">' +
		'				<h4>' + _name + '</h4>' +
		'			</div>' +
		'			<div class="col s1">' +
		'				<a class="btn-floating red"><i class="material-icons" onclick="RemoveList(list' + (nbOfElements + 1) + ', ' + _grid.id + ')">delete</i></a>' +
		'			</div>' +
		'		</div>' +
		'		<ul class="collection ui-sortable sortable" id="list' + (nbOfElements + 1) + '">' +
		'		</ul>' +
		'		<!-- Add area -->' +
		'		<div class="row">' +
		'			<div class="col s11">' +
		'				<input type="text" id="list' + (nbOfElements + 1) + '_addText" maxlength="25" placeholder="Add new element..." />' +
		'			</div>' +
		'			<div class="col s1">' +
		'				<a class="btn-floating"><i class="material-icons" onclick="AddElement(list' + (nbOfElements + 1) + '_addText.value, list' + (nbOfElements + 1) + ', list' + (nbOfElements + 1) + '_addText)">add</i></a>' +
		'			</div>' +
		'		</div>' +
		'	</div>' +
		'</div>';

        $(".sortable").sortable({
            stop: function (event, ui) {
                ReorganiseList(document.getElementById($(".sortable").attr("id")));
            }
        });

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
            lists[i].getElementsByTagName("a")[0].innerHTML = '<i class="material-icons" onclick="RemoveList(list' + (i + 1) + ', ' + _grid.id + ')">delete</i>';
            lists[i].getElementsByTagName("ul")[0].id = 'list' + (i + 1);
            lists[i].getElementsByTagName("input")[lists[i].getElementsByTagName("input").length - 1].id = 'list' + (i + 1) + '_addText';
            lists[i].getElementsByTagName("a")[lists[i].getElementsByTagName("a").length - 1].innerHTML =
				'<i class="material-icons" onclick="AddElement(list' + (i + 1) + '_addText.value, list' + (i + 1) + ', list' + (i + 1) + '_addText)">add</i>';

            ReorganiseList(lists[i].getElementsByTagName("ul")[0]);
        }

        SaveGrid();
    }
}

// ************************ //
// **** List functions **** //
// ************************ //

function AddElement(_toAdd, _list, _textInput)
{
    if (_toAdd == "")
    {
        window.alert("Oops! Write something first!");
    }
    else if (_list == null || _list == undefined)
    {
        window.alert("hum... the list doesn't exist...");
    }
    else
    {
        // reset the "Add" text 
        _textInput.value = "";

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

function RemoveList(_list, _grid)
{
    if (_list == null || _list == undefined)
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
            if (lists[i] == _list)
            {
                lists[i].parentNode.parentNode.parentNode.removeChild(lists[i].parentNode.parentNode);
                break;
            }
        }

        ReorganiseGrid(_grid);
    }
}