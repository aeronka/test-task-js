import Mustache from './node_modules/mustache/mustache.min.js';
import templ from './dist/template.js';
import './node_modules/element-closest/closest.legacy.js';
import _ from './node_modules/lodash/index.js';

export default class SortableTable {    
    constructor(options) {
    //присвоение переменных
        this.tbody = options.tableBodyElem;
        this.forSmallData = options.forSmallData;
        this.forBigData = options.forBigData;
        this.rowsPerPage = options.rowsPerPage;

        //контейнер выбора загрузки видов данных
        this.header = document.querySelector('.content-header');

        //элементы необходимые для работы таблицы
        this.contacts = document.querySelector('.contacts');
        this.spinner = document.querySelector('.spinner-loader');
        this.pageNav = document.querySelector('.page-navigation');
        this.pageLeft = this.pageNav.querySelector('.page-left');
        this.pageRight = this.pageNav.querySelector('.page-right');
        this.pageNumberElem = this.pageNav.querySelector('.page-number');

        //элементы, необходимые для фильтрации таблицы
        this.contentFilter = document.querySelector('.content-info-filter');
        this.formElem = this.contentFilter.querySelector('.filter');
        this.filterText = this.formElem.querySelector('.filter-text');
        this.columnsCollection = this.contacts.tHead.rows[0].cells;

        //блок подробной информации под таблицей
        this.detailElem = document.querySelector('.detail-info');

    //подписка на события
        //выбор загрузки большого или маленького кол-ва данных
        this.header.addEventListener('change', event => this.onHeaderChanged(event));

        //переключение между страницами
        this.pageNav.addEventListener('click', event => this.changePage(event));

        //клик по таблице для сортировки и показа подробной информации
        this.contacts.addEventListener('click', event => this.onTableClick(event));

        //поиск введенных символов, фильтрация
        this.formElem.addEventListener('submit', event => this.filterTable(event));
    }

//методы для отображения таблицы

    onHeaderChanged(event) {
        //спрятать все элементы связанные с таблицей, удалить предыдущую таблицу
        this.hideElements();
        //удаляем указатели сортировки из заголовка таблицы
        this.removeSortArrows();
        //в зависимости от выбранного варианта меняем адрес запроса
        let url = event.target.matches('.small-data') ? this.forSmallData : this.forBigData;
        //обнуляем текущую страницу
        this.currentPage = 0;
        //отправляем запрос
        this.query(url);
    }

    hideElements() {
        if(!this._flagShow) return;
        this._flagShow = false;
        this.contentFilter.classList.remove('visible-block');
        this.contacts.classList.remove('visible-table');
        this.pageNav.classList.remove('visible-block');
        this.detailElem.classList.remove('visible-block');
        this.removeTable();
    }

    removeTable() {
        this.contacts.removeChild(this.tbody);
        this.tbody = document.createElement('tbody');
        this.contacts.appendChild(this.tbody);
    }

    query(url) {
        //показать индикатор загрузки
        this.showInlineElements(this.spinner);
        fetch(url)
            .then(function(response) {
                return response.json();
            })
            .then(function(response) {
                this.data = response;
                //спрятать индикатор
                this.hideInlineElements(this.spinner);
                //добавить пришедшие данные в таблицу и показать её
                this.addTable(this.data);
            }.bind(this))
            .catch(function(error) {
                //спрятать индикатор
                this.hideInlineElements(this.spinner);
                throw error;
            }.bind(this));
    }

    showInlineElements(elem) {
        elem.classList.add('visible-inline');
    }

    hideInlineElements(elem) {
        elem.classList.remove('visible-inline');
    }

