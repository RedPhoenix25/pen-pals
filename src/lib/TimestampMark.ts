import { Mark, mergeAttributes } from '@tiptap/core';

export interface TimestampOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    timestampMark: {
      setTimestamp: (attributes?: { time?: string; author?: string }) => ReturnType;
      unsetTimestamp: () => ReturnType;
    };
  }
}

export const TimestampMark = Mark.create<TimestampOptions>({
  name: 'timestampMark',

  inclusive: true,

  addAttributes() {
    return {
      time: {
        default: null,
        parseHTML: element => element.getAttribute('data-timestamp'),
        renderHTML: attributes => {
          if (!attributes.time) return {};
          return { 'data-timestamp': attributes.time };
        },
      },
      author: {
        default: null,
        parseHTML: element => element.getAttribute('data-author'),
        renderHTML: attributes => {
          if (!attributes.author) return {};
          return { 'data-author': attributes.author };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-timestamp]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'word-timestamp-node' }), 0];
  },
});
