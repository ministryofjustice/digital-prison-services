import styled from 'styled-components'
import { media } from './style-utils'

export const PrevNextNavContainer = styled('nav')`
  display: ${(props) => (props.show ? 'block' : 'none')};
`

export const PrevNextNavWrapper = styled('ul')`
  display: flex;
  flex-direction: row;
  margin: auto;
  width: 100%;
  padding: 0px;
  margin-top: 30px;

  li {
    line-height: 1.11111;
    width: 50%;
  }

  li div {
    font-size: 20px;
    color: #005ea5;
  }

  li div:hover {
    background: #f8f8f8;
    cursor: pointer;
  }
`

export const PrevNavigatorRegion = styled('li')`
  float: left;

  div {
    display: ${(props) => (props.show ? 'block' : 'none')};
    padding: 15px 0 15px 35px;
  }

  div:before {
    background: transparent url('/images/navigation-arrow-sprite.png') no-repeat -20px -11px;
    margin: -4px 0 0 -32px;
    display: block;
    float: left;
    width: 30px;
    height: 38px;
    content: ' ';
  }
`

export const NavigatorContent = styled('div')`
  ${media.desktop`font-size: 27px !important;`};
`

export const NextNavigatorRegion = styled('li')`
  float: right;
  text-align: right;

  div {
    display: ${(props) => (props.show ? 'block' : 'none')};
    padding: 15px 35px 15px 0;
  }

  div:before {
    background: transparent url('/images/navigation-arrow-sprite.png') no-repeat -102px -11px;
    margin: -4px -32px 0 0;
    display: block;
    float: right;
    width: 30px;
    height: 38px;
    content: ' ';
  }
`

export const VisuallyHiddenSpan = styled('span')`
  position: absolute;
  left: -9999em;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
`

export const PageNumbers = styled('span')`
  display: block;
  font-size: 12px;
  line-height: 1.25;
  padding-top: 6px;
  padding-bottom: 4px;

  ${media.desktop`
    font-size: 14px;
    line-height: 1.42857;
  `};
`
