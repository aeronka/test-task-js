import Mustache from './node_modules/mustache/mustache.min.js';
import templ from './dist/template.js';

export default class SortableTable {    
    constructor(options) {
        this.tbody = options.tableBodyElem;
        this.forSmallData = options.forSmallData;
        this.forBigData = options.forBigData;

        this.header = document.querySelector('.content-header');
        //выбор загрузки большого или маленького кол-ва данных
        this.header.addEventListener('change', event => {
            //спрятать и удалить таблицу,если она уже была показана
            this.hideElements();
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

    hideElements() {
        if(!this._flagShow) return;
        this._flagShow = false;
        document.querySelector('.contacts').classList.remove('visible');
        document.querySelector('.page-navigation').classList.remove('visible');
        document.querySelector('.detail-info').classList.remove('visible');
        this.removeTable();
    }

    query(url) {
        fetch(url)
            .then(function(response) {
                return response.json();
            })
            .then(function(response) {
                //добавить пришедшие данные в таблицу и показать её
                this.addTable(response);
            }.bind(this))
            .catch(function(error) {
                throw error;
            });
    }   

    addTable(data) {
        let output = '';

        for(let i = 0; i < data.length; i++) {
            output += Mustache.render(templ.contacts, data[i]);
        }
        this.tbody.insertAdjacentHTML('beforeEnd', output);
        this.showElements();
    }

    removeTable() {
        let table = document.querySelector('.contacts');
        table.removeChild(this.tbody);
        this.tbody = document.createElement('tbody');
        table.appendChild(this.tbody);
    }

}