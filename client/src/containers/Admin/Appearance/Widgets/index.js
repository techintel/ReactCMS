import MarkdownHtml from './MarkdownHtml';
import { Menu } from './Menu/';

export const AVAILABLE_WIDGETS = [
  {
    type: 'markdown',
    name: 'Markdown',
    Component: MarkdownHtml,
  },
  {
    type: 'html',
    name: 'HTML',
    Component: MarkdownHtml,
  },
  {
    type: 'menu',
    name: 'Navigation Menu',
    Component: Menu,
  },
];
