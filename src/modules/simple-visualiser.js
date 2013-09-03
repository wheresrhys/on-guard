define(['utils', 'domReady!'], function (utils) {
    var arrowCodes = { 
        West: 8592,
        North: 8593,
        East: 8594,
        South: 8595
    },
    defaultCellHtml = '&nbsp;&nbsp;&nbsp;&nbsp;';

    var Visualiser = function (driller, domNodeId) {
        this.conf = driller.conf;
        this.driller = driller;
        this.domNode = document.getElementById(domNodeId);
        this.init();
    };

    Visualiser.prototype = {
        init: function () {

         
            this.driller.on('initialised', function () {
                this.prime();
            }, this);
            // this.driller.on('stopped', this.undrawGrid, this);
            this.driller.on('step', function (state) {
                if(this.conf.areaWidth > 0 && this.conf.areaLength > 0) {
                    this.setPosition(state.coords, state.direction, state.frontFoot);
                    this.updateCaption(utils.camelToSpaced(state.lastStep));
                }
            }, this);

            this.prime();


        },
        prime: function () {
            if(this.conf.areaWidth > 0 && this.conf.areaLength > 0) {
                this.undrawGrid();
                this.drawCaption();
                this.drawGrid();
                this.setPosition(this.driller.coords, this.driller.longDirection, 'center');
            }
        },
        drawCaption: function () {
            this.caption = document.createElement('h2');
            this.domNode.appendChild(this.caption);
        },
        updateCaption: function (text) {
            this.caption.innerHTML = text;
        },
        drawGrid: function () {
            var table = document.createElement('table'),
                row = document.createElement('tr'),
                cell = document.createElement('td'),
                width = this.conf.areaWidth,
                height = this.conf.areaLength,
                i,
                newRow,
                newCell;

            while(height--) {
                newRow = row.cloneNode();
                table.appendChild(newRow);
                for(i=0;i<width;i++) {
                    newCell = cell.cloneNode();
                    newCell.innerHTML = defaultCellHtml;
                    newRow.appendChild(newCell);
                }
            }
            this.domNode.appendChild(table);
            this.grid = table;
            table.className = 'floorspace';
        },
        undrawGrid: function () {
            this.domNode.innerHTML = '';
        },
        setPosition: function(coords, direction, frontFoot) {
            
            if (this.position) {
                this.unshowPosition();
            }
            var cell = this.grid.getElementsByTagName('tr')[(this.conf.areaLength - 1) - coords[0]]
                    .getElementsByTagName('td')[coords[1]];

            cell.className = 'current ' + direction.toLowerCase() + ' ' + (frontFoot && frontFoot.toLowerCase());
            this.position = coords;
            // up arrow
            cell.innerHTML = '&#8593;';
        },
        unshowPosition: function () {
            var cell = this.grid.getElementsByTagName('tr')[(this.conf.areaLength - 1) - this.position[0]]
                    .getElementsByTagName('td')[this.position[1]];
            cell.className = '';
            cell.innerHTML = defaultCellHtml;
            
        }
    };

    return Visualiser;
});