    addTable(data) {
        //ссылка на набор данных, показанных в данный момент на странице (отфильтрованные или нет)
        if(data && data.length) this.currentData = data;
        //если функция-coller не знает с какими данными нужно вызвать, то вызывает без параметров и для работы берется this.currentData
        data = data || this.currentData;

        //диапазон страниц в зависимости от текущей страницы
        let range = this.splitPage(data);

        //показать стрелки навигации
        this.showHidePageArrows();

        //вставка номера текущей страницы
        this.insertPageValue();

        if(!range) return;

        let output = '';

        for(let i = range.first; i <= range.last; i++) {
            output += Mustache.render(templ.contacts, data[i]);
        }
        //вставка готовой таблицы на страницу
        this.tbody.insertAdjacentHTML('beforeEnd', output);
        
        //отображение всех необходимых элементов
        this.showElements();
    }

    //разделение по страницам
    splitPage(data) {
        //количество страниц
        this.pageNumbers = Math.ceil(data.length / this.rowsPerPage) || 1;
        if(!data.length) return null;
        //массив диапазонов
        let ranges = [];
        let firstValue = 0;

        for(let i = 0; i < this.pageNumbers; i++) {
            ranges.push( { first: firstValue , last: firstValue + (this.rowsPerPage - 1) } );
            firstValue = firstValue + 1 + (this.rowsPerPage - 1);
        }

        //проверка номера последней строки последнего диапазона, для случаев если последняя страница не полностью заполнена
        if(ranges[this.pageNumbers - 1].last > (data.length - 1)) ranges[this.pageNumbers - 1].last = data.length - 1;

        //возвращает диапазон показа текущей страницы
        return ranges[this.currentPage];
    }

    showElements() {
        if(this._flagShow) return;
        this._flagShow = true;
        this.contentFilter.classList.add('visible-block');
        this.contacts.classList.add('visible-table');
        this.pageNav.classList.add('visible-block');
    }

    insertPageValue() {
        this.pageNumberElem.innerHTML = this.currentPage + 1;
    }

//методы для переключение между страницами

    changePage(event) {
        event.preventDefault();

        //проверяем куда будет осуществляться переход
        if(event.target.matches('.page-right')) {
            //на страницу вперед
            this.currentPage = this.currentPage + 1;
            //this.goPageMore();
        } else { //иначе на страницу назад
            this.currentPage = this.currentPage - 1;
            //this.goPageLess();
        }
        this.showHidePageArrows();
        //перерисовываем таблицу
        this.removeTable();
        this.addTable();
    }

    showHidePageArrows() {
        if(this.pageNumbers === 1) {
            this.hideInlineElements(this.pageLeft);
            this.hideInlineElements(this.pageRight);
            return;
        }

        if(this.currentPage > 0 && this.currentPage + 1 < this.pageNumbers) {
            this.showInlineElements(this.pageRight);
            this.showInlineElements(this.pageLeft);
            return;
        }

        if(this.currentPage <= 0) {
            this.hideInlineElements(this.pageLeft);
            this.showInlineElements(this.pageRight);
        } else if(this.currentPage + 1 >= this.pageNumbers) {
            this.hideInlineElements(this.pageRight);
            this.showInlineElements(this.pageLeft);
        }
    }

//методы работы с таблицей - клик по строке и сортировка

    onTableClick(event) {
        //если клик произошел внутри tbody, значит нужно показать подробную информацию с содержимым кликнутой строки
        if(this.tbody.contains(event.target)) {
            //удаляем предыдущую информацию
            this.removeDetailInfo();
            //показываем новую
            this.showDetailInfo(event);
        } else { //иначе клик произошел на заголовке таблицы и нужно отсортировать кликнутый столбец
            this.sortTable(event);
        };
    }

    removeDetailInfo() {
        let detailList = this.detailElem.querySelector('ul');
        if(detailList) this.detailElem.removeChild(detailList);
    }

