import React from 'react';
import LazyLoad from 'react-lazy-load';
import { ImageLoader } from '../components/ImageLoader.js';

export default class Error extends React.Component {
  static getInitialProps({ res, err }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null;
    return { statusCode }
  }

  render() {
    if(this.props.statusCode == 404) {
      return (
        <React.Fragment>
          <span className="err-txt">That File Was Not Found On The Server! Please Keep Looking Or Move On</span>
          <a href="https://thecatapi.com">
            <LazyLoad debounce={false} offsetVertical={500} >
                  <ImageLoader src="https://thecatapi.com/api/images/get?format=src&type=gif&api_key=MzIxMDE1" />
            </LazyLoad>
          </a>


        </React.Fragment>
      )
    } else {
      return (
        <span className="err-txt">{this.props.statusCode
          ? `An error ${this.props.statusCode} occurred on server`
          : 'An error occurred on client'}</span>
      )
    }
  }
}
