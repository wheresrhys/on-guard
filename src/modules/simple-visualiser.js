define(['domReady!'], function () {

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
                    this.drawGrid();
                    this.setPosition(this.driller.coords);
                }
            }, this);
            this.driller.on('stopped', this.undrawGrid, this);
            this.driller.on('step', function (state) {
                if(this.conf.areaWidth > 0 && this.conf.areaLength > 0) {
                    this.setPosition(state.coords.split(':'));
                }
            }, this);
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
                    newCell.innerHTML = i;
                    newRow.appendChild(newCell);
                }
            }
            this.domNode.appendChild(table);
            this.grid = table;
        },
        undrawGrid: function () {
            this.domNode.innerHTML = '';
        },
        setPosition: function(coords) {
            
            if (this.position) {
                this.unshowPosition();
            }
            var cell = this.grid.getElementsByTagName('tr')[coords[0]]
                    .getElementsByTagName('td')[coords[1]];

            cell.style.backgroundColor = 'red';
            this.position = coords;
        },
        unshowPosition: function () {
            var cell = this.grid.getElementsByTagName('tr')[this.position[0]]
                    .getElementsByTagName('td')[this.position[1]];
            cell.style.backgroundColor = 'white';
        }
    };

    return Visualiser;
});