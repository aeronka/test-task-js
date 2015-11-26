import './bower_components/fetch/fetch.js';
import './bower_components/es6-promise/promise.js';
import Mustache from './node_modules/mustache/mustache.min.js';
import templ from './dist/template.js';

document.addEventListener('DOMContentLoaded', () => {

    fetch('http://www.filltext.com/?rows=32&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D')
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            load(response);
        })
        .catch(function() {
            console.log('sorry');
        });

    function load(data) {
        var output = '';

        for(var i = 0; i < data.length; i++) {
            output += Mustache.render(templ.contacts, data[i]);
        }
        document.querySelector('tbody').insertAdjacentHTML('beforeEnd', output);
    }
});
