import React, { Component } from "react";

class Details extends Component {
  state = {};
  render() {
    return (
      <div className="up-container d-flex flex-column container-fluid">
        <div className="up mx-auto">
          {this.getDetails()}
        </div>
      </div>
    );
  }
  getDetails = () => {
    const { branch, college, course, sem } = this.props.details;
    return (

      <>
        <div className="ann-preview" style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
          <h3><span role="img" className="emoji" aria-label="announcement">🎓</span></h3>
        </div>
        <div className="ann-info text-left">
          <p>
            Branch: <strong>{branch}</strong>
          </p>
          <p>
            College: <strong>{college}</strong>
          </p>
          <p>
            Course: <strong>{course}</strong>
          </p>
          <p>
            Semester: <strong>{sem}</strong>
          </p>          
        </div>
      </>
    );
  };
}

export default Details;
