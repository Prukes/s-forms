import React from "react";
import { Button, ButtonToolbar } from "react-bootstrap";
import { FormQuestionsContext } from "../../contexts/FormQuestionsContext";
import Question from "../Question";
import PropTypes from "prop-types";
import FormUtils from "../../util/FormUtils.js";
import QuestionWrapper from "../QuestionWrapper.jsx";

export default class WizardStep extends React.Component {
  constructor(props) {
    super(props);
  }

  onNextStep = () => {
    this.context.updateFormQuestionsData(
      this.props.index,
      this.context.getFormQuestionsData()
    );
    this.props.onNextStep();
  };

  onPreviousStep = () => {
    this.props.onPreviousStep();
  };

  _renderWizardStepButtons = () => {
    return (
      <ButtonToolbar className="m-3 float-right">
        {!this.props.isFirstStep && (
          <Button
            className="mr-2"
            onClick={this.onPreviousStep}
            variant="primary"
            size="sm"
          >
            {this.props.options.i18n["wizard.previous"]}
          </Button>
        )}
        {!this.props.isLastStep && (
          <Button onClick={this.onNextStep} variant="primary" size="sm">
            {this.props.options.i18n["wizard.next"]}
          </Button>
        )}
      </ButtonToolbar>
    );
  };

  onChange = (index, change) => {
    this.context.updateFormQuestionsData(this.props.index || index, {
      ...this.props.question,
      ...change,
    });
  };

  _mapQuestion(question, index) {
    let component = this.props.mapComponent(question, QuestionWrapper);
    return React.createElement(component, {
      key: question["@id"],
      question: question,
      onChange: this.onChange,
      collapsible: FormUtils.isAnswerable(question),
      index: index,
      cloneQuestion: this.context.cloneQuestion,
      deleteQuestion: this.context.deleteQuestion
    });
  }

  render() {
    const question = this.context.getFormQuestionsData([this.props.index]);
    const component = this._mapQuestion(question, this.props.index);
    return (
      <React.Fragment>
        {/*<Question             //tady se zeptat mira */}
        {/*  question={question}*/}
        {/*  onChange={this.onChange}*/}
        {/*  collapsible={FormUtils.isAnswerable(question)}*/}
        {/*  cloneQuestion={this.context.cloneQuestion}*/}
        {/*/>*/}
        {component}
        {this.props.options.wizardStepButtons &&
          this._renderWizardStepButtons()}
      </React.Fragment>
    );
  }
}

WizardStep.propTypes = {
  options: PropTypes.object.isRequired,
  question: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onNextStep: PropTypes.func,
  onPreviousStep: PropTypes.func,
  mapComponent: PropTypes.func,
  isFirstStep: PropTypes.bool,
  isLastStep: PropTypes.bool,
};

WizardStep.contextType = FormQuestionsContext;
