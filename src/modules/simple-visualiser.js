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
            this.driller.on('started', function () {
                if(this.conf.areaWidth > 0 && this.conf.areaLength > 0) {
                    this.drawCaption();
                    this.drawGrid();
                    this.setPosition(this.driller.coords, this.driller.direction, 'center');

                }
            }, this);
            this.driller.on('stopped', this.undrawGrid, this);
            this.driller.on('step', function (state) {
                if(this.conf.areaWidth > 0 && this.conf.areaLength > 0) {
                    this.setPosition(state.coords, state.direction, state.frontFoot);
                    this.updateCaption(utils.camelToSpaced(state.lastStep));
                }
            }, this);
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
            table.style.backgroundColor = 'yellow';
        },
        undrawGrid: function () {
            this.domNode.innerHTML = '';
            this.driller.off(undefined, undefined, this);
        },
        setPosition: function(coords, direction, frontFoot) {
            
            if (this.position) {
                this.unshowPosition();
            }
            var cell = this.grid.getElementsByTagName('tr')[(this.conf.areaLength - 1) - coords[0]]
                    .getElementsByTagName('td')[coords[1]];

            cell.style.backgroundColor = 'red';
            this.position = coords;
            cell.innerHTML = '&#' + arrowCodes[direction] + ';';
            this.alignArrow(cell, frontFoot, direction);
        },
        unshowPosition: function () {
            var cell = this.grid.getElementsByTagName('tr')[(this.conf.areaLength - 1) - this.position[0]]
                    .getElementsByTagName('td')[this.position[1]];
            cell.style.backgroundColor = '';
            cell.innerHTML = defaultCellHtml;
            cell.style.textAlign = 'center';
        },
        alignArrow: function (cell, frontFoot, direction) {
            switch (direction) {
            case 'North' :
                cell.style.textAlign = frontFoot;
                cell.style.verticalAlign = '';
                cell.style.position = 'static';
                break;
            case 'South':
                cell.style.textAlign = frontFoot === 'Left' ? 'Right' : 'Left';
                cell.style.verticalAlign = '';
                cell.style.position = 'static';
                break;
            case 'East':
                cell.style.textAlign = '';
                cell.style.verticalAlign = frontFoot === 'Left' ? 'super' : 'sub';
                break;
            case 'West':
                cell.style.textAlign = '';
                cell.style.verticalAlign = frontFoot === 'Right' ? 'super' : 'sub';
                break;
            }
                
            
        }
    };

    return Visualiser;
});