import Mustache from './node_modules/mustache/mustache.min.js';
import templ from './dist/template.js';

export default class SortableTable {    
    constructor(options) {
        this.tbody = options.tableBodyElem;
        this.forSmallData = options.forSmallData;
        this.forBigData = options.forBigData;
        this.rowsPerPage = options.rowsPerPage;

        this.header = document.querySelector('.content-header');
        this.pageNav = document.querySelector('.page-navigation');
        this.pageNumberElem = this.pageNav.querySelector('.page-number');

        //выбор загрузки большого или маленького кол-ва данных
        this.header.addEventListener('change', event => {
            //спрятать и удалить таблицу,если она уже была показана
            this.hideElements();
            let url = event.target.matches('.small-data') ? this.forSmallData : this.forBigData;
            //обнуляем текущую страницу из массива диапазонов
            this.currentPage = 0;
            this.query(url);
        });

        //переключение между страницами
        this.pageNav.addEventListener('click', event => this.changePage(event));
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
                this.data = response;
                //добавить пришедшие данные в таблицу и показать её
                this.addTable();
            }.bind(this))
            .catch(function(error) {
                throw error;
            });
    }

    addTable() {
        //диапазон страниц в зависимости от текущей страницы
        let range = this.splitPage();
        let output = '';

        for(let i = range.first; i <= range.last; i++) {
            output += Mustache.render(templ.contacts, this.data[i]);
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

    //разделение по страницам
    splitPage() {
        //количество страниц
        this.pageNumbers = Math.ceil(this.data.length / this.rowsPerPage);
        //массив диапазонов
        let ranges = [];
        let firstValue = 0;

        for(let i = 0; i < this.pageNumbers; i++) {
            ranges.push( { first: firstValue , last: firstValue + (this.rowsPerPage - 1) } );
            firstValue = firstValue + 1 + (this.rowsPerPage - 1);
        }

        //проверка номера последней строки последнего диапазона, для случаев если последняя страница не полностью заполнена
        if(ranges[this.pageNumbers - 1].last > (this.data.length - 1)) ranges[this.pageNumbers - 1].last = this.data.length - 1;

        //возвращает диапазон показа текущей страницы
        return ranges[this.currentPage];
    }

    changePage(event) {
        if(event.target.matches('.page-right')) {
            this.goPageMore();
        } else {
            this.goPageLess();
        };

        this.removeTable();
        this.addTable();
    }

    goPageMore() {
        this.currentPage = this.currentPage + 1;
        //проверка максимального значения количества страниц
        if(this.currentPage + 1 > this.pageNumbers) this.currentPage = this.pageNumbers - 1;

        this.pageNumberElem.innerHTML = this.currentPage + 1;
    }

    goPageLess() {
        this.currentPage = this.currentPage - 1;
        //проверка минимального значения количества страниц
        if(this.currentPage < 0) this.currentPage = 0;

        this.pageNumberElem.innerHTML = this.currentPage + 1;
    }

}