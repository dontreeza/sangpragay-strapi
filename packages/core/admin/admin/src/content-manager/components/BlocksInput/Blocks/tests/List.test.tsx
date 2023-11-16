/* eslint-disable testing-library/no-node-access */
import * as React from 'react';

import { render, screen } from '@testing-library/react';
import { Editor, Transforms, createEditor } from 'slate';

import { listBlocks } from '../List';

import { Wrapper } from './Wrapper';

const mockEvent = {
  preventDefault: jest.fn(),
  target: {
    value: '',
  },
};

describe('List', () => {
  it('renders an unordered list block properly', () => {
    render(
      listBlocks['list-unordered'].renderElement({
        children: 'list unordered',
        element: {
          type: 'list',
          children: [{ type: 'list-item', children: [{ type: 'text', text: 'list unordered' }] }],
          format: 'unordered',
        },
        attributes: {
          'data-slate-node': 'element',
          ref: null,
        },
      }),
      {
        wrapper: Wrapper,
      }
    );

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });

  it('renders an ordered list block properly', () => {
    render(
      listBlocks['list-ordered'].renderElement({
        children: 'list ordered',
        element: {
          type: 'list',
          children: [{ type: 'list-item', children: [{ type: 'text', text: 'list ordered' }] }],
          format: 'unordered',
        },
        attributes: {
          'data-slate-node': 'element',
          ref: null,
        },
      }),
      {
        wrapper: Wrapper,
      }
    );

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });

  it('renders a list item block properly', () => {
    render(
      listBlocks['list-item'].renderElement({
        children: 'list item',
        element: {
          type: 'list-item',
          children: [{ type: 'text', text: 'list item' }],
        },
        attributes: {
          'data-slate-node': 'element',
          ref: null,
        },
      }),
      {
        wrapper: Wrapper,
      }
    );

    const listItem = screen.getByRole('listitem');
    expect(listItem).toBeInTheDocument();
    expect(listItem).toHaveTextContent('list item');
  });

  it('handles enter key on a list item with text', () => {
    const baseEditor = createEditor();
    baseEditor.children = [
      {
        type: 'list',
        format: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'Line of text',
              },
            ],
          },
        ],
      },
    ];

    // Set the cursor at the end of the first list item
    Transforms.select(baseEditor, {
      anchor: Editor.end(baseEditor, []),
      focus: Editor.end(baseEditor, []),
    });

    // Simulate the enter key
    listBlocks['list-unordered'].handleEnterKey?.(baseEditor);

    // Should insert a new list item
    expect(baseEditor.children).toEqual([
      {
        type: 'list',
        format: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'Line of text',
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: '',
              },
            ],
          },
        ],
      },
    ]);
  });

  it('handles enter key on a list item without text', () => {
    const baseEditor = createEditor();
    baseEditor.children = [
      {
        type: 'list',
        format: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'First list item',
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: '',
              },
            ],
          },
        ],
      },
    ];

    // Set the cursor at the end of the last list item
    Transforms.select(baseEditor, {
      anchor: Editor.end(baseEditor, [0, 1]),
      focus: Editor.end(baseEditor, [0, 1]),
    });

    // Simulate the enter key
    listBlocks['list-unordered'].handleEnterKey?.(baseEditor);

    // Should remove the empty list item and create a paragraph after the list
    expect(baseEditor.children).toEqual([
      {
        type: 'list',
        format: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'First list item',
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: '',
          },
        ],
      },
    ]);
  });

  it('handles enter key on an empty list', () => {
    const baseEditor = createEditor();
    baseEditor.children = [
      {
        type: 'list',
        format: 'ordered',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: '',
              },
            ],
          },
        ],
      },
    ];

    // Set the cursor on the first list item
    Transforms.select(baseEditor, {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    });

    // Simulate the enter key
    listBlocks['list-ordered'].handleEnterKey?.(baseEditor);

    // Should remove the empty list and create a paragraph instead
    expect(baseEditor.children).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: '',
          },
        ],
      },
    ]);
  });

  it('handles the backspace key on a very first list with single empty list item', () => {
    const baseEditor = createEditor();
    baseEditor.children = [
      {
        type: 'list',
        format: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: '',
              },
            ],
          },
        ],
      },
    ];

    // Set the cursor on the first list item
    Transforms.select(baseEditor, {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    });

    // Simulate the backspace key
    listBlocks['list-unordered'].handleBackspaceKey?.(
      baseEditor,
      mockEvent as unknown as React.KeyboardEvent<HTMLDivElement>
    );

    // Should remove the empty list item and replace with empty paragraph
    expect(baseEditor.children).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: '',
          },
        ],
      },
    ]);
  });

  it('handles the backspace key on a list with single empty list item', () => {
    const baseEditor = createEditor();
    baseEditor.children = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'some text',
          },
        ],
      },
      {
        type: 'list',
        format: 'ordered',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: '',
              },
            ],
          },
        ],
      },
    ];

    // Set the cursor on the first list item
    Transforms.select(baseEditor, {
      anchor: { path: [1, 0, 0], offset: 0 },
      focus: { path: [1, 0, 0], offset: 0 },
    });

    // Simulate the backspace key
    listBlocks['list-ordered'].handleBackspaceKey?.(
      baseEditor,
      mockEvent as unknown as React.KeyboardEvent<HTMLDivElement>
    );

    // Should remove the empty list item
    expect(baseEditor.children).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'some text',
          },
        ],
      },
    ]);
  });

  it('handles the backspace key on a list with two list items and converts the first into a paragraph', () => {
    const baseEditor = createEditor();
    baseEditor.children = [
      {
        type: 'list',
        format: 'ordered',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'first list item',
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'second list item',
              },
            ],
          },
        ],
      },
    ];

    // Set the cursor on the first list item
    Transforms.select(baseEditor, {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    });

    // Simulate the backspace key
    listBlocks['list-ordered'].handleBackspaceKey?.(
      baseEditor,
      mockEvent as unknown as React.KeyboardEvent<HTMLDivElement>
    );

    // Should convert the first list item in a paragraph
    expect(baseEditor.children).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'first list item',
          },
        ],
      },
      {
        type: 'list',
        format: 'ordered',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'second list item',
              },
            ],
          },
        ],
      },
    ]);
  });

  it('handles the backspace key on a empty list with just one list item', () => {
    const baseEditor = createEditor();
    baseEditor.children = [
      {
        type: 'list',
        format: 'ordered',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: '',
              },
            ],
          },
        ],
      },
    ];

    // Set the cursor on the first list item
    Transforms.select(baseEditor, {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    });

    // Simulate the backspace key
    listBlocks['list-ordered'].handleBackspaceKey?.(
      baseEditor,
      mockEvent as unknown as React.KeyboardEvent<HTMLDivElement>
    );

    // Should convert the first list item in a paragraph
    expect(baseEditor.children).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: '',
          },
        ],
      },
    ]);
  });

  it('handles the backspace key on a list with mixed content', () => {
    const baseEditor = createEditor();
    baseEditor.children = [
      {
        type: 'list',
        format: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'text',
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'bold',
                bold: true,
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'italic',
                italic: true,
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'mixed ',
              },
              {
                type: 'text',
                text: 'text',
                underline: true,
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'inline ',
              },
              {
                type: 'text',
                text: 'code',
                code: true,
              },
            ],
          },
        ],
      },
    ];

    // Set the cursor on the first list item
    Transforms.select(baseEditor, {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    });

    // Simulate the backspace key
    listBlocks['list-unordered'].handleBackspaceKey?.(
      baseEditor,
      mockEvent as unknown as React.KeyboardEvent<HTMLDivElement>
    );

    // Should convert the first list item in a paragraph
    expect(baseEditor.children).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'text',
          },
        ],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'bold',
                bold: true,
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'italic',
                italic: true,
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'mixed ',
              },
              {
                type: 'text',
                text: 'text',
                underline: true,
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'inline ',
              },
              {
                type: 'text',
                text: 'code',
                code: true,
              },
            ],
          },
        ],
      },
    ]);

    // Set the cursor on the new first list item
    Transforms.select(baseEditor, {
      anchor: { path: [1, 0, 0], offset: 0 },
      focus: { path: [1, 0, 0], offset: 0 },
    });

    // Simulate the backspace key
    listBlocks['list-unordered'].handleBackspaceKey?.(
      baseEditor,
      mockEvent as unknown as React.KeyboardEvent<HTMLDivElement>
    );

    // Should convert the first list item in a paragraph
    expect(baseEditor.children).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'text',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'bold',
            bold: true,
          },
        ],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'italic',
                italic: true,
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'mixed ',
              },
              {
                type: 'text',
                text: 'text',
                underline: true,
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'inline ',
              },
              {
                type: 'text',
                text: 'code',
                code: true,
              },
            ],
          },
        ],
      },
    ]);
  });

  it('disables modifiers when creating a new node with enter key in a list item', () => {
    const baseEditor = createEditor();
    baseEditor.children = [
      {
        type: 'list',
        format: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'Line of text with modifiers',
                bold: true,
                italic: true,
              },
            ],
          },
        ],
      },
    ];

    // Set the cursor at the end of the block with modifiers
    Transforms.select(baseEditor, {
      anchor: Editor.end(baseEditor, []),
      focus: Editor.end(baseEditor, []),
    });

    // Simulate the enter key
    listBlocks['list-unordered'].handleEnterKey?.(baseEditor);

    // Should insert a new list item without modifiers
    expect(baseEditor.children).toEqual([
      {
        type: 'list',
        format: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: 'Line of text with modifiers',
                bold: true,
                italic: true,
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                type: 'text',
                text: '',
              },
            ],
          },
        ],
      },
    ]);
  });
});
