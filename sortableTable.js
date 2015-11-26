import Mustache from './node_modules/mustache/mustache.min.js';
import templ from './dist/template.js';

export default class SortableTable {    
    constructor(options) {
        this.tbody = options.tableBodyElem;
        this.forSmallData = options.forSmallData;
        this.forBigData = options.forBigData;

        this.header = document.querySelector('.content-header');
        this.header.addEventListener('change', event => {
            let url = event.target.matches('.small-data') ? this.forSmallData : this.forBigData;
            this.query(url);
        });
    }

    showElements() {
        if(this._flagShow) return;
        this._flagShow = true;
        document.querySelector('.contacts').classList.add('visible');
        document.querySelector('.page-navigation').classList.add('visible');
        document.querySelector('.detail-info').classList.add('visible');
    }

    query(url) {
        fetch(url)
            .then(function(response) {
                return response.json();
            })
            .then(function(response) {
                this.load(response);
            }.bind(this))
            .catch(function(error) {
                throw error;
            });
    }   

    load(data) {
        let output = '';

        for(let i = 0; i < data.length; i++) {
            output += Mustache.render(templ.contacts, data[i]);
        }
        this.tbody.insertAdjacentHTML('beforeEnd', output);
        this.showElements();
    }

}