    showDetailInfo (event) {
        //по цепочке родителей от кликнутого элемента идем до строки
        let row = event.target.closest('tr');
        if(!row) return; //если строка в родителях не найдена, то ничего не делаем
        
        //индекс кликнутой строки в масштабах всей таблицы вне зависимости от страницы
        let indexClickedRow = row.sectionRowIndex + this.currentPage * this.rowsPerPage;
        
        //вставка подробной информации на страницу
        this.addDetailInfo(indexClickedRow);
        //отображение
        this.detailElem.classList.add('visible');
    }

    addDetailInfo(indexClickedRow) {
        let output = Mustache.render(templ.detailInfo, this.currentData[indexClickedRow]);
        this.detailElem.insertAdjacentHTML('beforeEnd', output);
    }

    sortTable(event) {
        let column = event.target.closest('td');
        if(!column) return;

        //имя свойства объекта, по которому необходимо отсортировать
        let sortedField = column.getAttribute('data-field-name');
        //направление сортировки
        let direction;
        let isSortUp = column.matches('.sort-up');
        let isSortDown = column.matches('.sort-down');

        //проверяем была ли раньше сортировка, если есть один из этих классов, то была
        if(isSortUp || isSortDown) {
            direction = isSortUp ? 'desc' : 'asc';
            column.classList.toggle('sort-up');
            column.classList.toggle('sort-down');
        } else { //сортировка первый раз и должна быть по возрастанию
            direction = 'asc';
            column.classList.add('sort-up');
        }

        this.currentData = _.sortByOrder(this.currentData, [sortedField], [direction]);

        //перерисовываем таблицу
        this.removeTable();
        this.addTable();
    }

    removeSortArrows() {
        for(let i = 0; i < this.columnsCollection.length; i++) {
            this.columnsCollection[i].classList.remove('sort-up', 'sort-down');
        }
    }

    //проверка наличия сортировки на основе классов столбцов в заголовке таблицы 
    checkSortStatus() {
        for(let i = 0; i < this.columnsCollection.length; i++) {
            //в зависимости от класса у текущего столбца запускаем сортировку по возрастанию или убыванию
            if(this.columnsCollection[i].matches('.sort-up')) {
                this.sortData(this.columnsCollection[i], 'asc');
            } else if(this.columnsCollection[i].matches('.sort-down')) {
                this.sortData(this.columnsCollection[i], 'desc');
            }
        }
    }

    sortData(sortedColumn, direction) {
        //определяем имя свойства объекта, по которому нужна сортировка
        let sortedField = sortedColumn.getAttribute('data-field-name');
        this.data = _.sortByOrder(this.data, [sortedField], [direction]);
    }

//методы для поиска введенных символов, фильтрации

    filterTable(event) {
        //отменяем отправку формы
        event.preventDefault();

        let newValue = this.filterText.value;
        //если новое значение в фильтре такое же, как предыдущее, то таблицу не требуется перерисовывать
        if(newValue === this.currentFilterValue) return;
        //если значение есть,то фильтровать данные
        if(newValue) {
            //сохраняем удовлетворяющие поиску элементы в новый массив, итерируемся по массиву объектов
            this.filteredData = this.currentData.filter(function(item) {
                //перебираем свойства объекта
                for(let key in item) if(item.hasOwnProperty(key)) {
                    //приводим данные к строке (чтобы искать и по id) и ищем подстроку
                    if(~String(item[key]).indexOf(newValue)) return true;
                }
                return false;
            });
        }
        //сохраняем текущее значение, введенное в фильтр
        this.currentFilterValue = newValue;
        //при каждой фильтрации показывать с первой страницы
        this.currentPage = 0;
        //удаляем старую таблицу
        this.removeTable();
        //если значение есть, то отрисовать таблицу с отфильтрованными данными
        if(newValue) {
            this.addTable(this.filteredData);
        } else { //если нет, то мы сбрасываем фильтр и показываем таблицу с полными данными
            //проверяем была ли сортировка отфильтрованных данных, если была - сортируем исходный массив так же
            this.checkSortStatus();
            //отрисовываем таблицу с отсортированными полными данными
            this.addTable(this.data);
        }
    }
}