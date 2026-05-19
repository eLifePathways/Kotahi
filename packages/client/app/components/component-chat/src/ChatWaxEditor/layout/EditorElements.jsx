import { css } from 'styled-components'
import { color } from '../../../../../theme'

/* All styles regarding ProseMirror surface and elements */

export default css`
  /* stylelint-disable selector-class-pattern */

  h1 {
    font-size: 1.75em;
    font-weight: 500;
    margin: 1em 0;
  }

  h2 {
    font-size: 1.625em;
    font-weight: 500;
    margin: 1em 0;
  }

  h3 {
    font-size: 1.5em;
    font-weight: 500;
    margin: 1em 0;
  }

  h4 {
    font-size: 1.375em;
    font-weight: 500;
    margin: 1em 0;
  }

  h5 {
    font-size: 1.25em;
    font-weight: 500;
    margin: 1em 0;
  }

  h6 {
    font-size: 1.125em;
    font-weight: 500;
    margin: 1em 0;
  }

  /* JATS */

  section.frontmatter {
    background-color: rgb(255 0 0 / 25%);
    border: 1px solid red;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &::before {
      color: white;
      content: 'FRONT MATTER';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
  }

  section.abstractSection {
    background-color: rgb(255 0 0 / 25%);
    border: 1px solid red;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &::before {
      color: white;
      content: 'ABSTRACT';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
  }

  section.reflist {
    background-color: rgb(25 25 112 / 25%);
    border: 1px solid midnightblue;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &::before {
      color: white;
      content: 'REFERENCE LIST';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }

    & p:not(.ref),
    & li {
      &::before {
        content: '§ ';
      }
    }
  }

  section.acknowledgementsSection {
    background-color: rgb(255 255 0 / 25%);
    border: 1px solid red;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &::before {
      color: black;
      content: 'ACKNOWLEDGEMENTS';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
  }

  section.appendix {
    background-color: rgb(0 128 128 / 25%);
    border: 1px solid teal;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &::before {
      color: white;
      content: 'APPENDIX';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
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

  .ProseMirror p:first-child,
  .ProseMirror h1:first-child,
  .ProseMirror h2:first-child,
  .ProseMirror h3:first-child,
  .ProseMirror h4:first-child,
  .ProseMirror h5:first-child,
  .ProseMirror h6:first-child {
    margin-top: 0;
  }

  /* stylelint-disable-next-line selector-type-no-unknown */
  .ProseMirror fakecursor {
    /* stylelint-disable-next-line declaration-no-important */
    visibility: hidden !important;
  }
`
