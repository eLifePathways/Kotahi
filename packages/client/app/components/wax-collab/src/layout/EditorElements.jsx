/* stylelint-disable selector-type-no-unknown, no-descending-specificity */
/* stylelint-disable color-function-notation, alpha-value-notation */

import { css } from 'styled-components'
import { grid, th } from '@coko/client'
import lightenBy from '../../../../shared/lightenBy'
import { color } from '../../../../theme'

// This should only include styles specific to the editor */
/* Styles that are purely presentational for text should be in textStyles.css */

const EditorStyles = css`
  /* stylelint-disable selector-class-pattern */

  /* include textStyles here */
  ${props => props.theme.textStyles}

  .ProseMirror {
    background: unset;
    counter-reset: footnote;
    font-family: ${props => props.theme.fontReading};
    white-space: pre-wrap;

    &:focus {
      outline: none;
    }

    & p:first-child,
    & h1:first-child,
    & h2:first-child,
    & h3:first-child,
    & h4:first-child,
    & h5:first-child,
    & h6:first-child {
      margin-top: 0;
    }

    strong {
      font-weight: bold;
    }

    em {
      font-style: italic;
    }
  }

  .ProseMirror footnote {
    align-items: center;
    background: ${lightenBy(color.brand1.base(), 0.7)};
    border-radius: ${grid(2)};
    color: ${color.brand1.shade50};
    cursor: pointer;
    display: inline-flex;
    height: ${grid(4)};
    justify-content: center;
    line-height: 0;
    min-width: ${grid(4)};
    vertical-align: top;

    &:hover {
      background: ${color.brand1.tint25};
    }

    ::after {
      bottom: 0;
      content: counter(footnote);
      counter-increment: footnote;
      font-size: ${grid(3)};
    }
  }

  .column-resize-handle {
    background-color: #adf;
    bottom: 0;
    pointer-events: none;
    position: absolute;
    right: -2px;
    top: 0;
    width: 4px;
    z-index: 20;
  }

  .ProseMirror.resize-cursor {
    cursor: col-resize;
  }

  .ProseMirror u {
    /* stylelint-disable-next-line declaration-no-important */
    text-decoration: underline !important;
  }

  /* Give selected cells a blue overlay */
  .selectedCell::after {
    background: rgb(200 200 255 / 40%);
    bottom: 0;
    content: '';
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 2;
  }

  /* placeholder */
  .empty-node::before {
    color: ${color.gray60};
    float: left;
    font-style: italic;
    height: 0;
    pointer-events: none;
  }

  p.empty-node:first-child::before {
    content: attr(data-content);
  }

  /* invisible characters */
  .invisible {
    pointer-events: none;
    user-select: none;
  }

  .invisible::before {
    caret-color: inherit;
    color: ${color.gray50};
    display: inline-block;
    font-style: normal;
    font-weight: 400;
    line-height: 1em;
    width: 0;
  }

  .invisible--space::before {
    content: '·';
  }

  .invisible--break::before {
    content: '¬';
  }

  .invisible--par::after {
    content: '¶';
  }

  span.deletion {
    color: red;
    text-decoration: line-through;
  }

  span.insertion {
    color: blue;
  }

  .selected-insertion,
  .selected-deletion,
  .selected-format-change,
  .selected-block-change {
    background-color: #fffacf;
  }

  .format-change {
    border-bottom: 2px solid blue;
  }

  [data-track] {
    position: relative;
  }

  [data-track]::before {
    border-left: 2px solid blue;
    content: '';
    height: 100%;
    left: -10px;
    position: absolute;
  }

  li[data-track]::before,
  li [data-track]::before {
    left: -5px;
  }

  .insertion .show-insertion {
    color: ${th('colorText')};
  }

  .deletion .hide-deletion {
    display: none;
  }

  span.comment {
    border-bottom: 2px solid #ffab20;
    border-radius: 3px 3px 0 0;
  }

  code {
    font-family: monospace;
  }

  .small-caps {
    font-variant: small-caps;
  }

  a {
    color: blue;
  }

  /* == Math Nodes ======================================== */

  .math-node {
    cursor: auto;
    font-family: Consolas, 'Ubuntu Mono', monospace;
    font-size: 16px;
    min-height: 1em;
    min-width: 1em;
    position: relative;
    top: 7px;

    .ProseMirror {
      background: #eee;
      box-shadow: none;
      color: rgb(132, 33, 162);
      min-height: 100%;
      padding: 0;
    }
  }

  p .math-node {
    margin-right: 4px;
  }

  .math-node.empty-math .math-render::before {
    color: red;
    content: '(empty)';
  }

  .math-node .math-render.parse-error::before {
    color: red;
    content: '(math error)';
    cursor: help;
  }

  [data-mml-node='merror'] > g {
    fill: red;
    stroke: red;
  }

  [data-mml-node='merror'] > rect[data-background] {
    fill: yellow;
    stroke: none;
  }

  /* -- Inline Math --------------------------------------- */

  math-inline {
    display: inline-block;
    max-width: 765px;
    overflow-x: auto;
    white-space: nowrap;
  }

  math-inline .math-render {
    cursor: pointer;
    display: inline-block;
    font-size: 0.85em;
  }

  math-inline .math-src .ProseMirror {
    display: inline;
  }

  math-inline .math-src::after,
  math-inline .math-src::before {
    color: #b0b0b0;
    content: '$';
  }

  /* -- Block Math ---------------------------------------- */

  math-display {
    display: block;
    max-width: 765px;
    overflow-x: auto;
  }

  math-display .math-render {
    display: block;
    text-align: center;
  }

  math-display.ProseMirror-selectednode {
    background-color: #eee;
  }

  math-display .math-src .ProseMirror {
    display: block;
    width: 100%;
  }

  math-display .math-src::after,
  math-display .math-src::before {
    color: #b0b0b0;
    content: '$$';
    text-align: left;
  }

  math-display .katex-display {
    margin: 0;
  }

  /* -- Other Math ---------------------------------------- */

  .math-node.ProseMirror-selectednode {
    outline: none;
  }

  .math-node .math-src {
    color: rgb(132, 33, 162);
    display: none;
    tab-size: 4;
  }

  .math-node.ProseMirror-selectednode .math-src {
    display: flex;
  }

  .math-node.ProseMirror-selectednode .math-render {
    display: none;
  }

  /* -- Selection Plugin ---------------------------------- */

  p::selection,
  p > *::selection {
    background-color: #c0c0c0;
  }

  .katex-html *::selection {
    /* stylelint-disable-next-line declaration-no-important */
    background-color: none !important;
  }

  .math-inline.math-select .math-render {
    padding-top: 2px;
  }

  .math-node.math-select .math-render {
    background-color: #c0c0c0ff;
  }

  span[data-type='inline'] {
    display: inline;
    font-weight: 500;
  }

  span[data-type='inline']::before {
    color: #006f19;
    content: ' | ';
    font-weight: 600;
    margin-left: 0;
  }

  span[data-type='inline']::after {
    color: #006f19;
    content: ' | ';
    display: inline;
    font-weight: 600;
  }

  p[data-type='block'] {
    display: block;
    margin-top: 1em;
  }

  p[data-type='block']::before {
    color: #006f19;
    content: '⌜';
    display: inline;
    font-size: 22px;
    font-weight: 600;
    left: 6px;
    position: relative;
    top: 2px;
  }

  p[data-type='block']::after {
    color: #006f19;
    content: '⌟';
    display: inline;
    font-size: 22px;
    font-weight: 600;
    position: relative;
    right: 6px;
    top: 5px;
  }

  .transform-icon {
    transform: rotate(40deg);
  }

  /* JATS */

  section.frontmatter {
    background-color: #eee;
    border: 1px solid #ccc;
    border-radius: 0 4px 4px 0;
    margin: 16px 0;
    padding: 4px 8px;
    position: relative;

    &::before {
      background-color: ${th('colorFrontMatter')};
      border: 1px solid #ccc;
      border-radius: 4px;
      content: '';
      height: calc(100% + 2px);
      left: -4px;
      position: absolute;
      top: -1px;
      width: 8px;
    }

    & > :last-child {
      margin-bottom: 0;
    }
  }

  section.abstractSection {
    background-color: #eee;
    border: 1px solid #ccc;
    border-radius: 0 4px 4px 0;
    margin: 16px 0;
    padding: 4px 8px;
    position: relative;

    &::before {
      background-color: ${th('colorAbstract')};
      border: 1px solid #ccc;
      border-radius: 4px;
      content: '';
      height: calc(100% + 2px);
      left: -4px;
      position: absolute;
      top: -1px;
      width: 8px;
    }

    & > :last-child {
      margin-bottom: 0;
    }
  }

  section.reflist {
    background-color: #eee;
    border: 1px solid #ccc;
    border-radius: 0 4px 4px 0;
    margin: 16px 0;
    padding: 4px 8px;
    position: relative;

    &::before {
      background-color: ${th('colorCitation')};
      border: 1px solid #ccc;
      border-radius: 4px;
      content: '';
      height: calc(100% + 2px);
      left: -4px;
      position: absolute;
      top: -1px;
      width: 8px;
    }

    & > :last-child {
      margin-bottom: 0;
    }

    & p:not(.ref) {
      --citationColorValues: ${th('colorCitation')};
      --citationTextColor: black;
      --citationOffset: 2px;
      border-radius: 2px;
      outline: var(--citationColorValues) 1px solid;
      outline-offset: var(--citationOffset);
      position: relative;
      transition: 0.25;

      & .mixed-citation {
        outline: none;
      }

      &::before {
        /* content: '§ '; */
      }
    }
  }

  .reflist h1,
  .reflist h2,
  .reflist h3,
  .reflist h4,
  .reflist h5,
  .reflist h6 {
    font-size: 18px;
    font-weight: bold;
    margin: 0 0 8px;
  }

  section.acknowledgementsSection {
    background-color: #eee;
    border: 1px solid #ccc;
    border-radius: 0 4px 4px 0;
    margin: 16px 0;
    padding: 4px 8px;
    position: relative;

    &::before {
      background-color: ${th('colorAcknowledgements')};
      border: 1px solid #ccc;
      border-radius: 4px;
      content: '';
      height: calc(100% + 2px);
      left: -4px;
      position: absolute;
      top: -1px;
      width: 8px;
    }

    & > :last-child {
      margin-bottom: 0;
    }
  }

  section.appendix {
    background-color: #eee;
    border: 1px solid #ccc;
    border-radius: 0 4px 4px 0;
    margin: 16px 0;
    padding: 4px 8px;
    position: relative;

    &::before {
      background-color: ${th('colorAppendix')};
      border: 1px solid #ccc;
      border-radius: 4px;
      content: '';
      height: calc(100% + 2px);
      left: -4px;
      position: absolute;
      top: -1px;
      width: 8px;
    }

    & > :last-child {
      margin-bottom: 0;
    }
  }

  .appendix h1,
  .appendix h2,
  .appendix h3,
  .appendix h4,
  .appendix h5,
  .appendix h6 {
    font-size: 18px;
    font-weight: bold;
    margin: 0 0 8px;
  }

  /* added for figure weirdness */

  figure {
    border: 1px solid ${color.brand1.base};
    margin-bottom: 1rem;
    padding: 1rem;
    position: relative;
  }

  figure::before {
    color: ${color.brand1.base};
    content: 'Figure:';
    font-size: 75%;
    left: 0;
    letter-spacing: 0.5px;
    position: absolute;
    text-transform: uppercase;
    top: -1.25rem;
  }

  figure:hover::before {
    content: 'Click to add a caption';
  }

  figcaption {
    border: 1px solid ${color.brand1.base};
    margin-top: 1rem;
    min-width: 600px; /* in case there's no image, so the caption doesn't get squished */
    padding: 1rem;
    position: relative;
  }

  figcaption::before {
    color: ${color.brand1.base};
    content: 'Caption:';
    font-size: 75%;
    left: 0;
    letter-spacing: 0.5px;
    position: absolute;
    text-transform: uppercase;
    top: -1.25rem;
  }

  /* FUNDING SOURCE */

  .fundingsource,
  .fundingstatement,
  .awardid {
    --fundingColorValues: ${th('colorFunding')};
    --fundingOffset: 2px;
    border-radius: 2px;
    outline: ${th('colorFunding')} 1px solid;
    outline-offset: var(--fundingOffset);
    transition: 0.25;
  }

  .fundingsource {
    --fundingColorValues: ${th('colorFundingSource')};

    &:hover {
      outline-color: var(--fundingColorValues);
    }
  }

  .fundingstatement {
    --fundingColorValues: ${th('colorFundingStatement')};

    &:hover {
      outline-color: var(--fundingColorValues);
    }
  }

  .awardid {
    --fundingColorValues: ${th('colorAwardId')};

    &:hover {
      outline-color: var(--fundingColorValues);
    }
  }

  .show-fundingsource .fundingsource {
    outline: var(--fundingColorValues) 2px solid;
  }

  .show-fundingstatement .fundingstatement {
    outline: var(--fundingColorValues) 2px solid;
  }

  .show-awardid .awardid {
    outline: var(--fundingColorValues) 2px solid;
  }

  /* CITATIONS */

  span.mixed-citation {
    --citationColorValues: ${th('colorCitation')};
    --citationTextColor: black;
    --citationOffset: 2px;
    border-radius: 2px;
    display: block;
    outline: var(--citationColorValues) 1px solid;
    outline-offset: var(--citationOffset);
    position: relative;
    transition: 0.25;
  }

  span.citation-label {
    --citationColorValues: ${th('colorCitationLabel')};
    --citationTextColor: white;
  }

  span.article-title {
    --citationColorValues: ${th('colorArticleTitle')};
    --citationTextColor: white;
  }

  span.journal-title {
    --citationColorValues: ${th('colorJournalTitle')};
    --citationTextColor: white;
    font-style: italic;
  }

  span.author-group {
    --citationColorValues: ${th('colorAuthorGroup')};
    --citationOffset: 4px;
    --citationTextColor: white;
  }

  span.author-name {
    --citationColorValues: ${th('colorAuthorName')};
    --citationTextColor: white;
  }

  a.doi {
    --citationColorValues: ${th('colorDoi')};
    --citationTextColor: white;
  }

  span.volume {
    --citationColorValues: ${th('colorVolume')};
    --citationTextColor: white;
  }

  span.issue {
    --citationColorValues: ${th('colorIssue')};
    --citationTextColor: white;
  }

  span.first-page {
    --citationColorValues: ${th('colorFirstPage')};
    --citationTextColor: white;
  }

  span.last-page {
    --citationColorValues: ${th('colorLastPage')};
    --citationTextColor: white;
  }

  span.year {
    --citationColorValues: ${th('colorYear')};
    --citationTextColor: white;
  }

  span.article-title,
  span.journal-title,
  span.citation-label,
  span.author-group,
  span.author-name,
  span.volume,
  span.issue,
  span.year,
  span.first-page,
  span.last-page,
  a.doi {
    --citationColorValues: transparent;
    --citationTextColor: black;
    --citationOffset: 2px;
    border-radius: 2px;
    outline: ${th('colorCitation')} 1px solid;
    outline-offset: var(--citationOffset);
    position: relative;

    &::before {
      background-color: var(--citationColorValues);
      border-radius: 100%;
      content: '';
      display: none;
      height: 4px;
      left: -2px;
      position: absolute;
      top: -2px;
      width: 4px;
    }

    &:hover {
      outline-color: var(--citationColorValues);
    }
  }

  .hide-citation-spans span,
  .hide-citation-spans a {
    /* stylelint-disable-next-line declaration-no-important */
    --citationColorValues: transparent !important;
    /* stylelint-disable-next-line declaration-no-important */
    --citationTextColor: transparent !important;
  }

  .show-article-title .article-title {
    outline: ${th('colorArticleTitle')} 2px solid;
  }

  .show-journal-title .journal-title {
    outline: ${th('colorJournalTitle')} 2px solid;
  }

  .show-citation-label .citation-label {
    outline: ${th('colorCitationLabel')} 2px solid;
  }

  .show-author-group .author-group {
    outline: ${th('colorAuthorGroup')} 2px solid;
  }

  .show-author-name .author-name {
    outline: ${th('colorAuthorName')} 2px solid;
  }

  .show-volume .volume {
    outline: ${th('colorVolume')} 2px solid;
  }

  .show-issue .issue {
    outline: ${th('colorIssue')} 2px solid;
  }

  .show-year .year {
    outline: ${th('colorYear')} 2px solid;
  }

  .show-first-page .first-page {
    outline: ${th('colorFirstPage')} 2px solid;
  }

  .show-last-page .last-page {
    outline: ${th('colorLastPage')} 2px solid;
  }

  .show-doi a.doi {
    outline: ${th('colorDoi')} 2px solid;
  }

  /* keywords */

  .keyword-list {
    --keywordColorValues: transparent;
    --keywordOffset: 2px;
    border-radius: 2px;
    outline: ${th('colorKeyword')} 1px solid;
    outline-offset: var(--fundingOffset);
    transition: 0.25;
  }

  span.keyword {
    --keywordColorValues: transparent;
    --keywordTextColor: black;
    --keywordOffset: 2px;
    border-radius: 2px;
    font-weight: bold;
    outline: ${th('colorKeyword')} 1px solid;
    outline-offset: var(--keywordOffset);
    position: relative;

    &::before {
      background-color: var(--keywordColorValues);
      border-radius: 100%;
      content: '';
      display: none;
      height: 4px;
      left: -2px;
      position: absolute;
      top: -2px;
      width: 4px;
    }

    /* &:hover {
       outline-color: var(--keywordColorValues);
    } */
  }

  /* glossary */

  section.glossary {
    background-color: #eee;
    border: 1px solid #ccc;
    border-radius: 0 4px 4px 0;
    margin: 16px 0;
    padding: 4px 8px;
    position: relative;

    &::before {
      background-color: ${th('colorGlossary')};
      border: 1px solid #ccc;
      border-radius: 4px;
      content: '';
      height: calc(100% + 2px);
      left: -4px;
      position: absolute;
      top: -1px;
      width: 8px;
    }

    & > :last-child {
      margin-bottom: 0;
    }
  }

  .glossary h1,
  .glossary h2,
  .glossary h3,
  .glossary h4,
  .glossary h5,
  .glossary h6 {
    font-size: 18px;
    font-weight: bold;
    margin: 0 0 8px;
  }

  .glossary-term {
    font-weight: bold;
  }
`

export default EditorStyles
