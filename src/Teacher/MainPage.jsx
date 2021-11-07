import React, { Component } from "react";
import Details from "./Details";
import Class from "./Class";
import Lecture from "./Lecture";
import AddLecture from "./AddLecture";
import firebase from "../firebase";
import BottomNav from "../BottomNav/bnav";
import DarkToggle from "../DarkToggle/DarkToggle";
import M from "materialize-css";
import ClassDetails from "./ClassDetails";

let db = firebase.firestore();

class MainPage extends Component {
  isMount = false;
  state = {
    classesTeaching: [],
    details: [],
    lecturesToday: [],
    user: firebase.auth().currentUser,
    loading: true,
    showDetails: false,
    classId: null,
  };

  claRef = db.collection("classes");
  teachRef = db.collection("teachers").doc(this.state.user.email);
  teachClassRef = this.teachRef.collection("classes");

  handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        M.toast({ html: "Signed Out", classes: "toast success-toast" });
        window.location.reload();
      })
      .catch((err) => {
        M.toast({ html: err.message, classes: "toast error-toast" });
      });
  };

  // extracting data from db
  componentDidMount() {
    // only data fetch
    this.isMount = true;
    this.teachRef.onSnapshot((teacher) => {
      if (this.isMount) {
        this.setState({
          details: teacher.data().details,
          loading: false,
        });
      }
    });
    this.teachClassRef.onSnapshot((querySnapshot) => {
      querySnapshot.docs.forEach((classTeaching) => {
        let { classesTeaching } = this.state;
        classesTeaching.push(classTeaching.data());
        if (this.isMount) {
          this.setState({ classesTeaching });
        }
        this.claRef
          .doc(classTeaching.id)
          .collection("lectures")
          .doc("lecturesToday")
          .onSnapshot((snap) => {
            let { lecturesToday } = this.state;
            if (snap.data()) {
              snap.data().lectures.forEach((l) => {
                classTeaching.data().subjects.forEach((sub) => {
                  if (l.subjectCode === sub.code) {
                    lecturesToday.push({
                      ...l,
                      branch: classTeaching.data().details.branch,
                      sem: classTeaching.data().details.sem,
                      classId: classTeaching.data().details.classId,
                    });
                  }
                });
              });
            }
            if (this.isMount) {
              this.setState({ lecturesToday });
            }
          });
      });
    });
  }

  UNSAFE_componentWillMount() {
    this.isMount = false;
  }

  render() {
    const display = (
      <div className="container-fluid">
        <div className="code-head-btn">
          {/* signout btn */}
          <DarkToggle />
          <h1 className="mainPageHeading mx-auto">Teacher Control Center!</h1>
          <i
            style={{ fontSize: "30px", cursor: "pointer" }}
            onClick={this.handleSignOut}
            className="float-md-right mb-2 fa fa-sign-out"
          />
        </div>
        <h2 id="Details" className="subHeading">
          Your Details:{" "}
        </h2>
        <hr className="mb-4" style={{ margin: "0 auto", width: "18rem" }} />

        <Details details={this.state.details} onEdit={this.handleDetailsEdit} />
        {/* lectures on the day */}
        <h2 id="Lectures" className="subHeading">
          Lectures Today:
        </h2>
        <hr className="mb-4" style={{ margin: "0 auto", width: "18rem" }} />

        <AddLecture
          addLecture={this.addLecture}
          classesTeaching={this.state.classesTeaching}
        />

        <div className="lectures-row">
          {this.state.lecturesToday.length === 0 ? (
            <h4 style={{ textAlign: "center", width: "100%" }}>
              There are no lectures for the day yet!
            </h4>
          ) : (
            this.state.lecturesToday.map((lecture) => (
              <Lecture
                lecture={lecture}
                key={lecture.startTime + lecture.classId}
                onDelete={this.deleteLecture}
              />
            ))
          )}
        </div>

        {/* CLASSES YOU TEACH */}
        <h2 id="Classes" className="subHeading">
          Classes You Teach:
        </h2>
        <hr className="mb-4" style={{ margin: "0 auto", width: "18rem" }} />
        <div className="my-flex-container">
          {this.state.classesTeaching.length === 0 ? (
            <h4 style={{ textAlign: "center", width: "100%" }}>
              No classes are assigned to you yet! Please contact the CR of
              respective class
            </h4>
          ) : (
            this.state.classesTeaching.map((classTeaching) => (
              <Class
                key={classTeaching.details.classId}
                class={classTeaching}
                onShow={() =>
                  this.setState({
                    showDetails: true,
                    classId: classTeaching.details.classId,
                  })
                }
              />
            ))
          )}
        </div>
        <BottomNav paths={["Details", "Lectures", "Classes"]} />
      </div>
    );
    return this.state.showDetails ? (
      <ClassDetails
        classCode={this.state.classId}
        onHide={() =>
          this.setState({
            showDetails: false,
            classId: null,
          })
        }
      />
    ) : (
      display
    );
  }
  // All add functions
  addLecture = (newLecture) => {
    const updatedLecture = {
      subject: newLecture.subjectName,
      subjectCode: newLecture.subjectCode,
      teacher: this.state.details.name,
      link: newLecture.link,
      startTime: newLecture.startTime,
      endTime: newLecture.endTime,
      group: newLecture.group,
      text: newLecture.text,
    };
    this.claRef
      .doc(newLecture.classId)
      .collection("lectures")
      .doc("lecturesToday")
      .update({
        lectures: firebase.firestore.FieldValue.arrayUnion(updatedLecture),
      });
    this.setState({
      lecturesToday: [],
    });
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };
  // All update/edit functions
  handleDetailsEdit = () => {};

  // All delete functions
  deleteLecture = (lecture) => {
    const delLec = {
      subject: lecture.subject,
      subjectCode: lecture.subjectCode,
      teacher: lecture.teacher,
      group: lecture.group,
      link: lecture.link,
      startTime: lecture.startTime,
      endTime: lecture.endTime,
      text: lecture.text,
    };
    this.claRef
      .doc(lecture.classId)
      .collection("lectures")
      .doc("lecturesToday")
      .update({
        lectures: firebase.firestore.FieldValue.arrayRemove(delLec),
      });
    this.setState({
      lecturesToday: [],
    });
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };
}

export default MainPage;
