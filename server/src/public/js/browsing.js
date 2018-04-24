(function($){
    var extensionsMap = {
        ".zip" : "fa-file-archive-o",         
        ".gz" : "fa-file-archive-o",         
        ".bz2" : "fa-file-archive-o",         
        ".xz" : "fa-file-archive-o",         
        ".rar" : "fa-file-archive-o",         
        ".tar" : "fa-file-archive-o",         
        ".tgz" : "fa-file-archive-o",         
        ".tbz2" : "fa-file-archive-o",         
        ".z" : "fa-file-archive-o",         
        ".7z" : "fa-file-archive-o",         
        ".mp3" : "fa-file-audio-o",         
        ".cs" : "fa-file-code-o",         
        ".c++" : "fa-file-code-o",         
        ".cpp" : "fa-file-code-o",         
        ".js" : "fa-file-code-o",         
        ".xls" : "fa-file-excel-o",         
        ".xlsx" : "fa-file-excel-o",         
        ".png" : "fa-file-image-o",         
        ".jpg" : "fa-file-image-o",         
        ".jpeg" : "fa-file-image-o",         
        ".gif" : "fa-file-image-o",         
        ".mpeg" : "fa-file-movie-o",         
        ".pdf" : "fa-file-pdf-o",         
        ".ppt" : "fa-file-powerpoint-o",         
        ".pptx" : "fa-file-powerpoint-o",         
        ".txt" : "fa-file-text-o",         
        ".log" : "fa-file-text-o",         
        ".doc" : "fa-file-word-o",         
        ".docx" : "fa-file-word-o",         
    };

    function getFileIcon(ext) {
        return ( ext && extensionsMap[ext.toLowerCase()]) || 'fa-file-o';
    }

    var currentPath = null;
    var options = {
        "bProcessing": true,
        "bServerSide": false,
        "bPaginate": false,
        "bAutoWidth": false,
        "bFilter": false,
        "fnCreatedRow" :  function( nRow, aData, iDataIndex ) {
        if (!aData.IsDirectory) return;
        var path = aData.Path;
        // TODO: bind column
        $(nRow).bind("click", function(e){
            $.get('/admin/files?path='+ path).then(function(data){
                let cond1 = false;
                let cond2 = false;
                for(let i=0; i < data.length; i++)
                {
                    if(data[i].Name === 'log.txt') cond1 = true;
                    if(data[i].Name === 'personal.json') cond2 = true;
                }
                // console.log('cond1 '+ cond1 + ' cond2 '+ cond2);
                if(cond1 && cond2) { $('.verify').show(); }
                else{ $('.verify').removeAttr("style").hide(); }
                table.fnClearTable();
                table.fnAddData(data);
                currentPath = path;
            });
            e.preventDefault();
        });
        }, 
        "aoColumns": [
        { "sTitle": "Filename", "mData": null, "bSortable": false, "sClass": "head0",
            "render": function (data, type, row, meta) {
                
                if (data.IsDirectory) {
                    return "<a href='#' target='_blank'><i class='fa fa-folder'></i>&nbsp;" + data.Name +"</a>";
                } else {
                    return "<a href='/" + data.Path + "' target='_blank'><i class='fa " + getFileIcon(data.Ext) + "'></i>&nbsp;" + data.Name +"</a>";
                }
            }
        },
        { "sTitle": "Last modified", "mData": null, "bSortable": false, "sClass": "head0",
            "render": function (data, type, row, meta) {
                return data.mtime;
            }
        },
        { "sTitle": "Created at", "mData": null, "bSortable": false, "sClass": "head0",
            "render": function (data, type, row, meta) {
                return data.birthtime;
            }
        },
        { "sTitle": "Operations", "mData": null, "bSortable": false, "sClass": "head0",
            "render": function (data, type, row, meta) {
                if(!data.IsDirectory)
                {
                    return `
                    <div class="btn-group" role="group">
                        <button type="button" class="btn  btn-sm btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu">
                        <li><a href="/admin/download/`+ data.Path.replace (/\//g, "-") +`">Download</a></li>
                        <li><a href="#">Delete</a></li>
                        </ul>
                    </div>`;
                }
                else
                {
                    return "...";
                }
            }
        },
        ],
    };

    var table = $(".linksholder").dataTable(options);

    $.get('/admin/files').then(function(data){
        table.fnClearTable();
        table.fnAddData(data);
    });

    $(".up").bind("click", function(e){
        if (!currentPath) return;
        var idx = currentPath.lastIndexOf("/");
        var path =currentPath.substr(0, idx);
        $.get('/admin/files?path='+ path).then(function(data){
            let cond1 = false;
            let cond2 = false;
            for(let i=0; i < data.length; i++)
            {
                if(data[i].Name === 'log.txt') cond1 = true;
                if(data[i].Name === 'personal.json') cond2 = true;
            }
            // console.log('cond1 '+ cond1 + ' cond2 '+ cond2);
            if(cond1 && cond2) { $('.verify').show(); }
            else{ $('.verify').removeAttr("style").hide(); }
            table.fnClearTable();
            table.fnAddData(data);
            currentPath = path;
        });
    });

    $(".verify").bind("click", function(e){
        $.get('/admin/verify').then(function(data){
            console.log(data);
        })
    });

})(jQuery);

