import {
	ClassicEditor as ClassicEditorBase,
	BalloonEditor as BalloonEditorBase,
	Essentials,
	Autoformat,
	Alignment,
	Bold,
	Italic,
	BlockQuote,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	ImageResize,
	LinkImage,
	Indent,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	Table,
	TableToolbar,
	TextTransformation,
	SimpleUploadAdapter,
	RemoveFormat,
	Underline,
	HorizontalLine
} from 'ckeditor5';

import svTranslations from 'ckeditor5/translations/sv.js';

import 'ckeditor5/ckeditor5.css';

import InternalLink from "./plugins/internallink/src/internalLink.js"

class ClassicEditor extends ClassicEditorBase {}
class BalloonEditor extends BalloonEditorBase {}
class MiniEditor extends BalloonEditorBase {}

// Plugins to include in the build.
const plugins = [
	Alignment,
	Essentials,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	Heading,
	HorizontalLine,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageResize,
	LinkImage,
	ImageUpload,
	SimpleUploadAdapter,
	Indent,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	Table,
	TableToolbar,
	TextTransformation,
	RemoveFormat,
	Underline,

	InternalLink,
];

ClassicEditor.builtinPlugins = plugins;
BalloonEditor.builtinPlugins = plugins;
MiniEditor.builtinPlugins = [
	Essentials,
	Bold,
	Italic,
	Link,
	Paragraph,
];

// Editor configuration.
const config = {
	licenseKey: 'GPL',
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'underline',
			'alignment',
			'bulletedList',
			'numberedList',
			'|',
			'uploadImage',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'horizontalLine',
			'undo',
			'redo',
			'removeFormat',
			'internalLink',
		]
	},
	image: {
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:side',
			'|',
			'toggleImageCaption',
			'imageTextAlternative'
		]
	},
	heading: {
		options: [
			{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
			{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
			{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
			{ model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
			{ model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
		]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	},

	language: 'en',
	translations: [svTranslations],
};

ClassicEditor.defaultConfig = config;
BalloonEditor.defaultConfig = config;
MiniEditor.defaultConfig = {
	licenseKey: 'GPL',
	toolbar: {
		items: [
			'bold',
			'italic',
			'link',
		]
	},

	language: 'en',
	translations: [svTranslations],
};

export default {ClassicEditor, BalloonEditor, MiniEditor}
