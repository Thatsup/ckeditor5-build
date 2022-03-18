/**
 * @module InternalLink/InternalLinkDataContext
 */

import axios from 'axios';

import {replacePlaceholderInUrl} from '../util/utils';
import debounce from "lodash/debounce";

import {
    CONFIG_TEST_MODE,
    CONFIG_AUTOCOMPLETE_URL,
    CONFIG_TITLE_URL,
    CONFIG_AXIOS_INSTANCE,
    URL_PLACEHOLDER_ID,
    URL_PLACEHOLDER_SEARCH_TERM, CONFIG_TITLE_KEY
} from '../util/constants';

/**
 * This is used to call a web service for finding
 * items and getting the item name by id.
 */
export default class InternalLinkDataContext {

    constructor(editor) {
        this.editor = editor;
    }

    /**
     * Gets the autocomplete suggestions
     * @param {string} searchTerm The term that is entered into our search box
     */
    getAutocompleteItems(searchTerm) {
        const isTestMode = this.editor.config.get(CONFIG_TEST_MODE);
        const url = this.editor.config.get(CONFIG_AUTOCOMPLETE_URL);
        const autocompleteUrl = replacePlaceholderInUrl(url, URL_PLACEHOLDER_SEARCH_TERM, searchTerm);

        if (isTestMode) {
            return this.getAutocompleteTestData(searchTerm);
        }

        return this.getAxiosInstance().get(autocompleteUrl)
    }

    /**
     * Loads the title of an item
     * @param {string} itemId The id of an item you want to load
     */
    getTitleById(itemId) {
        const isTestMode = this.editor.config.get(CONFIG_TEST_MODE);
        const url = this.editor.config.get(CONFIG_TITLE_URL);
        const titleUrl = replacePlaceholderInUrl(url, URL_PLACEHOLDER_ID, itemId);

        if (isTestMode) {
            return this.getTitleTestData(itemId);
        }

        return this.getAxiosInstance().get(titleUrl);
    }

    /**
     * Gets the autocomplete test data
     * @param {string} searchTerm The term that is entered into our searchbox
     */
    getAutocompleteTestData(searchTerm) {
        const testData = {
            "data": [{
                "guide": false,
                "published": null,
                "deleted": null,
                "dateDeleted": null,
                "dateAdded": "2021-06-22 09:21:04",
                "createUserId": null,
                "cityId": 1,
                "approximateVisitCount": null,
                "visitCount1Week": null,
                "visitCount1Month": null,
                "dateUpdated": "2021-06-22 09:21:27",
                "sponsored": null,
                "images": null,
                "uUID": "2af0a87a-d33b-11eb-963e-f23c919fea3e",
                "articleContent": {
                    "id": null,
                    "articleContentId": null,
                    "articleId": 12581,
                    "localeId": null,
                    "title": "Nu \u00f6ppnar Riche sommarkrogen Pelago",
                    "shortTitle": null,
                    "preamble": null,
                    "bodyText": null,
                    "summary": null,
                    "code": null,
                    "dateAdded": null,
                    "createUserId": null,
                    "dateUpdated": null,
                    "updateUserId": null,
                    "dateRevised": null,
                    "reviseUserId": null,
                    "authors": null,
                    "datePublished": null,
                    "hitwords": null,
                    "layout": null,
                    "relatedArticlesDescription": null,
                    "artworkDescription": null,
                    "published": null,
                    "dateDeleted": null,
                    "infoRows": null,
                    "source": null,
                    "meta": null,
                    "authorUsers": []
                },
                "id": 12581,
                "url": "\/stockholm\/article\/\/?preview"
            }, {
                "guide": false,
                "published": null,
                "deleted": null,
                "dateDeleted": null,
                "dateAdded": "2021-06-17 13:22:34",
                "createUserId": null,
                "cityId": 4,
                "approximateVisitCount": null,
                "visitCount1Week": null,
                "visitCount1Month": null,
                "dateUpdated": "2021-06-17 13:32:14",
                "sponsored": null,
                "images": null,
                "uUID": "133d6ed3-cf6f-11eb-963e-f23c919fea3e",
                "articleContent": {
                    "id": null,
                    "articleContentId": null,
                    "articleId": 12579,
                    "localeId": null,
                    "title": "Artisterna som spelar p\u00e5 Nefertiti sommaren 2021",
                    "shortTitle": null,
                    "preamble": null,
                    "bodyText": null,
                    "summary": null,
                    "code": null,
                    "dateAdded": null,
                    "createUserId": null,
                    "dateUpdated": null,
                    "updateUserId": null,
                    "dateRevised": null,
                    "reviseUserId": null,
                    "authors": null,
                    "datePublished": null,
                    "hitwords": null,
                    "layout": null,
                    "relatedArticlesDescription": null,
                    "artworkDescription": null,
                    "published": null,
                    "dateDeleted": null,
                    "infoRows": null,
                    "source": null,
                    "meta": null,
                    "authorUsers": []
                },
                "id": 12579,
                "url": "\/goteborg\/article\/\/?preview"
            }]
        };

        return Promise.resolve(testData);
    }

    /**
     * Gets the title test data
     * @param {string} itemId The id of an item you want to load
     */
    getTitleTestData(itemId) {
        let title = '';

        if (itemId == '12581') {
            title = 'Nu \u00f6ppnar Riche sommarkrogen Pelago';
        } else if (itemId == '12579') {
            title = 'Artisterna som spelar p\u00e5 Nefertiti sommaren 2021';
        }

        return Promise.resolve({data: title});
    }

    /**
     * Gets the axios instance
     */
    getAxiosInstance() {
        const customAxiosInstance = this.editor.config.get(CONFIG_AXIOS_INSTANCE);

        if (customAxiosInstance) {
            return customAxiosInstance;
        }

        return axios;
    }

}
