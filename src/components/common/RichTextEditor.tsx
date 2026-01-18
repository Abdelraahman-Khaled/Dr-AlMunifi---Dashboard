import { Component } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, convertFromRaw, ContentState, convertFromHTML } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './RichTextEditor.css';

interface RichTextEditorProps {
  initialContent?: string; // JSON string of raw content
  initialHtml?: string;    // HTML string
  onContentChange?: (content: string) => void; // Callback with JSON string
  placeholder?: string;
  minHeight?: string;
  showPreviewToggle?: boolean;
  showSaveButton?: boolean;
  showClearButton?: boolean;
  onSave?: (content: string) => void;
  autoSave?: boolean;
  localStorageKey?: string;
  direction?: 'ltr' | 'rtl';
}

interface RichTextEditorState {
  editorState: EditorState;
  showPreview: boolean;
}

export default class RichTextEditor extends Component<RichTextEditorProps, RichTextEditorState> {
  static defaultProps = {
    placeholder: 'Start typing your content here...',
    minHeight: '500px',
    showPreviewToggle: true,
    showSaveButton: true,
    showClearButton: true,
    autoSave: false,
    direction: 'ltr',
  };

  constructor(props: RichTextEditorProps) {
    super(props);

    let initialEditorState = EditorState.createEmpty();

    // Load from localStorage if key is provided
    if (props.localStorageKey) {
      const savedContent = localStorage.getItem(props.localStorageKey);
      if (savedContent) {
        try {
          const rawContent = JSON.parse(savedContent);
          const contentState = convertFromRaw(rawContent);
          initialEditorState = EditorState.createWithContent(contentState);
        } catch (e) {
          console.error('Error loading saved content:', e);
        }
      }
    }

    // Load from initialHtml prop if provided
    if (props.initialHtml && !props.initialContent && !props.localStorageKey) {
      try {
        const blocksFromHTML = convertFromHTML(props.initialHtml);
        const state = ContentState.createFromBlockArray(
          blocksFromHTML.contentBlocks,
          blocksFromHTML.entityMap
        );
        initialEditorState = EditorState.createWithContent(state);
      } catch (e) {
        console.error('Error loading initial HTML:', e);
      }
    }

    // Load from initialContent prop if provided
    if (props.initialContent && !props.localStorageKey) {
      try {
        const rawContent = JSON.parse(props.initialContent);
        const contentState = convertFromRaw(rawContent);
        initialEditorState = EditorState.createWithContent(contentState);
      } catch (e) {
        console.error('Error loading initial content:', e);
      }
    }

    this.state = {
      editorState: initialEditorState,
      showPreview: false,
    };
  }

  onEditorStateChange = (editorState: EditorState) => {
    this.setState({ editorState }, () => {
      // Call onChange callback if provided
      if (this.props.onContentChange) {
        const content = this.getJsonContent();
        this.props.onContentChange(content);
      }

      // Auto-save to localStorage if enabled
      if (this.props.autoSave && this.props.localStorageKey) {
        const content = this.getJsonContent();
        localStorage.setItem(this.props.localStorageKey, content);
      }
    });
  };

  getJsonContent = (): string => {
    const contentState = this.state.editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    return JSON.stringify(rawContent);
  };

  getHtmlContent = (): string => {
    const contentState = this.state.editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    return draftToHtml(rawContent);
  };

  handleSave = () => {
    const content = this.getJsonContent();

    if (this.props.localStorageKey) {
      localStorage.setItem(this.props.localStorageKey, content);
    }

    if (this.props.onSave) {
      this.props.onSave(content);
    } else {
      alert('Content saved successfully!');
    }
  };

  handleClear = () => {
    if (window.confirm('Are you sure you want to clear all content?')) {
      this.setState({ editorState: EditorState.createEmpty() }, () => {
        if (this.props.localStorageKey) {
          localStorage.removeItem(this.props.localStorageKey);
        }
        if (this.props.onContentChange) {
          this.props.onContentChange('');
        }
      });
    }
  };

  togglePreview = () => {
    this.setState({ showPreview: !this.state.showPreview });
  };

  // Public method to get content
  getContent = (): { json: string; html: string } => {
    return {
      json: this.getJsonContent(),
      html: this.getHtmlContent(),
    };
  };

