$("#createNewList").on("click", function () {
    CreateList($("#addNewListText").val());
    return false;
});

$("#createNewElement").on("click", function () {
    if ($("#addNewElementCreateNewTab").hasClass("active")) {
        AddElement($("#addNewElementName").val(), $("#addNewElementEmail").val());
    }
    else if ($("#addNewElementInsertTab").hasClass("active")) {
        AddElement($("#nameToInsert").html(), $("#emailToInsert").html());
    }
    return false;
});

$("#RemoveListYesButton").on("click", function () {
    RemoveList();
    return false;
});

// **** Modals **** //
//Open modal when FAB add is click
$("#addNewListFab").on("click", function () {
    $('#addNewListModal').modal("open");
    return false;
});

$("#clearAllListsFab").on("click", function () {
    $('#removeAllListModal').modal("open");
    return false;
});

$("#removeAllListYes").on("click", function () {
    $('#removeAllListModal').modal("close");
    Clear();
    return false;
});

$("#importFab").on("click", function () {
    $('#importFileModal').modal("open");
    return false;
});

$("#exportFab").on("click", function () {
    $('#exportFileModal').modal("open");
    return false;
});

//import button
$("#importFileButton").on("click", function () {
    $('#importFileModal').modal("close");
    if (V_OnMobile) {
        window.resolveLocalFileSystemURL($("#fileToImportText").val(), function (fileEntry) {
            fileEntry.file(function (file) {
                Import(file);
            });
        });
    }
    else {
        Import($('#fileToImport')[0].files[0]);
    }
    return false;
});

$("#importFileBrowseButton").on("click", function () {
    if (V_OnMobile) {
        fileChooser.open(function (uri) {
            window.FilePath.resolveNativePath(uri, function (localFileUri) {
                $("#fileToImportText").val(localFileUri);
            });
        });
        return false;
    }
});

//export button
$("#exportFileButton").on("click", function () {
    $('#exportFileModal').modal("close");
    Export($("#fileToExportName").val());
    return false;
});

//imported continue button
$("#exportedFileContinue").on("click", function () {
    $('#exportedFileModal').modal("close");
    return false;
});