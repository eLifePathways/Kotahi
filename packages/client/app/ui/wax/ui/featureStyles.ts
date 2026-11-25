/* stylelint-disable selector-type-no-unknown, selector-class-pattern, no-descending-specificity */
/* stylelint-disable declaration-no-important, color-function-notation, alpha-value-notation, font-family-name-quotes */

import { css } from 'styled-components'
import { th } from '@coko/client'

const featureStyles = css`
  /* block quote */

  :where(&) blockquote {
    padding-left: 1em;
    border-left: 3px solid #eee;
    margin-left: 0;
    margin-right: 0;
  }

  /* lists */

  :where(&) ul,
  :where(&) ol {
    padding-left: 30px;
  }

  :where(&) .strikethrough {
    text-decoration: line-through;
  }

  /* subscript*/

  :where(&) sub {
    line-height: 0;
  }

  /* superscript */

  :where(&) sup {
    line-height: 0;
  }

  /* Image Styles */

  :where(&) figure {
    display: table;
    margin-left: auto;
    margin-right: auto;
    word-break: break-word;
  }

  :where(&) figure img {
    cursor: default;
    height: auto;
    max-width: 100%;
    width: auto;
  }

  :where(&) figcaption {
    background: #e2ebff;
    caption-side: bottom;
    display: table-caption;
    max-width: 100%;
    min-height: 20px;
    padding: 4px;
    width: auto;
  }

  :where(&) figcaption:focus {
    outline: none;
  }

  :where(&) figcaption:before {
    content: 'Caption: ';
    font-weight: bold;
  }

  :where(&) placeholder:before {
    position: relative;
    top: 3px;
    content: url("data:image/svg+xml; utf8, <svg xmlns='http://www.w3.org/2000/svg' fill='%23525E76' height='24' width='24'><path d='M5.5 21q-1.05 0-1.775-.725Q3 19.55 3 18.5v-13q0-1.05.725-1.775Q4.45 3 5.5 3h13q1.05 0 1.775.725Q21 4.45 21 5.5v13q0 1.05-.725 1.775Q19.55 21 18.5 21Zm0-1h13q.625 0 1.062-.438Q20 19.125 20 18.5v-13q0-.625-.438-1.062Q19.125 4 18.5 4h-13q-.625 0-1.062.438Q4 4.875 4 5.5v13q0 .625.438 1.062Q4.875 20 5.5 20Zm1.7-3 2.8-2.8 1.85 1.825L14 13.3l2.95 3.7Zm1.3-7.5q-.625 0-1.062-.438Q7 8.625 7 8t.438-1.062Q7.875 6.5 8.5 6.5t1.062.438Q10 7.375 10 8t-.438 1.062Q9.125 9.5 8.5 9.5Z' /></svg>");
  }

  /* Tables */

  :where(&) table {
    border: 1px solid #eee;
    border-collapse: initial;
    border-spacing: 0;
    border-width: 0 thin thin 0;
    margin: 0;
    overflow: hidden;
    page-break-inside: avoid;
    table-layout: fixed;
    width: 100%;
  }

  :where(&) table > caption {
    background-color: #535e76;
    color: white;
    font-weight: bold;
    */;
  }

  :where(&) th,
  :where(&) td {
    border: 1px solid #eee;
    */
  padding: 2px 5px;
    vertical-align: top;
    box-sizing: border-box;
    position: relative;
  }

  :where(&) .tableWrapper {
    overflow-x: scroll;
  }

  :where(&) .column-resize-handle {
    background-color: #adf;
    bottom: 0;
    pointer-events: none;
    position: absolute;
    right: -2px;
    top: 0;
    width: 4px;
    z-index: 20;
  }

  :where(&) .ProseMirror.resize-cursor,
  :where(&).ProseMirror.resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }

  /* Give selected cells a blue overlay */

  :where(&) .selectedCell:after {
    background: rgba(200, 200, 255, 0.4);
    bottom: 0;
    content: '';
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 2;
  }

  /* FootNote */

  :where(&) .ProseMirror,
  :where(&).ProseMirror {
    counter-reset: footnote !important;
  }

  :where(&) .ProseMirror footnote,
  :where(&).ProseMirror footnote {
    font-variant-numeric: lining-nums proportional-nums;
    display: inline-block;
    text-align: center;
    width: 17px;
    height: 17px;
    background: white;
    border-bottom: 2px solid black;
    color: black;
    cursor: pointer;
  }

  :where(&) .ProseMirror footnote::after,
  :where(&).ProseMirror footnote::after {
    content: counter(footnote);
    position: relative;
    bottom: 2px;
    font-size: ${th('fontSizeBase')};
    counter-increment: footnote;
  }

  /* Comments */

  :where(&) span.comment {
    border-bottom: 2px solid gold;
    border-radius: 3px 3px 0 0;
  }

  :where(&) .active-comment {
    background-color: gold;
    */;
  }

  /* find and Replace */

  :where(&) span.search-result {
    background: #bee594;
  }

  /*Track Changes*/

  :where(&) span.deletion {
    text-decoration: line-through;
    color: indianred;
  }

  :where(&) .ProseMirror span.deletion footnote,
  :where(&).ProseMirror span.deletion footnote {
    background: indianred;
  }

  :where(&) span.insertion {
    color: royalblue;
  }

  :where(&) .ProseMirror span.insertion footnote,
  :where(&).ProseMirror span.insertion footnote {
    background: royalblue;
  }

  :where(&) .selected-insertion {
    background-color: rgb(238, 251, 251);
  }

  :where(&) .selected-deletion {
    background: rgb(250, 240, 240);
  }

  :where(&) .selected-format-change,
  :where(&) .selected-block-change {
    background-color: #eefbfb;
  }

  :where(&) .format-change {
    border-bottom: 2px solid royalblue;
  }

  :where(&) [data-track] {
    position: relative;
  }

  :where(&) [data-track]::before {
    content: '';
    position: absolute;
    border-left: 2px solid royalblue;
    left: -10px;
    height: 100%;
  }

  :where(&) .insertion .show-insertion {
    color: black;
  }

  :where(&) .deletion .hide-deletion {
    display: none;
  }

  :where(&) li[data-track]::before,
  :where(&) li [data-track]::before {
    left: -5px;
  }

  :where(&) div[contenteditable='false'] .math-src {
    pointer-events: none;
    user-select: none;
  }

  /* == Math Nodes ======================================== */

  :where(&) .math-node {
    min-width: 1em;
    min-height: 1em;
    font-size: 0.95em;
    font-family: 'Consolas', 'Ubuntu Mono', monospace;
    cursor: auto;
  }

  :where(&) .ProseMirror .math-node .ProseMirror,
  :where(&).ProseMirror .math-node .ProseMirror {
    box-shadow: none;
    min-height: 100%;
    padding: 0;
    background: #eee;
    color: rgb(132, 33, 162);
  }

  :where(&) .math-node.empty-math .math-render::before {
    content: '(empty)';
    color: red;
  }

  :where(&) .math-node .math-render.parse-error::before {
    content: '(math error)';
    color: red;
    cursor: help;
  }

  :where(&) .math-node.ProseMirror-selectednode {
    outline: none;
  }

  :where(&) .math-node .math-src {
    color: rgb(132, 33, 162);
    display: none;
    tab-size: 4;
  }

  :where(&) .math-node.ProseMirror-selectednode .math-src {
    display: flex;
  }

  :where(&) .math-node.ProseMirror-selectednode .math-render {
    display: none;
  }

  /* -- Inline Math --------------------------------------- */

  :where(&) math-inline {
    display: inline;
    white-space: nowrap;
  }

  :where(&) math-inline .math-render {
    display: inline-block;
    font-size: 0.85em;
    cursor: pointer;
  }

  :where(&) math-inline .math-src .ProseMirror {
    display: inline;
  }

  :where(&) math-inline .math-src::after,
  :where(&) math-inline .math-src::before {
    content: '$';
    color: #b0b0b0;
  }

  /* -- Block Math ---------------------------------------- */

  :where(&) math-display {
    display: block;
  }

  :where(&) math-display .math-render {
    display: block;
    text-align: center;
  }

  :where(&) math-display.ProseMirror-selectednode {
    background-color: #eee;
  }

  :where(&) math-display .math-src .ProseMirror {
    width: 100%;
    display: block;
  }

  :where(&) math-display .math-src::after,
  :where(&) math-display .math-src::before {
    content: '$$';
    text-align: left;
    color: #b0b0b0;
  }

  :where(&) .fade-in {
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
  }

  :where(&) .fade-in.show {
    opacity: 1;
  }

  :where(&) .ask-ai-selection {
    background-color: #0000;
  }

  :where(&) hr {
    border: none;
    margin: 1em 0;
    padding: 2px 10px;
  }

  :where(&) hr::after {
    background-color: silver;
    content: '';
    display: block;
    height: 1px;
    line-height: 2px;
  }

  :where(&) .invisible {
    pointer-events: none;
    user-select: none;
  }

  :where(&) .invisible::before {
    caret-color: inherit;
    color: gray;
    display: inline-block;
    font-style: normal;
    font-weight: 400;
    line-height: 1em;
    width: 0;
  }

  :where(&) .invisible--space::before {
    content: '·';
  }

  :where(&) .invisible--break::before {
    content: '¬';
  }

  :where(&) .invisible--par::after {
    content: '¶';
  }

  :where(&) .math-node.math-select .math-render {
    background-color: #c0c0c0ff;
  }

  :where(&) math-inline.math-select .math-render {
    padding-top: 2px;
  }

  :where(&) span[data-type='inline'] {
    display: inline;
    font-weight: 500;
  }

  :where(&) span[data-type='inline']::before {
    color: #006f19;
    content: ' | ';
    font-weight: 600;
    margin-left: 0;
  }

  :where(&) span[data-type='inline']::after {
    color: #006f19;
    content: ' | ';
    display: inline;
    font-weight: 600;
  }

  :where(&) p[data-type='block'] {
    display: block;
    margin-top: 1em;
  }

  :where(&) p[data-type='block']::before {
    color: #006f19;
    content: '⌜';
    display: inline;
    font-size: ${th('fontSizeHeading4')};
    font-weight: 600;
    left: 6px;
    position: relative;
    top: 2px;
  }

  :where(&) p[data-type='block']::after {
    color: #006f19;
    content: '⌟';
    display: inline;
    font-size: ${th('fontSizeHeading4')};
    font-weight: 600;
    position: relative;
    right: 6px;
    top: 5px;
  }

  :where(&) .transform-icon {
    transform: rotate(40deg);
  }
`

export default featureStyles
