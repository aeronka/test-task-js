import './bower_components/fetch/fetch.js';
import './bower_components/es6-promise/promise.js';
import SortableTable from './sortableTable.js';

document.addEventListener('DOMContentLoaded', () => {

    let sortableTable = new SortableTable({
        tableBodyElem: document.querySelector('.contacts').querySelector('tbody'),
        forSmallData: 'http://www.filltext.com/?rows=32&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D',
        forBigData: 'http://www.filltext.com/?rows=1000&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&delay=3&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D'
    });

});
