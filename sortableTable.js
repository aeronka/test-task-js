import Mustache from './node_modules/mustache/mustache.min.js';
import templ from './dist/template.js';

export default class SortableTable {    
    constructor(options) {
        this.tbody = options.tableBodyElem;
        this.forSmallData = options.forSmallData;
        this.forBigData = options.forBigData;
        this.rowsPerPage = options.rowsPerPage;

        this.header = document.querySelector('.content-header');
        this.contentFilter = document.querySelector('.content-info-filter');
        this.contacts = document.querySelector('.contacts');
        this.spinner = document.querySelector('.spinner-loader');
        this.pageNav = document.querySelector('.page-navigation');
        this.pageNumberElem = this.pageNav.querySelector('.page-number');
        this.detailElem = document.querySelector('.detail-info');

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
        this.contentFilter.classList.add('visible');
        this.contacts.classList.add('visible');
        this.pageNav.classList.add('visible');
    }

    hideElements() {
        if(!this._flagShow) return;
        this._flagShow = false;
        this.contentFilter.classList.remove('visible');
        this.contacts.classList.remove('visible');
        this.pageNav.classList.remove('visible');
        this.detailElem.classList.remove('visible');
        this.removeTable();
    }

    showSpinner() {
        this.spinner.classList.add('spinner-visible');
    }

    hideSpinner() {
        this.spinner.classList.remove('spinner-visible');
    }

    query(url) {
        //показать индикатор
        this.showSpinner();
        fetch(url)
            .then(function(response) {
                return response.json();
            })
            .then(function(response) {
                this.data = response;
                //спрятать индикатор
                this.hideSpinner();
                //добавить пришедшие данные в таблицу и показать её
                this.addTable();
            }.bind(this))
            .catch(function(error) {
                //спрятать индикатор
                this.hideSpinner();
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
        this.insertPageValue();
        this.showElements();

        //ждет клик по строке таблицы на текущей странице
        this.tbody.addEventListener('click', event => {
            this.removeDetailInfo();
            this.showDetailInfo(event, range);
        });
    }

    removeTable() {
        this.contacts.removeChild(this.tbody);
        this.tbody = document.createElement('tbody');
        this.contacts .appendChild(this.tbody);
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
        this.insertPageValue();
    }

    goPageMore() {
        this.currentPage = this.currentPage + 1;
        //проверка максимального значения количества страниц
        if(this.currentPage + 1 > this.pageNumbers) this.currentPage = this.pageNumbers - 1;
    }

    goPageLess() {
        this.currentPage = this.currentPage - 1;
        //проверка минимального значения количества страниц
        if(this.currentPage < 0) this.currentPage = 0;
    }

    insertPageValue() {
        this.pageNumberElem.innerHTML = this.currentPage + 1;
    }

    showDetailInfo (event, range) {
        //индекс кликнутой строки в масштабах всей таблицы вне зависимости от страницы
        let indexClickedRow = event.target.parentNode.sectionRowIndex + range.first;
        //вставка информации на страницу
        this.addDetailInfo(indexClickedRow);

        this.detailElem.classList.add('visible');
    }

    addDetailInfo(indexClickedRow) {
        let output = '' + Mustache.render(templ.detailInfo, this.data[indexClickedRow]);
        this.detailElem.insertAdjacentHTML('beforeEnd', output);
    }

    removeDetailInfo() {
        let detailList = this.detailElem.querySelector('ul');
        if(detailList) this.detailElem.removeChild(detailList);
    }

}