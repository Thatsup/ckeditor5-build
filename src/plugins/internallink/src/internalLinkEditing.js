/**
 * @module internalLink/internalLinkEditing
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {createLinkElement} from './util/utils';
import twostepcaretmovement from '@ckeditor/ckeditor5-typing/src/twostepcaretmovement';
import inlineHighlight from '@ckeditor/ckeditor5-typing/src/utils/inlinehighlight';

import '../theme/editing.css';

import {
    VIEW_INTERNAL_LINK_TAG,
    MODEL_INTERNAL_LINK_ID_ATTRIBUTE,
    CLASS_HIGHLIGHT, CONFIG_ID_ATTRIBUTE, MODEL_INTERNAL_DATA, MODEL_INTERNAL_LINK_HREF_ATTRIBUTE, CONFIG_HREF_KEY
} from './util/constants';

/**
 * The link engine feature.
 *
 * It introduces the `internalLinkId="id"` attribute in the model which renders to
 * the view as a `<internallink internalLinkId="1d">` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class InternalLinkEditing extends Plugin {

    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;

        // Allow link attribute on all inline nodes.
        editor.model.schema.extend('$text', {allowAttributes: [MODEL_INTERNAL_LINK_ID_ATTRIBUTE, MODEL_INTERNAL_LINK_HREF_ATTRIBUTE]});

        editor.conversion.for('downcast').attributeToElement({
            model: MODEL_INTERNAL_LINK_ID_ATTRIBUTE,
            view: (internalLinkId, conversionApi) => {
                const LINK_ATTRIBUTE_KEY = editor.config.get(CONFIG_ID_ATTRIBUTE)
                return createLinkElement(internalLinkId, conversionApi, editor, LINK_ATTRIBUTE_KEY);
            }
        }).attributeToElement({
            model: MODEL_INTERNAL_LINK_HREF_ATTRIBUTE,
            view: (href, conversionApi) => {
                return createLinkElement(href, conversionApi, editor, 'href');
            }
        });

        const LINK_ATTRIBUTE_KEY = editor.config.get(CONFIG_ID_ATTRIBUTE)

        editor.conversion.for('upcast')
            .elementToAttribute({
                converterPriority: 'high',
                view: {
                    name: VIEW_INTERNAL_LINK_TAG,
                    attributes: {
                        // This is important to ensure that the internal links are not
                        // removed if text with an internal link is pasted to ckeditor
                        [LINK_ATTRIBUTE_KEY]: true,
                    }
                },
                model: {
                    // The internal attribute name
                    key: MODEL_INTERNAL_LINK_ID_ATTRIBUTE,
                    // The html tag attribute
                    value: viewElement => {
                        return viewElement.getAttribute(LINK_ATTRIBUTE_KEY);
                    }
                }
            });

        // Enable two-step caret movement for `internalLinkId` attribute.
        editor.plugins.get(twostepcaretmovement).registerAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE);

        // Setup highlight over selected link.
        inlineHighlight(editor, MODEL_INTERNAL_LINK_ID_ATTRIBUTE, VIEW_INTERNAL_LINK_TAG, CLASS_HIGHLIGHT);
    }

}
