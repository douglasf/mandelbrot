'use strict';

const $       = global.jQuery;
const storage = require('../storage');
const events  = require('../events');

function getTreeUrl(urlPath){
    const parser    = document.createElement('a');
    parser.href     = urlPath;
    const pathParts = parser.pathname.split('/');
    pathParts.push(pathParts.pop());
    return pathParts.join('/');
}

class Tree {

    constructor(el){
        this._el = $(el);
        this._id = this._el[0].id;
        this._state = storage.get(`tree.${this._id}.state`, []);
        this._collections = $.map(this._el.find('[data-behaviour="collection"]'), c => new TreeCollection(c, this));

        for (let key in this._collections) {
            const collection = this._collections[key];
            if (collection.containsCurrentItem()) {
                this._state.push(collection.id);
            }
        }
        this._setState();
        this._applyState();
        events.on('main-content-preload', (e, url) => {
            this.selectItem(getTreeUrl(url));
        });
    }

    selectItem(url) {
        this._el.find('.is-current').removeClass('is-current');
        this._el.find(`[href="${url}"]`).parent().addClass('is-current');
        this._setState();
        this._applyState();
    }

    _setState() {
        let state = [];
        let current = this._el.find('.is-current')[0];
        while (current) {
            if (current.id) state.push(current.id);
            current = current.parentNode.closest('.Tree-collection');
        }
        this._state = state;
    }

    _applyState() {
        for (let key in this._collections) {
            const collection = this._collections[key];
            if (this._state.indexOf(collection.id) > -1) {
                collection.open();
            } else {
                collection.close();
            }
        }
    }
}

class TreeCollection {

    constructor(el, tree){
        this._tree         = tree;
        this._el           = $(el);
        this._toggle       = this._el.find('> [data-role="toggle"]');
        this._itemsWrapper = this._el.find('[data-role="items"]:not(> [data-behaviour] [data-role="items"])');
        this._isOpen       = true;
        this._toggle.on('click', this.toggle.bind(this));
    }

    get id(){
        return this._el[0].id;
    }

    containsCurrentItem(){
        return !! this._itemsWrapper.find('[data-state="current"]').length;
    }

    open(){
        this._el.removeClass('is-closed');
        this._isOpen = true;
    }

    close(){
        this._el.addClass('is-closed');
        this._isOpen = false;
    }

    toggle(){
        this._isOpen ? this.close() : this.open();
        return false;
    }
}

module.exports = Tree;