  // Public method to set content from JSON
  setContent = (jsonContent: string) => {
    if (!jsonContent) {
      this.setState({ editorState: EditorState.createEmpty() });
      return;
    }
    try {
      const rawContent = JSON.parse(jsonContent);
      const contentState = convertFromRaw(rawContent);
      const editorState = EditorState.createWithContent(contentState);
      this.setState({ editorState });
    } catch (e) {
      console.error('Error setting content:', e);
    }
  };

  // Public method to set content from HTML
  setHtmlContent = (htmlContent: string) => {
    if (!htmlContent) {
      this.setState({ editorState: EditorState.createEmpty() });
      return;
    }
    try {
      const blocksFromHTML = convertFromHTML(htmlContent);
      const state = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      const editorState = EditorState.createWithContent(state);
      this.setState({ editorState });
    } catch (e) {
      console.error('Error setting HTML content:', e);
    }
  };

  render() {
    const { editorState, showPreview } = this.state;
    const {
      placeholder,
      minHeight,
      showPreviewToggle,
      showSaveButton,
      showClearButton,
      direction,
    } = this.props;

    return (
      <div
        className="rich-text-editor-wrapper"
        style={{ '--editor-min-height': minHeight } as React.CSSProperties}
      >
        {/* Header with action buttons */}
        {(showPreviewToggle || showClearButton || showSaveButton) && (
          <div className="mb-4 flex items-center justify-between" dir={direction}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {showPreview ? 'Preview Mode' : 'Editor Mode'}
            </h3>
            <div className="flex gap-3">
              {showPreviewToggle && (
                <button
                  onClick={this.togglePreview}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  {showPreview ? 'Edit' : 'Preview'}
                </button>
              )}
              {showClearButton && (
                <button
                  onClick={this.handleClear}
                  className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Clear
                </button>
              )}
              {showSaveButton && (
                <button
                  onClick={this.handleSave}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        )}

        {/* Editor or Preview */}
        {!showPreview ? (
          <div className="rounded-lg border border-gray-300 bg-white overflow-visible dark:border-gray-700 dark:bg-gray-900">
            <Editor
              editorState={editorState}
              onEditorStateChange={this.onEditorStateChange}
              wrapperClassName="editor-wrapper"
              editorClassName={`editor-content px-4 py-3 text-gray-800 dark:text-white`}
              editorStyle={{ direction: direction, textAlign: direction === 'rtl' ? 'right' : 'left' }}
              toolbarClassName="editor-toolbar border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              placeholder={placeholder}
              stripPastedStyles={true}
              textAlignment={direction === 'rtl' ? 'right' : 'left'}
              toolbar={{
                options: [
                  'inline',
                  'blockType',
                  'fontSize',
                  'fontFamily',
                  'list',
                  'textAlign',
                  'colorPicker',
                  'link',
                  'embedded',
                  'emoji',
                  'image',
                  'remove',
                  'history',
                ],
                inline: {
                  inDropdown: false,
                  options: [
                    'bold',
                    'italic',
                    'underline',
                    'strikethrough',
                    'monospace',
                    'superscript',
                    'subscript',
                  ],
                },
                blockType: {
                  inDropdown: true,
                  options: [
                    'Normal',
                    'H1',
                    'H2',
                    'H3',
                    'H4',
                    'H5',
                    'H6',
                    'Blockquote',
                    'Code',
                  ],
                },
                fontSize: {
                  options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
                },
                fontFamily: {
                  options: [
                    'Arial',
                    'Georgia',
                    'Impact',
                    'Tahoma',
                    'Times New Roman',
                    'Verdana',
                    'Roboto',
                    'Open Sans',
                    'Inter',
                    'Nunito',
                  ],
                },
                list: {
                  inDropdown: false,
                  options: ['unordered', 'ordered', 'indent', 'outdent'],
                },
                textAlign: {
                  inDropdown: false,
                  options: ['left', 'center', 'right', 'justify'],
                },
                link: {
                  inDropdown: false,
                  showOpenOptionOnHover: true,
                  defaultTargetOption: '_blank',
                  options: ['link', 'unlink'],
                },
                image: {
                  uploadCallback: (file: File) => {
                    return new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = () => resolve({ data: { link: reader.result } });
                      reader.onerror = (error) => reject(error);
                    });
                  },
                  alt: { present: true, mandatory: false },
                  previewImage: true,
                  inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                },
              }}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
              Preview (Links are clickable)
            </h4>
            <div
              className="prose prose-sm max-w-none dark:prose-invert prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300"
              dangerouslySetInnerHTML={{ __html: this.getHtmlContent() }}
            />
          </div>
        )}

      </div>
    );
  }
}
